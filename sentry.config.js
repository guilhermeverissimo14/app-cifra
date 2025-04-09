module.exports = {
    project: 'react-native',
    organization: 'guilherme-0j',
    // Aponte para o caminho correto do seu arquivo raiz
    sourceExt: 'js,jsx,ts,tsx',
    include: ['src/app/_layout.tsx'], // Ajuste conforme o nome do seu arquivo
    url: 'https://sentry.io/',
    authToken: process.env.SENTRY_AUTH_TOKEN,
  };