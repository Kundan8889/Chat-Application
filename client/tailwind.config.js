module.exports = {
  mode: 'jit',  // Add this line to enable JIT mode
  purge: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        'slate-100': '#f1f5f9',  // ensure these values match Tailwind's default if you're extending or customizing
        'slate-200': '#e2e8f0',
      },
    },
  },
  plugins: [],
}
