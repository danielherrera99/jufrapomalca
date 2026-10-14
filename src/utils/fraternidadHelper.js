// Mapa de slugs amigables por ID de Fraternidad
export const SLUG_MAP = {
  // Zona Norte
  'jf-cajamarca': '00000000-6a0f-bb87-d327-e42a6db2fb16',
  'jf-trujillo': '00000000-6a0f-b7c7-d327-e42a6db2fb05',
  'jf-pomalca': '00000000-6a0f-b53a-d327-e42a6db2faf7',
  'jf-piura': '00000000-6a0f-b883-d327-e42a6db2fb0c',

  // Zona Centro
  'jf-huanuco': 'b2f0c9ba-d2a7-4bfe-a020-9ce7a61dd6c7',
  'jf-huanuco-merced': 'd9405d65-8b55-4548-8a83-66433dff1f7f',
  'jf-huanuco-san-antonio': '79dc7f81-47a5-42da-8e71-bfefd67a6a32',
  'jf-pichcus': '5c07eda8-e763-41ee-a10b-67cf5dfd34a0',

  // Lima, Callao y Sur Medio
  'jf-ica-divino-nino': '391a821b-9d24-4aa1-9464-ba4a00c533ca',
  'jf-lima-cristo-salvador': 'f7ddab93-94ae-402c-86fb-4835ac502634',
  'jf-lima-piedad': '8510249c-b988-4577-a941-490bb567f17f',
  'jf-lima-lourdes': 'fedd9095-b3eb-4dea-a429-00582744e1e3',
  'jf-lima-san-gregorio': 'dd8feb67-5070-4e8c-a8eb-62cbe75d785e',
  'jf-lima-chorrillos': '58eb0b60-6fe3-49da-86fc-8ed440daddfc',
  'jf-lima-nana': 'f062be34-2208-4ae7-85e5-20581d1b55ca',
  'jf-lima-virgen-familia': '2b818033-8e22-4687-9d28-bb2609fd5393',

  // Sur y Altiplano
  'jf-arequipa-misericordia': 'f6dad2fe-a2cd-40f2-a695-438108808b9b',
  'jf-arequipa-san-jose': '44a09f28-0259-419a-8249-7da4cf4994c0',
  'jf-cusco-recoleta': 'b022d697-6813-4e44-9a42-2f15cdda9d25',
  'jf-cusco-san-antonio': '25901e14-ee32-4ff7-8a04-ee457c90af90',
  'jf-puno-san-francisco': '5273c5e0-8a99-4357-a263-66cb6d5daefd',
  'jf-puno-san-antonio': '15c53f49-f752-48a1-b4cf-ba8b606d36ab',
  'jf-juliaca-santa-catalina': '9f5f956d-e96d-4cb4-b5e2-9f7443061b8b',
};

// Generador de slug a partir del texto
export const slugify = (text = '') => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// Obtiene el slug de una fraternidad dada
export const getFraternidadSlug = (f) => {
  if (!f) return '';
  const fid = f.id || f._id;
  // Búsqueda inversa en SLUG_MAP
  for (const [slug, id] of Object.entries(SLUG_MAP)) {
    if (id === fid) return slug;
  }
  // Fallback si no está mapeada
  const depSlug = f.departamento ? slugify(f.departamento) : '';
  const nameSlug = slugify(f.nombre || '').replace(/^jufra-?/, '');
  return `jf-${depSlug ? depSlug + '-' : ''}${nameSlug}`;
};

// Determina el enlace hacia la web de la fraternidad
export const getFraternidadUrl = (f) => {
  if (!f) return '/jufra-peru';
  const fid = f.id || f._id;
  const isPomalca = fid === '00000000-6a0f-b53a-d327-e42a6db2faf7' || 
                    (f.nombre || '').toUpperCase().includes('POMALCA');
  
  if (isPomalca) {
    return '/'; // El portal web principal de JUFRA Pomalca
  }

  const slug = getFraternidadSlug(f);
  return `/jufra-peru/${slug}`;
};

// Busca la fraternidad por slug o id
export const findFraternidadBySlug = (fraternidades = [], slug = '') => {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Por ID directo mapeado en SLUG_MAP
  const targetId = SLUG_MAP[normalizedSlug];
  if (targetId) {
    const found = fraternidades.find(f => (f.id === targetId || f._id === targetId));
    if (found) return found;
  }

  // 2. Por ID directo en los objetos
  const byId = fraternidades.find(f => (f.id === slug || f._id === slug));
  if (byId) return byId;

  // 3. Por match del slug generado
  const bySlug = fraternidades.find(f => getFraternidadSlug(f) === normalizedSlug);
  if (bySlug) return bySlug;

  // 4. Por búsqueda parcial de nombre o departamento
  const cleanTerm = normalizedSlug.replace(/^jf-/, '').replace(/-/g, ' ');
  return fraternidades.find(f => {
    const nom = (f.nombre || '').toLowerCase();
    const dep = (f.departamento || '').toLowerCase();
    return nom.includes(cleanTerm) || dep.includes(cleanTerm);
  }) || null;
};
