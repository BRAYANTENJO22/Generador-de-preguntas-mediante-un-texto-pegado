// js/api.js
export async function requestExam(text, limit, xssMode) {
    const response = await fetch('/api/generate-exam', {
        method: 'POST', // 👈 ESTO ES LO QUE ARREGLA EL ERROR 405
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            limit: limit,
            xssMode: xssMode ? 'safe' : 'raw' // Coincide con la línea 31 de tu server.js
        })
    });

    if (!response.ok) {
        throw new Error(`El servidor respondió con el código ${response.status}`);
    }

    return await response.json();
}