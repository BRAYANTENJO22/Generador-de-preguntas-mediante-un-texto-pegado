// js/api.js
// URL base en un solo lugar.
// En local el frontend lo sirve el mismo Express, asi que basta una ruta relativa.
// Si publicas el frontend aparte (Netlify/Vercel), cambia esto por la URL de Render,
// por ejemplo: 'https://tu-backend.onrender.com'
export const API_BASE_URL = '';

export async function requestExam(text, limit, xssMode) {
    const response = await fetch(`${API_BASE_URL}/api/generate-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, limit, xssMode })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.error || `El servidor respondió con el código ${response.status}.`);
    }

    return result.data;
}
