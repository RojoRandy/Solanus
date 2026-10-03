import { EventEmitter } from 'events';
import { PdfService } from './pdf.service';

const mockLaunch = jest.fn<Promise<unknown>, unknown[]>();
jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: (...args: unknown[]) => mockLaunch(...args) },
}));

function navegadorFalso() {
  const browser = new EventEmitter() as EventEmitter & Record<string, jest.Mock>;
  browser.newPage = jest.fn().mockResolvedValue({
    setContent: jest.fn(),
    pdf: jest.fn().mockResolvedValue(new Uint8Array([1])),
    close: jest.fn(),
  });
  browser.close = jest.fn();
  return browser;
}

describe('PdfService', () => {
  const launch = mockLaunch;

  beforeEach(() => launch.mockReset());

  it('reutiliza Chromium mientras siga conectado', async () => {
    launch.mockResolvedValue(navegadorFalso());
    const service = new PdfService();

    await service.render('<p>a</p>');
    await service.render('<p>b</p>');

    expect(launch).toHaveBeenCalledTimes(1);
  });

  it('relanza Chromium si el anterior se desconectó', async () => {
    const primero = navegadorFalso();
    launch.mockResolvedValueOnce(primero).mockResolvedValueOnce(navegadorFalso());
    const service = new PdfService();

    await service.render('<p>a</p>');
    primero.emit('disconnected');
    await service.render('<p>b</p>');

    expect(launch).toHaveBeenCalledTimes(2);
  });

  it('reintenta el arranque si el primer launch falló', async () => {
    launch.mockRejectedValueOnce(new Error('sin chromium')).mockResolvedValueOnce(navegadorFalso());
    const service = new PdfService();

    await expect(service.render('<p>a</p>')).rejects.toThrow('sin chromium');
    await expect(service.render('<p>b</p>')).resolves.toBeInstanceOf(Buffer);
  });
});
