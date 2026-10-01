// Single source of truth for talking to the backend.
// Set NEXT_PUBLIC_API_URL in .env.local for other environments.
export const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function api(path, { method = 'GET', body, token } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Try to parse JSON even on errors so we can surface the server message.
    let data = null;
    const text = await res.text();
    if (text) {
        try { data = JSON.parse(text); } catch { data = { error: text }; }
    }

    if (!res.ok) {
        const message = (data && (data.error || data.msg)) || `Request failed (${res.status})`;
        const err = new Error(message);
        err.status = res.status;
        throw err;
    }
    return data;
}
