module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Lato', 'sans-serif']
    },
    colors: {
      primary: {
        50: '#eee7d8',
        100: '#dccbb0',
        300: '#c2a575',
        500: '#a87e3a',
        700: '#86652e',
        900: '#654c23'
      },
      red: {
        100: '#ffa988',
        300: '#ff886b',
        500: '#ff513a',
        700: '#db302a',
        900: '#b71d23'
      },
      green: {
        100: '#a0ec8a',
        300: '#79d969',
        500: '#44c13c',
        700: '#2ba52e',
        900: '#1e8a29'
      },
      yellow: {
        100: '#ffe86f',
        300: '#ffde4b',
        500: '#ffcf0f',
        700: '#dbad0a',
        900: '#b78d07'
      },
      blue: {
        500: '#3AA0FF',
      },
      gray: {
        50: '#fafafa',
        100: '#f1f1f1',
        200: '#eaecee',
        300: '#d6dade',
        400: '#a8b0b9',
        500: '#717d8a',
        600: '#4f5b67',
        700: '#373f47',
        800: '#242d35',
        900: '#0c1116'
      },
      base: {
        background: '#F5F5F5',
        white: '#ffff',
        black: '#0000'
      }
    },
    extend: {}
  },
  plugins: [require('@tailwindcss/forms')]
}
