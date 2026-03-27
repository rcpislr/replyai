const path = require('path');

const toPosix = (value) => value.replace(/\\/g, '/');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    toPosix(path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}')),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
