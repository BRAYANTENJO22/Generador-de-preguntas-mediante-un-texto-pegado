export function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, (match) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
}

function shuffleArray(array) {
    return array.slice().sort(() => Math.random() - 0.5);
}

export function generateLocalExam(text, limit, xssMode) {
    let cleanText = text || '';
    if (xssMode === 'safe') {
        cleanText = sanitizeInput(cleanText);
    }

    let sentences = cleanText.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 8);
    if (sentences.length === 0 && cleanText.trim().length > 0) {
        sentences = [cleanText.trim()];
    }

    const generatedQuestions = [];

    for (let i = 0; i < Math.min(sentences.length, limit); i++) {
        const sentence = sentences[i];
        const words = sentence.split(/\s+/).filter(w => w.length > 3);

        if (words.length > 0) {
            const keyword = words[Math.floor(Math.random() * words.length)];
            const questionText = sentence.replace(keyword, "________");

            generatedQuestions.push({
                id: i + 1,
                question: `Pregunta ${i + 1}: Complete el concepto: "${questionText}"`,
                correctAnswer: keyword,
                options: shuffleArray([keyword, "Concepto Alternativo", "Variable Global", "Parámetro Base"])
            });
        }
    }

    if (generatedQuestions.length === 0) {
        generatedQuestions.push({
            id: 1,
            question: `Pregunta 1: ¿El contenido ingresado abarca el tema principal del texto pegado?`,
            correctAnswer: "Verdadero",
            options: ["Verdadero", "Falso"]
        });
    }

    return generatedQuestions;
}