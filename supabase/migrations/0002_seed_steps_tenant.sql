-- ============================================================================
-- STEPS SEGUROS · Seed del primer tenant (STEPS) + catálogo de líneas
-- Migración 0002
-- ============================================================================

insert into public.tenants (
  slug, nombre_comercial, razon_social, nit, subdomain,
  color_primary, color_secondary, color_accent,
  whatsapp_number, contact_email, address, is_active
) values (
  'steps',
  'STEPS SEGUROS',
  'Grupo Step Seguros Ltda',
  '902.049.759-5',
  'steps',
  '#1A1F4E', '#2A3170', '#A8C5A8',
  null,
  'stepsseguros@gmail.com',
  'CR 70B No. 125-03, Bogotá D.C.',
  true
)
on conflict (slug) do nothing;

-- Catálogo de líneas de producto para el tenant STEPS ------------------------
with t as (select id from public.tenants where slug = 'steps')
insert into public.insurance_lines (tenant_id, slug, segment, name, short_description, sort_order)
select t.id, x.slug, x.segment::public.insurance_segment, x.name, x.descr, x.ord
from (values
  -- PERSONAS
  ('vida',            'personas', 'Vida',                   'Protección económica para tu familia ante lo inesperado.', 1),
  ('salud',           'personas', 'Salud',                  'Atención médica y hospitalaria cuando más importa.', 2),
  ('hogar',           'personas', 'Hogar',                  'Tu vivienda y tu contenido, protegidos.', 3),
  ('auto',            'personas', 'Auto',                   'Cobertura integral para tu vehículo.', 4),
  ('rc-personas',     'personas', 'Responsabilidad Civil',  'Respaldo ante daños a terceros.', 5),
  ('discapacidad',    'personas', 'Discapacidad',           'Ingreso protegido ante una incapacidad.', 6),
  ('educativo',       'personas', 'Educativo',              'Asegura el futuro académico de los tuyos.', 7),
  ('viaje',           'personas', 'Viaje',                  'Asistencia y cobertura dentro y fuera del país.', 8),
  ('exequias',        'personas', 'Exequias',               'Servicio exequial para toda la familia.', 9),
  ('mascotas',        'personas', 'Mascotas',               'Salud y responsabilidad para tu mascota.', 10),
  ('arrendamiento',   'personas', 'Arrendamiento',          'Garantía de pago de cánones de arriendo.', 11),
  ('cumplimiento-p',  'personas', 'Cumplimiento',           'Respaldo de obligaciones contractuales.', 12),
  -- EMPRESAS Y COOPERATIVAS
  ('vida-empresarial',   'empresas', 'Vida empresarial',            'Vida grupo para colaboradores.', 1),
  ('salud-colectiva',    'empresas', 'Salud colectiva',             'Planes de salud para tu equipo.', 2),
  ('exequias-empresas',  'empresas', 'Exequias empresas',           'Servicio exequial colectivo.', 3),
  ('cenal',              'empresas', 'CENAL',                       'Cobertura para cooperativas y su base social.', 4),
  ('rc-ambiental',       'empresas', 'Responsabilidad ambiental',   'Respaldo ante daños ambientales.', 5),
  ('ciberseguridad',     'empresas', 'Ciberseguridad',              'Protección ante incidentes cibernéticos.', 6),
  ('riesgos-ingenieria', 'empresas', 'Riesgos de ingeniería',       'Obras, montajes y maquinaria.', 7),
  ('vehiculos-comerciales','empresas','Vehículos comerciales',      'Flotas y vehículos de carga.', 8),
  ('rc-empresas',        'empresas', 'Responsabilidad civil',       'RC empresarial ante terceros.', 9),
  ('propiedad',          'empresas', 'Propiedad',                   'Inmuebles, contenido y lucro cesante.', 10),
  ('d-and-o',            'empresas', 'D&O · Directores y administradores', 'Protección para la alta dirección.', 11),
  ('riesgos-laborales',  'empresas', 'Riesgos laborales',           'ARL y gestión de riesgos ocupacionales.', 12),
  ('cumplimiento-fianzas','empresas','Cumplimiento y fianzas',      'Garantías y fianzas contractuales.', 13),
  ('legales-dian',       'empresas', 'Disposiciones legales DIAN',  'Garantías exigidas por la DIAN.', 14),
  ('transportes',        'empresas', 'Transportes',                 'Mercancía en tránsito nacional e internacional.', 15),
  ('agropecuario',       'empresas', 'Agropecuario',                'Cultivos, ganado y activos del agro.', 16),
  ('credito',            'empresas', 'Crédito',                     'Protección de cartera y crédito comercial.', 17),
  ('garantia-pagos',     'empresas', 'Garantía de pagos',           'Respaldo del pago de obligaciones.', 18)
) as x(slug, segment, name, descr, ord)
cross join t
on conflict (tenant_id, slug) do nothing;
