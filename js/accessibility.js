export function initAccessibility() {
    let fontSize = 16;
    const body = document.body;
    const announcer = document.getElementById('a11y-announcer');

    const btnInc = document.getElementById('btn-increase-font');
    if (btnInc) {
        btnInc.addEventListener('click', () => {
            if (fontSize < 22) {
                fontSize += 2;
                document.documentElement.style.fontSize = `${fontSize}px`;
                if (announcer) announcer.textContent = `Fuente aumentada a ${fontSize}px`;
            }
        });
    }

    const btnDec = document.getElementById('btn-decrease-font');
    if (btnDec) {
        btnDec.addEventListener('click', () => {
            if (fontSize > 12) {
                fontSize -= 2;
                document.documentElement.style.fontSize = `${fontSize}px`;
                if (announcer) announcer.textContent = `Fuente reducida a ${fontSize}px`;
            }
        });
    }

    const btnContrast = document.getElementById('btn-toggle-contrast');
    if (btnContrast) {
        btnContrast.addEventListener('click', () => {
            body.classList.toggle('high-contrast');
            if (announcer) announcer.textContent = body.classList.contains('high-contrast') ? "Alto contraste activado" : "Modo normal";
        });
    }

    const btnFocus = document.getElementById('btn-focus-highlight');
    if (btnFocus) {
        btnFocus.addEventListener('click', () => {
            body.classList.toggle('focus-highlight');
            if (announcer) announcer.textContent = body.classList.contains('focus-highlight') ? "Resaltado de foco activado" : "Foco normal";
        });
    }
}