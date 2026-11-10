// js/main.js
import { initAccessibility } from './accessibility.js';
import { requestExam } from './api.js';
import { generateLocalExam } from './generator.js';
import { renderQuestions, saveToLocalStorage, loadFromLocalStorage, clearStorage } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentQuestions = [];

    try {
        initAccessibility();
    } catch (err) {
        console.error('Error al inicializar accesibilidad:', err);
    }

    const examForm = document.getElementById('exam-form');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsSection = document.getElementById('results-section');
    const perfTime = document.getElementById('perf-time');
    const questionsContainer = document.getElementById('questions-container');
    const statusMessage = document.getElementById('status-message');
    const submitButton = examForm ? examForm.querySelector('button[type="submit"]') : null;

    // Mensajes visibles en pantalla (reemplazan a alert)
    function showMessage(text, type = 'danger') {
        if (!statusMessage) return;
        statusMessage.textContent = text;
        statusMessage.className = `alert alert-${type}`;
    }

    function hideMessage() {
        if (!statusMessage) return;
        statusMessage.textContent = '';
        statusMessage.className = 'd-none';
    }

    function showResults(questions, timeText) {
        renderQuestions(questions);
        if (perfTime) perfTime.textContent = timeText;
        if (resultsSection) resultsSection.classList.remove('d-none');
    }

    // Restaurar el ultimo examen guardado (maneja null en la primera visita)
    const saved = loadFromLocalStorage();
    if (saved && Array.isArray(saved.questions) && saved.questions.length > 0) {
        currentQuestions = saved.questions;
        showResults(currentQuestions, `${saved.perfTime} ms`);
        showMessage(`Se restauró tu último examen guardado (${saved.timestamp}).`, 'info');
    }

    if (examForm) {
        examForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage();

            const textInput = document.getElementById('text-input');
            const numQuestionsSelect = document.getElementById('num-questions');
            const xssSelect = document.getElementById('xss-protection');

            const rawText = textInput ? textInput.value.trim() : '';
            const numQuestions = numQuestionsSelect ? parseInt(numQuestionsSelect.value, 10) : 5;
            const xssMode = xssSelect ? xssSelect.value : 'safe';

            if (!rawText) {
                showMessage('Por favor, ingresa un texto antes de generar el examen.', 'warning');
                return;
            }

            if (resultsSection) resultsSection.classList.add('d-none');
            if (loadingSpinner) loadingSpinner.classList.remove('d-none');
            if (submitButton) submitButton.disabled = true;

            const startTime = performance.now();

            try {
                // Se llama al backend con fetch + async/await
                currentQuestions = await requestExam(rawText, numQuestions, xssMode);
                const executionTime = (performance.now() - startTime).toFixed(2);

                showResults(currentQuestions, `${executionTime} ms`);
                saveToLocalStorage(currentQuestions, executionTime);
                showMessage('Examen generado correctamente.', 'success');

                if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error('Error al consultar el servidor:', error);

                // Respaldo: si el servidor no responde, se genera en el navegador
                if (error instanceof TypeError) {
                    currentQuestions = generateLocalExam(rawText, numQuestions, xssMode);
                    const executionTime = (performance.now() - startTime).toFixed(2);
                    showResults(currentQuestions, `${executionTime} ms`);
                    saveToLocalStorage(currentQuestions, executionTime);
                    showMessage('No hubo conexión con el servidor; el examen se generó en el navegador.', 'warning');
                } else {
                    showMessage(`No se pudo generar el examen: ${error.message}`, 'danger');
                }
            } finally {
                if (loadingSpinner) loadingSpinner.classList.add('d-none');
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    // Exportar TXT
    document.getElementById('btn-export-txt')?.addEventListener('click', () => {
        if (currentQuestions.length === 0) {
            showMessage('No hay ninguna evaluación para exportar.', 'warning');
            return;
        }
        let fileContent = 'EXAMEN GENERADO - UNISANGIL\n\n';
        currentQuestions.forEach((q, idx) => {
            fileContent += `${idx + 1}. ${q.question}\n`;
            q.options.forEach((opt) => { fileContent += `   [ ] ${opt}\n`; });
            fileContent += `   --> Respuesta Correcta: ${q.correctAnswer}\n\n`;
        });
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Examen_${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    });

    // Imprimir
    document.getElementById('btn-export-print')?.addEventListener('click', () => window.print());

    // Borrar guardado
    document.getElementById('btn-clear-storage')?.addEventListener('click', () => {
        clearStorage();
        currentQuestions = [];
        if (questionsContainer) questionsContainer.replaceChildren();
        if (resultsSection) resultsSection.classList.add('d-none');
        showMessage('Historial de examen borrado correctamente.', 'success');
    });
});