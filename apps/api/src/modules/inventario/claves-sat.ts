/**
 * Lista curada del catálogo oficial c_ClaveProdServ (catCFDI_V_4_20241204 del SAT)
 * para lo que maneja el comedor. Las descripciones son las oficiales;
 * palabrasClave son términos de búsqueda propios. Si un producto no está,
 * la clave se captura a mano.
 */
export interface ClaveSat {
  clave: string;
  descripcion: string;
  palabrasClave: string;
}

export const CLAVES_SAT: readonly ClaveSat[] = [
  {
    clave: '50221101',
    descripcion: 'Grano de cereal',
    palabrasClave: 'arroz avena maiz grano',
  },
  {
    clave: '50421800',
    descripcion: 'Fríjoles Secos',
    palabrasClave: 'frijol seco',
  },
  {
    clave: '50401800',
    descripcion: 'Fríjoles',
    palabrasClave: 'frijol fresco ejote',
  },
  {
    clave: '50404500',
    descripcion: 'Lentejas',
    palabrasClave: 'lenteja',
  },
  {
    clave: '50407018',
    descripcion: 'Garbanzo',
    palabrasClave: 'garbanzo',
  },
  {
    clave: '50221002',
    descripcion: 'Harina',
    palabrasClave: 'harina trigo maiz',
  },
  {
    clave: '50221300',
    descripcion: 'Harina y productos de molinos',
    palabrasClave: 'harina masa nixtamal molino',
  },
  {
    clave: '50192901',
    descripcion: 'Pasta sencilla o fideos',
    palabrasClave: 'pasta sopa fideo espagueti codito',
  },
  {
    clave: '50192902',
    descripcion: 'Pasta o fideos de repisa',
    palabrasClave: 'pasta seca de repisa sopa fideo',
  },
  {
    clave: '50221201',
    descripcion: 'Cereal caliente o listo para comer',
    palabrasClave: 'cereal avena hojuelas',
  },
  {
    clave: '50181901',
    descripcion: 'Pan fresco',
    palabrasClave: 'pan fresco bolillo telera',
  },
  {
    clave: '50181906',
    descripcion: 'Pan de repisa',
    palabrasClave: 'pan de caja empaquetado',
  },
  {
    clave: '50181903',
    descripcion: 'Galletas sencillas de sal',
    palabrasClave: 'galletas saladas',
  },
  {
    clave: '50181905',
    descripcion: 'Galletas de dulce',
    palabrasClave: 'galletas dulces',
  },
  {
    clave: '50131701',
    descripcion: 'Productos de leche o mantequilla frescos',
    palabrasClave: 'leche fresca crema',
  },
  {
    clave: '50131702',
    descripcion: 'Productos de leche o mantequilla de estante',
    palabrasClave: 'leche ultrapasteurizada larga vida',
  },
  {
    clave: '50131704',
    descripcion: 'Leche en polvo',
    palabrasClave: 'leche en polvo',
  },
  {
    clave: '50131801',
    descripcion: 'Queso natural',
    palabrasClave: 'queso fresco',
  },
  {
    clave: '50131802',
    descripcion: 'Queso procesado',
    palabrasClave: 'queso procesado amarillo',
  },
  {
    clave: '50131612',
    descripcion: 'Huevos en la cascara de gallina',
    palabrasClave: 'huevo blanco rojo',
  },
  {
    clave: '50111515',
    descripcion: 'Pollo, mínimamente procesado sin aditivos',
    palabrasClave: 'pollo',
  },
  {
    clave: '50111513',
    descripcion: 'Carne, mínimamente procesada sin aditivos',
    palabrasClave: 'carne res',
  },
  {
    clave: '50111514',
    descripcion: 'Cerdo, mínimamente procesado sin aditivos',
    palabrasClave: 'cerdo',
  },
  {
    clave: '50112005',
    descripcion: 'Carne, procesada con aditivos',
    palabrasClave: 'embutido jamon salchicha chorizo',
  },
  {
    clave: '50121539',
    descripcion: 'Pescado fresco',
    palabrasClave: 'pescado fresco',
  },
  {
    clave: '50121537',
    descripcion: 'Pescado congelado',
    palabrasClave: 'pescado congelado',
  },
  {
    clave: '50467007',
    descripcion: 'Atún enlatada',
    palabrasClave: 'atun lata',
  },
  {
    clave: '50151513',
    descripcion: 'Aceites vegetales o  de planta comestibles',
    palabrasClave: 'aceite vegetal cocina',
  },
  {
    clave: '50151605',
    descripcion: 'Grasa saturada animal comestibles',
    palabrasClave: 'manteca',
  },
  {
    clave: '50161509',
    descripcion: 'Azucares naturales o productos endulzantes',
    palabrasClave: 'azucar endulzante',
  },
  {
    clave: '50171551',
    descripcion: 'Sal de mesa',
    palabrasClave: 'sal',
  },
  {
    clave: '50171550',
    descripcion: 'Especies o extractos',
    palabrasClave: 'especias pimienta comino oregano',
  },
  {
    clave: '50171831',
    descripcion: 'Salsas para cocinar',
    palabrasClave: 'salsa para cocinar pure tomate',
  },
  {
    clave: '50171902',
    descripcion: 'Condimento',
    palabrasClave: 'condimento consome caldo',
  },
  {
    clave: '50171707',
    descripcion: 'Vinagres',
    palabrasClave: 'vinagre',
  },
  {
    clave: '50193104',
    descripcion: 'Base para sopas',
    palabrasClave: 'consome base para sopa caldo cubo',
  },
  {
    clave: '50192403',
    descripcion: 'Miel',
    palabrasClave: 'miel',
  },
  {
    clave: '50192401',
    descripcion: 'Mermeladas o preservativos de fruta',
    palabrasClave: 'mermelada',
  },
  {
    clave: '50192404',
    descripcion: 'Cristales de gelatina o mermelada',
    palabrasClave: 'gelatina polvo',
  },
  {
    clave: '50406500',
    descripcion: 'Tomates',
    palabrasClave: 'tomate jitomate',
  },
  {
    clave: '50402200',
    descripcion: 'Cebollas de ensalada',
    palabrasClave: 'cebolla',
  },
  {
    clave: '50405700',
    descripcion: 'Papas',
    palabrasClave: 'papa',
  },
  {
    clave: '50402500',
    descripcion: 'Zanahorias',
    palabrasClave: 'zanahoria',
  },
  {
    clave: '50406300',
    descripcion: 'Calabazas',
    palabrasClave: 'calabaza calabacita',
  },
  {
    clave: '50407017',
    descripcion: 'Chayote o guatila',
    palabrasClave: 'chayote',
  },
  {
    clave: '50405600',
    descripcion: 'Pimientos',
    palabrasClave: 'chile pimiento',
  },
  {
    clave: '50404600',
    descripcion: 'Lechugas',
    palabrasClave: 'lechuga',
  },
  {
    clave: '50307024',
    descripcion: 'Pepinos',
    palabrasClave: 'pepino',
  },
  {
    clave: '50401700',
    descripcion: 'Aguacates',
    palabrasClave: 'aguacate',
  },
  {
    clave: '50307025',
    descripcion: 'Platano',
    palabrasClave: 'platano',
  },
  {
    clave: '50301500',
    descripcion: 'Manzanas',
    palabrasClave: 'manzana',
  },
  {
    clave: '50304100',
    descripcion: 'Limones',
    palabrasClave: 'limon',
  },
  {
    clave: '50202301',
    descripcion: 'Agua',
    palabrasClave: 'agua purificada garrafon',
  },
  {
    clave: '50202304',
    descripcion: 'Jugos de repisa',
    palabrasClave: 'jugo envasado',
  },
  {
    clave: '50202306',
    descripcion: 'Refrescos',
    palabrasClave: 'refresco',
  },
  {
    clave: '50201706',
    descripcion: 'Café',
    palabrasClave: 'cafe',
  },
  {
    clave: '50201709',
    descripcion: 'Café instantáneo',
    palabrasClave: 'cafe soluble instantaneo',
  },
  {
    clave: '47131811',
    descripcion: 'Productos de lavandería',
    palabrasClave: 'detergente jabon ropa lavanderia',
  },
  {
    clave: '47131810',
    descripcion: 'Productos para el lavaplatos',
    palabrasClave: 'lavatrastes jabon platos',
  },
  {
    clave: '47131807',
    descripcion: 'Blanqueadores',
    palabrasClave: 'cloro blanqueador',
  },
  {
    clave: '47131803',
    descripcion: 'Desinfectantes para uso doméstico',
    palabrasClave: 'desinfectante pinol fabuloso',
  },
  {
    clave: '47131805',
    descripcion: 'Limpiadores de propósito general',
    palabrasClave: 'limpiador multiusos pinol fabuloso',
  },
  {
    clave: '47131801',
    descripcion: 'Limpiadores de pisos',
    palabrasClave: 'limpiador pisos',
  },
  {
    clave: '47131821',
    descripcion: 'Compuestos desengrasantes',
    palabrasClave: 'desengrasante',
  },
  {
    clave: '47131603',
    descripcion: 'Esponjas',
    palabrasClave: 'esponja fibra',
  },
  {
    clave: '47131604',
    descripcion: 'Escobas',
    palabrasClave: 'escoba',
  },
  {
    clave: '47121701',
    descripcion: 'Bolsas de basura',
    palabrasClave: 'bolsa basura',
  },
  {
    clave: '53131608',
    descripcion: 'Jabones',
    palabrasClave: 'jabon manos tocador',
  },
  {
    clave: '14111704',
    descripcion: 'Papel higiénico',
    palabrasClave: 'papel higienico',
  },
  {
    clave: '14111703',
    descripcion: 'Toallas de papel',
    palabrasClave: 'toalla de papel',
  },
  {
    clave: '14111705',
    descripcion: 'Servilletas de papel',
    palabrasClave: 'servilleta',
  },
  {
    clave: '52151502',
    descripcion: 'Platos desechables para uso doméstico',
    palabrasClave: 'plato desechable unicel',
  },
  {
    clave: '52151504',
    descripcion: 'Tazas o vasos o tapas desechables para uso doméstico',
    palabrasClave: 'vaso desechable',
  },
  {
    clave: '52151503',
    descripcion: 'Cubiertos desechables para uso doméstico',
    palabrasClave: 'cubiertos desechables cuchara tenedor',
  },
  {
    clave: '52151506',
    descripcion: 'Contenedores de alimentos desechables para uso doméstico',
    palabrasClave: 'contenedor desechable charola',
  },
  {
    clave: '15111510',
    descripcion: 'Gas licuado de petróleo',
    palabrasClave: 'gas lp licuado',
  },
  {
    clave: '42132203',
    descripcion: 'Guantes de examen o para procedimientos no quirúrgicos',
    palabrasClave: 'guantes desechables',
  },
];
