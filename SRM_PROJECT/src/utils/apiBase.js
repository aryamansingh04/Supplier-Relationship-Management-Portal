export function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    '/api'
  ).replace(/\/$/, '');
}
