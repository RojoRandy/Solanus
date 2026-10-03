import { EventEmitter } from 'node:events';
import puppeteer, { Browser } from 'puppeteer';
import { PdfService } from './pdf.service';

jest.mock('puppeteer');

const pdfEsperado = Buffer.from('PDF de prueba');

function crearNavegador() {
  const pagina = {
    setContent: jest.fn().mockResolvedValue(undefined),
    pdf: jest.fn().mockResolvedValue(pdfEsperado),
    close: jest.fn().mockResolvedValue(undefined),
  };
  return Object.assign(new EventEmitter(), {
    connected: true,
    newPage: jest.fn().mockResolvedValue(pagina),
    close: jest.fn().mockResolvedValue(undefined),
  });
}

describe('PdfService', () => {
  const lanzar = jest.mocked(puppeteer.launch);
  let servicio: PdfService;

  beforeEach(() => {
    jest.resetAllMocks();
    servicio = new PdfService();
  });

  function prepararLanzamiento(navegador: ReturnType<typeof crearNavegador>) {
    lanzar.mockResolvedValueOnce(navegador as unknown as Browser);
  }

  it('reutiliza un solo navegador en dos renderizados consecutivos', async () => {
    const navegador = crearNavegador();
    prepararLanzamiento(navegador);

    await expect(servicio.render('<p>Primero</p>')).resolves.toEqual(
      pdfEsperado,
    );
    await expect(servicio.render('<p>Segundo</p>')).resolves.toEqual(
      pdfEsperado,
    );

    expect(lanzar).toHaveBeenCalledTimes(1);
    expect(navegador.newPage).toHaveBeenCalledTimes(2);
  });

  it('lanza otro navegador después del evento de desconexión', async () => {
    const navegador = crearNavegador();
    prepararLanzamiento(navegador);
    prepararLanzamiento(crearNavegador());
    await servicio.render('Primero');

    navegador.connected = false;
    navegador.emit('disconnected');

    await expect(servicio.render('Segundo')).resolves.toEqual(pdfEsperado);
    expect(lanzar).toHaveBeenCalledTimes(2);
  });

  it.each(['Connection closed', 'Browser disconnected'])(
    'relanza y devuelve el PDF cuando la primera página falla con %s',
    async (mensaje) => {
      const navegador = crearNavegador();
      navegador.newPage.mockRejectedValueOnce(new Error(mensaje));
      prepararLanzamiento(navegador);
      prepararLanzamiento(crearNavegador());

      await expect(servicio.render('Contenido')).resolves.toEqual(pdfEsperado);
      expect(lanzar).toHaveBeenCalledTimes(2);
      expect(navegador.newPage).toHaveBeenCalledTimes(1);
    },
  );

  it('permite un nuevo lanzamiento tras un rechazo de launch', async () => {
    const error = new Error('No se pudo iniciar Chromium');
    lanzar.mockRejectedValueOnce(error);
    prepararLanzamiento(crearNavegador());

    await expect(servicio.render('Primero')).rejects.toBe(error);
    await expect(servicio.render('Segundo')).resolves.toEqual(pdfEsperado);
    expect(lanzar).toHaveBeenCalledTimes(2);
  });

  it('reemplaza una instancia desconectada aunque no se haya recibido el evento', async () => {
    const navegador = crearNavegador();
    navegador.connected = false;
    prepararLanzamiento(navegador);
    prepararLanzamiento(crearNavegador());

    await expect(servicio.render('Contenido')).resolves.toEqual(pdfEsperado);
    expect(lanzar).toHaveBeenCalledTimes(2);
    expect(navegador.newPage).not.toHaveBeenCalled();
  });

  it('propaga el segundo error de conexión sin intentar una tercera vez', async () => {
    const error = new Error('Connection closed');
    for (let intento = 0; intento < 2; intento++) {
      const navegador = crearNavegador();
      navegador.newPage.mockRejectedValueOnce(error);
      prepararLanzamiento(navegador);
    }

    await expect(servicio.render('Contenido')).rejects.toBe(error);
    expect(lanzar).toHaveBeenCalledTimes(2);
  });

  it('propaga errores ajenos a la conexión sin relanzar', async () => {
    const navegador = crearNavegador();
    const error = new Error('Permiso denegado');
    navegador.newPage.mockRejectedValueOnce(error);
    prepararLanzamiento(navegador);

    await expect(servicio.render('Contenido')).rejects.toBe(error);
    expect(lanzar).toHaveBeenCalledTimes(1);
  });

  it('conserva el navegador nuevo ante una desconexión tardía del anterior', async () => {
    const anterior = crearNavegador();
    anterior.newPage.mockRejectedValueOnce(new Error('Connection closed'));
    prepararLanzamiento(anterior);
    prepararLanzamiento(crearNavegador());
    await servicio.render('Primero');

    anterior.emit('disconnected');

    await expect(servicio.render('Segundo')).resolves.toEqual(pdfEsperado);
    expect(lanzar).toHaveBeenCalledTimes(2);
  });
});
