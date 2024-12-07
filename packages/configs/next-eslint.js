/* Custom ESLint configuration for use with Next.js apps. */
module.exports = {
    extends: [
      'eslint-config-next',
      '@vercel/style-guide/eslint/react',
      // ...your other ESLint configurations
    ].map(require.resolve),
    // ...your other configuration
  };