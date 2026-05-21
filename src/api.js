const BASE = import.meta.env.VITE_API_URL ?? '';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('genepaw_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ detail: resp.statusText }));
    const err = new Error(body.detail ?? resp.statusText);
    err.status = resp.status;
    err.body = body;
    throw err;
  }
  return resp.json();
}
