// js/ui.js
const STORAGE_KEY = 'local_exam_saved';

export function renderQuestions(questions) {
    // Se busca el contenedor al momento de usarlo, no al cargar el modulo
    const questionsContainer = document.getElementById('questions-container');
    if (!questionsContainer) return;
    questionsContainer.replaceChildren();

    questions.forEach((q) => {
        const qElement = document.createElement('div');
        qElement.className = 'p-3 bg-dark rounded border border-secondary text-light';

        const title = document.createElement('h4');
        title.className = 'h6 text-info fw-bold mb-3';
        title.textContent = q.question;

        const list = document.createElement('ul');
        list.className = 'list-group mb-3';

        q.options.forEach((opt) => {
            const item = document.createElement('li');
            item.className = 'list-group-item bg-transparent text-light border-secondary';

            const label = document.createElement('label');
            label.className = 'w-100 m-0 d-flex align-items-center';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `q_${q.id}`;
            input.value = opt;
            input.className = 'form-check-input me-2';

            const span = document.createElement('span');
            span.textContent = opt;

            label.append(input, span);
            item.appendChild(label);
            list.appendChild(item);
        });

        const answer = document.createElement('div');
        answer.className = 'small text-success fw-semibold';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-circle-check me-1';
        const strong = document.createElement('strong');
        strong.textContent = q.correctAnswer;
        answer.append(icon, ' Respuesta asignada por el modelo: ', strong);

        qElement.append(title, list, answer);
        questionsContainer.appendChild(qElement);
    });
}

// Guarda el examen. Solo contiene texto de preguntas, nada sensible.
export function saveToLocalStorage(questions, timeMs) {
    try {
        const dataToSave = {
            questions,
            timestamp: new Date().toLocaleString(),
            perfTime: timeMs
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        sessionStorage.setItem('last_inference_time', `${timeMs} ms`);
    } catch (e) {
        console.warn('No se pudo acceder a LocalStorage:', e);
    }
}

// Lee lo guardado. Devuelve null si es la primera visita o si el dato esta dañado.
export function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn('No se pudo leer lo guardado:', e);
        return null;
    }
}

export function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('last_inference_time');
    } catch (e) {
        console.warn('No se pudo borrar lo guardado:', e);
    }
}