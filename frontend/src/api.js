const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = RAW_API_URL.replace(/\/+$/, "");

export async function request(path, { token, ...options } = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_URL}${normalizedPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}
