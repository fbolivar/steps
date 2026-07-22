import type { Config } from 'tailwindcss'

/**
 * Tokens de marca STEPS SEGUROS — estilo "insurance business" (referencia Dignity).
 * Paleta teal (verde azulado) por tenant vía variables CSS + escala neutra "ink"
 * para texto/bordes. El mismo build sirve a cualquier tenant de marca blanca.
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
        },
        // Neutros (texto, bordes, superficies). Mantengo el nombre "navy" por
        // compatibilidad con componentes existentes, repuntado a tinta neutra.
        navy: {
          DEFAULT: '#1A211F',
          600: '#41504B',
          900: '#121815',
        },
        // Fondos suaves de sección (gris muy claro cálido, como Dignity).
        mist: '#F4F5F2',
        sage: { DEFAULT: '#A8C5A8', light: '#C7DBC7' },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 10px 40px -12px rgb(18 24 21 / 0.12)',
        soft: '0 4px 20px -8px rgb(18 24 21 / 0.10)',
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
