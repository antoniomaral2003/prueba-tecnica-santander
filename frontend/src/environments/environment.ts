export const environment = {
  production: true,
  apiUrl: (window as any)['env']?.['apiUrl'] || 'https://candidates-api-xdw5.onrender.com/candidates'
};
