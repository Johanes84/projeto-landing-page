// Script para a Landing Page HTP Pro

// Contador Regressivo
function updateCountdown() {
    // Valores iniciais (5 horas, 30 minutos, 0 segundos)
    let hoursEl = document.getElementById('countdown-hours');
    let minutesEl = document.getElementById('countdown-minutes');
    let secondsEl = document.getElementById('countdown-seconds');

    if (!hoursEl || !minutesEl || !secondsEl) return;

    let hours = parseInt(hoursEl.textContent);
    let minutes = parseInt(minutesEl.textContent);
    let seconds = parseInt(secondsEl.textContent);

    // Atualiza o contador a cada segundo
    const countdownInterval = setInterval(() => {
        seconds--;

        if (seconds < 0) {
            seconds = 59;
            minutes--;

            if (minutes < 0) {
                minutes = 59;
                hours--;

                if (hours < 0) {
                    // Reinicia o contador quando chegar a zero
                    hours = 5;
                    minutes = 0;
                    seconds = 0;
                }
            }
        }

        // Atualiza os elementos na página
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

// Adicionar contador quando necessário
function addCountdown() {
    // Cria elemento do contador
    const countdownHTML = `
    <div class="countdown">
        <h3 class="countdown-title">OFERTA ESPECIAL TERMINA EM:</h3>
        <div class="countdown-timer">
            <div class="countdown-item">
                <span id="countdown-hours" class="countdown-value">05</span>
                <span class="countdown-label">Horas</span>
            </div>
            <div class="countdown-item">
                <span id="countdown-minutes" class="countdown-value">00</span>
                <span class="countdown-label">Minutos</span>
            </div>
            <div class="countdown-item">
                <span id="countdown-seconds" class="countdown-value">00</span>
                <span class="countdown-label">Segundos</span>
            </div>
        </div>
    </div>`;

    // Adiciona estilos CSS para o contador
    const countdownStyles = `
    <style>
        .countdown {
            background-color: rgba(20, 20, 20, 0.8);
            padding: 15px;
            border-radius: 10px;
            margin: 30px 0;
            border: 1px solid #ffd700;
        }
        
        .countdown-title {
            margin-bottom: 10px;
            color: #ffd700;
        }
        
        .countdown-timer {
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .countdown-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .countdown-value {
            font-size: 1.5rem;
            font-weight: bold;
            background-color: #ffd700;
            color: #000;
            padding: 5px 10px;
            border-radius: 5px;
            min-width: 40px;
        }
        
        .countdown-label {
            font-size: 0.8rem;
            margin-top: 5px;
            color: #ccc;
        }
    </style>`;

    // Adiciona o contador após o header (ou onde for necessário)
    const header = document.querySelector('header');
    if (header) {
        const countdownElement = document.createElement('div');
        countdownElement.innerHTML = countdownHTML;
        header.after(countdownElement);
    }

    // Adiciona os estilos ao head
    const head = document.head;
    const style = document.createElement('style');
    style.innerHTML = countdownStyles;
    head.appendChild(style);

    // Inicia o contador
    updateCountdown();
}

// Rastreamento de cliques em links
function trackClicks() {
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Aqui você pode adicionar seu código de rastreamento
            // Por exemplo, enviar um evento para o Google Analytics
            console.log('Link clicado:', this.href);
            
            // Se você tiver Google Analytics, pode usar algo como:
            /*
            gtag('event', 'click', {
                'event_category': 'Links',
                'event_label': this.href,
                'transport_type': 'beacon'
            });
            */
        });
    });
}

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Descomentar a linha abaixo para adicionar o contador
    // addCountdown();
    
    // Rastrear cliques em links
    trackClicks();
});