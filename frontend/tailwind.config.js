/** @type {import('tailwindcss').Config} */
function v(name) {
  return `var(--${name})`;
}

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: v('border'),
        input: v('input'),
        ring: v('ring'),
        background: v('background'),
        foreground: v('foreground'),
        primary: {
          DEFAULT: v('primary'),
          foreground: v('primary-foreground'),
        },
        secondary: {
          DEFAULT: v('secondary'),
          foreground: v('secondary-foreground'),
        },
        destructive: {
          DEFAULT: v('destructive'),
          foreground: v('destructive-foreground'),
        },
        muted: {
          DEFAULT: v('muted'),
          foreground: v('muted-foreground'),
        },
        accent: {
          DEFAULT: v('accent'),
          foreground: v('accent-foreground'),
        },
        popover: {
          DEFAULT: v('popover'),
          foreground: v('popover-foreground'),
        },
        card: {
          DEFAULT: v('card'),
          foreground: v('card-foreground'),
        },
        'booking-blue': v('booking-blue'),
        'booking-blue-dark': v('booking-blue-dark'),
        'booking-yellow': v('booking-yellow'),
        'booking-orange': v('booking-orange'),
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    },
  },
  plugins: [],
};
