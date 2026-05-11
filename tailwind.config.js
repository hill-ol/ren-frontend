/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pk: {
          bg:           '#FDF0F4',
          sidebar:      '#F8E4EC',
          surface:      '#FFFFFF',
          surface2:     '#FDF7F9',
          border:       '#F0D0DC',
          border2:      '#E8C0D0',
          accent:       '#C4607A',
          'accent-lt':  '#FCEEF3',
          'accent-dk':  '#8B3050',
          text:         '#2A1520',
          text2:        '#7A5060',
          text3:        '#B890A0',
        },
        agent: {
          lex:      '#4A7FB5',
          'lex-bg': '#EEF4FB',
          sol:      '#4A9B6F',
          'sol-bg': '#EEF7F2',
          cleo:     '#B57A30',
          'cleo-bg':'#FBF5EE',
          sage:     '#6A4AB5',
          'sage-bg':'#F3EEFB',
          arc:      '#B54A70',
          'arc-bg': '#FBF0F4',
          ren:      '#7A6050',
          'ren-bg': '#F7F2F0',
        },
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};