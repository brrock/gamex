/* Custom ESLint configuration for use with Next.js apps. */
module.exports = {
    extends: [
      '@vercel/style-guide/eslint',
  ].map(require.resolve),
  rules: {
    'turbo/no-undeclared-env-vars': 'off'  
  }
  };