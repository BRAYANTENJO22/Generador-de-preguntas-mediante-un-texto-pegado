import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

function sanitizeServerInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, (match) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
}

app.post('/api/generate-exam', (req, res) => {
    try {
        const { text, limit, xssMode } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'El contenido de texto no puede estar vacío.' });
        }

        let cleanText = text;
        if (xssMode === 'safe') {
            cleanText = sanitizeServerInput(text);
        }

        const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
        const generatedQuestions = [];
        const maxQuestions = limit ? parseInt(limit) : 5;

        for (let i = 0; i < Math.min(sentences.length, maxQuestions); i++) {
            const sentence = sentences[i].trim();
            const words = sentence.split(' ').filter(w => w.length > 4);

            if (words.length > 0) {
                const keyword = words[Math.floor(Math.random() * words.length)];
                const questionText = sentence.replace(keyword, "________");

                generatedQuestions.push({
                    id: i + 1,
                    question: `Pregunta ${i + 1}: Complete el concepto: "${questionText}"`,
                    correctAnswer: keyword,
                    options: [keyword, "Concepto Alternativo", "Variable Global", "Parámetro Base"].sort(() => Math.random() - 0.5)
                });
            }
        }

        return res.status(200).json({ status: 'success', data: generatedQuestions });
    } catch (error) {
        return res.status(500).json({ error: 'Error interno en el servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Express listo en http://localhost:${PORT}`);
}); 