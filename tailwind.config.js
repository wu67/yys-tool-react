/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          0: '#000',
          1: '#111',
          2: '#222',
          3: '#333',
          4: '#444',
          5: '#555',
          6: '#666',
          7: '#777',
          8: '#888',
          9: '#999',
          a: '#aaa',
          b: '#bbb',
          c: '#ccc',
          d: '#ddd',
          e: '#eee',
          f: '#fff',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
