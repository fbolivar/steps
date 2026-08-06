import type { Config } from 'tailwindcss'

/**
 * Tokens de marca — MANUAL DE IDENTIDAD STEPS SEGUROS.
 *
 * Paleta oficial (4 colores, nada mas):
 *   Azul profundo  #000831  — color principal (confianza, estabilidad, respaldo)
 *   Cobalt blue    #2F5AA6  — complementario (dinamismo, experticia)
 *   Gris azulado   #D3DDDD  — principal secundario (calma, cercania)
 *   Blanco puro    #FFFFFF  — complementario (claridad, transparencia)
 *
 * Los tonos con sufijo numerico son TINTES DERIVADOS de esos cuatro (hover,
 * bordes, superficies). No introducen matices nuevos: son mezclas con blanco o
 * con el azul profundo.
 *
 * Tipografia: Bebas Neue (titulares) + Montserrat (cuerpo).
 *
 * Los tokens `brand.*` se resuelven por variables CSS para el theming de marca
 * blanca: cada tenant puede sobreescribirlos en <html>.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
          accent: 'rgb(var(--brand-accent) / <alpha-value>)',
          /** Gris azulado: acentos legibles sobre fondos oscuros. */
          soft: 'rgb(var(--brand-soft) / <alpha-value>)',
        },
        // Azul profundo de marca. Es la tinta de texto y el fondo oscuro.
        navy: {
          DEFAULT: '#000831',
          900: '#000831',
          800: '#0A1240',
          700: '#151E4E',
          600: '#3B4468',
          400: '#6B7290',
        },
        // Cobalt blue de marca + tintes de estado.
        cobalt: {
          DEFAULT: '#2F5AA6',
          700: '#1F3E77',
          600: '#26497F',
          400: '#6C8CC6',
          200: '#C5D3EB',
          100: '#EAF0F9',
        },
        // Gris azulado de marca + tintes de superficie.
        steel: {
          DEFAULT: '#D3DDDD',
          dark: '#B4C3C3',
          light: '#E6ECEC',
        },
        /** Fondo suave de seccion: gris azulado muy diluido sobre blanco. */
        mist: '#F2F6F6',
      },
      fontFamily: {
        // Titulares y cifras: Bebas Neue (condensada, solo mayusculas).
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        heading: ['var(--font-display)', 'Impact', 'sans-serif'],
        // Cuerpo e interfaz: Montserrat.
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '0.02em',
        wordmark: '0.42em',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        // Sombras tintadas con el azul profundo (nunca gris neutro).
        card: '0 18px 45px -18px rgb(0 8 49 / 0.28)',
        soft: '0 6px 22px -10px rgb(0 8 49 / 0.18)',
        cobalt: '0 14px 34px -14px rgb(47 90 166 / 0.55)',
      },
      backgroundImage: {
        /**
         * Degradado de marca (portadas del manual). SOLO usa los dos azules
         * oficiales y los lee de las variables del tenant: nada de tonos
         * inventados ni hex fijos.
         */
        'brand-gradient':
          'linear-gradient(135deg, rgb(var(--brand-accent)) 0%, rgb(var(--brand-primary)) 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, rgb(var(--brand-soft) / 0.55) 0%, #FFFFFF 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
