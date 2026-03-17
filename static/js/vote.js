let voterEmail = null;
let selectedProfessional = null;
let selectedLeader = null;
let votingLocked = false;

const carousels = {
    professional: { currentIndex: 0, slides: [] },
    leader: { currentIndex: 0, slides: [] }
};

// ---------- Countdown ----------
function updateCountdown() {
    const now = new Date().getTime();
    const distance = endDate - now;
    if (distance < 0) {
        document.getElementById('countdown').innerHTML = 'VOTAÇÃO ENCERRADA';
        setTimeout(() => location.reload(), 2000);
        return;
    }
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    let t = '';
    if (days > 0) t += `${days}d `;
    t += `${hours}h ${minutes}m ${seconds}s`;
    document.getElementById('countdown').innerHTML = t;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Selection Display ----------
function updateSelectionDisplay() {
    const profSpan = document.getElementById('selectedProfessional');
    const leaderSpan = document.getElementById('selectedLeader');
    const submitBtn = document.getElementById('submitVotesBtn');
    const warning = document.getElementById('selectionWarning');

    profSpan.textContent = selectedProfessional ? selectedProfessional.name : 'Nenhum selecionado';
    profSpan.className = selectedProfessional ? 'text-success fw-bold' : 'text-muted';

    leaderSpan.textContent = selectedLeader ? selectedLeader.name : 'Nenhum selecionado';
    leaderSpan.className = selectedLeader ? 'text-success fw-bold' : 'text-muted';

    // Require both categories when both exist
    const needsProf = hasProfessional && !selectedProfessional;
    const needsLeader = hasLeader && !selectedLeader;
    const hasAnySelection = selectedProfessional || selectedLeader;
    const canSubmit = !needsProf && !needsLeader && hasAnySelection;

    submitBtn.style.display = canSubmit ? 'block' : 'none';

    if (hasAnySelection && !canSubmit) {
        warning.style.display = 'block';
        if (needsProf && needsLeader) {
            warning.textContent = 'Selecione um candidato em cada categoria para finalizar.';
        } else if (needsProf) {
            warning.textContent = 'Falta selecionar um candidato na categoria Profissional.';
        } else if (needsLeader) {
            warning.textContent = 'Falta selecionar um candidato na categoria Líder.';
        }
    } else {
        warning.style.display = 'none';
    }
}

function updateSelectionStates() {
    document.querySelectorAll('.candidate-card').forEach(card => card.classList.remove('selected'));

    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.classList.remove('btn-claro');
        btn.classList.add('btn-outline-claro');
        btn.textContent = 'Selecionar';
    });

    if (selectedProfessional) {
        document.querySelectorAll(`.candidate-card[data-id="${selectedProfessional.id}"][data-category="professional"]`)
            .forEach(c => c.classList.add('selected'));
        document.querySelectorAll(`.select-btn[data-id="${selectedProfessional.id}"][data-category="professional"]`)
            .forEach(btn => {
                btn.classList.remove('btn-outline-claro');
                btn.classList.add('btn-claro');
                btn.textContent = '✓ Selecionado';
            });
    }

    if (selectedLeader) {
        document.querySelectorAll(`.candidate-card[data-id="${selectedLeader.id}"][data-category="leader"]`)
            .forEach(c => c.classList.add('selected'));
        document.querySelectorAll(`.select-btn[data-id="${selectedLeader.id}"][data-category="leader"]`)
            .forEach(btn => {
                btn.classList.remove('btn-outline-claro');
                btn.classList.add('btn-claro');
                btn.textContent = '✓ Selecionado';
            });
    }
}

// ---------- Attach button events ----------
function attachSelectButtons() {
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (votingLocked) return;
            const id = this.dataset.id;
            const name = this.dataset.nome;
            const cat = this.dataset.category;

            if (cat === 'professional') {
                selectedProfessional = (selectedProfessional && selectedProfessional.id === id) ? null : { id, name };
            } else if (cat === 'leader') {
                selectedLeader = (selectedLeader && selectedLeader.id === id) ? null : { id, name };
            }

            updateSelectionDisplay();
            updateSelectionStates();
        });
    });
}

// ---------- Carousels ----------
function updateCarousel(category) {
    const { slides, currentIndex } = carousels[category];
    slides.forEach((slide, i) => {
        slide.classList.remove('active', 'prev');
        if (i === currentIndex) slide.classList.add('active');
        else if (i < currentIndex) slide.classList.add('prev');
    });

    const indicators = document.querySelectorAll(`#${category}Indicators .indicator`);
    indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentIndex));

    const counter = document.getElementById(`${category}Counter`);
    if (counter) counter.textContent = `${currentIndex + 1} / ${slides.length}`;

    updateSelectionStates();
}

function navigateCarousel(category, dir) {
    const c = carousels[category];
    const next = c.currentIndex + dir;
    if (next >= 0 && next < c.slides.length) {
        c.currentIndex = next;
        updateCarousel(category);
    }
}

function initCarousels() {
    ['professional', 'leader'].forEach(category => {
        const wrapper = document.getElementById(`${category}Carousel`);
        if (!wrapper) return;

        carousels[category].slides = Array.from(wrapper.querySelectorAll('.carousel-slide'));

        const counter = document.getElementById(`${category}Counter`);
        if (counter && carousels[category].slides.length > 0) {
            counter.textContent = `1 / ${carousels[category].slides.length}`;
        }

        document.querySelectorAll(`.carousel-prev[data-category="${category}"]`)
            .forEach(btn => btn.addEventListener('click', () => navigateCarousel(category, -1)));
        document.querySelectorAll(`.carousel-next[data-category="${category}"]`)
            .forEach(btn => btn.addEventListener('click', () => navigateCarousel(category, 1)));

        const indicators = document.getElementById(`${category}Indicators`);
        if (indicators) {
            indicators.querySelectorAll('.indicator').forEach((ind, i) => {
                ind.addEventListener('click', () => {
                    carousels[category].currentIndex = i;
                    updateCarousel(category);
                });
            });
        }

        let touchStartX = 0;
        wrapper.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        wrapper.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) navigateCarousel(category, diff > 0 ? 1 : -1);
        }, { passive: true });
    });
}

// ---------- Email Validation ----------
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('voterEmail');
    if (saved) document.getElementById('voterEmail').value = saved;
    attachSelectButtons();
});

document.getElementById('validateEmailBtn').addEventListener('click', async () => {
    const emailInput = document.getElementById('voterEmail');
    const emailError = document.getElementById('emailError');
    const btnText = document.getElementById('validateBtnText');
    const btnSpinner = document.getElementById('validateBtnSpinner');
    const email = emailInput.value.trim().toLowerCase();

    emailError.style.display = 'none';

    if (!email) {
        emailError.textContent = 'Por favor, insira seu e-mail.';
        emailError.style.display = 'block';
        return;
    }
    if (!email.endsWith('@claro.com.br')) {
        emailError.textContent = 'Use um e-mail corporativo @claro.com.br.';
        emailError.style.display = 'block';
        return;
    }

    // Show loading
    btnText.textContent = 'Verificando...';
    btnSpinner.style.display = 'inline-block';
    document.getElementById('validateEmailBtn').disabled = true;

    try {
        const res = await fetch('/api/check-voter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (!data.success) {
            emailError.textContent = data.error || 'Erro ao verificar e-mail.';
            emailError.style.display = 'block';
            resetValidateBtn();
            return;
        }

        const votedProf = data.voted_professional;
        const votedLeader = data.voted_leader;

        // Both categories already voted — block re-entry
        if (votedProf && votedLeader) {
            document.querySelector('.email-section').style.display = 'none';
            document.getElementById('alreadyVotedSection').style.display = 'block';
            return;
        }

        // Proceed to voting
        voterEmail = email;
        localStorage.setItem('voterEmail', email);

        document.querySelector('.email-section').style.display = 'none';
        const votingSection = document.getElementById('votingSection');
        votingSection.style.display = 'block';

        initCarousels();
        window.scrollTo({ top: votingSection.offsetTop - 100, behavior: 'smooth' });

    } catch (err) {
        emailError.textContent = 'Erro de conexão. Tente novamente.';
        emailError.style.display = 'block';
        resetValidateBtn();
    }
});

function resetValidateBtn() {
    document.getElementById('validateBtnText').textContent = 'Validar E-mail';
    document.getElementById('validateBtnSpinner').style.display = 'none';
    document.getElementById('validateEmailBtn').disabled = false;
}

// ---------- Submit ----------
document.getElementById('submitVotesBtn').addEventListener('click', () => {
    document.getElementById('confirmProfessional').textContent = selectedProfessional ? selectedProfessional.name : 'Não selecionado';
    document.getElementById('confirmLeader').textContent = selectedLeader ? selectedLeader.name : 'Não selecionado';
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
});

document.getElementById('confirmVoteBtn').addEventListener('click', async () => {
    if (!voterEmail || (!selectedProfessional && !selectedLeader)) {
        alert('Dados de votação inválidos.');
        return;
    }

    // Lock everything immediately to prevent double-clicks
    votingLocked = true;
    setConfirmBtnLoading(true);
    document.getElementById('cancelVoteBtn').disabled = true;
    document.getElementById('modalCloseBtn').disabled = true;

    try {
        if (selectedProfessional) {
            const res = await fetch('/submit-vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: voterEmail, candidate_id: parseInt(selectedProfessional.id) })
            });
            const data = await res.json();
            if (!data.success) {
                showVoteError(data.error || 'Erro ao registrar voto profissional.');
                return;
            }
        }

        if (selectedLeader) {
            const res = await fetch('/submit-vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: voterEmail, candidate_id: parseInt(selectedLeader.id) })
            });
            const data = await res.json();
            if (!data.success) {
                showVoteError(data.error || 'Erro ao registrar voto líder.');
                return;
            }
        }

        // Success — redirect
        window.location.href = '/results';

    } catch (err) {
        showVoteError('Erro de conexão: ' + err.message);
    }
});

function setConfirmBtnLoading(loading) {
    const btn = document.getElementById('confirmVoteBtn');
    const text = document.getElementById('confirmBtnText');
    const spinner = document.getElementById('confirmBtnSpinner');
    btn.disabled = loading;
    text.textContent = loading ? 'Registrando votos...' : 'Confirmar Votos';
    spinner.style.display = loading ? 'inline-block' : 'none';
}

function showVoteError(msg) {
    votingLocked = false;
    setConfirmBtnLoading(false);
    document.getElementById('cancelVoteBtn').disabled = false;
    document.getElementById('modalCloseBtn').disabled = false;
    alert('Erro: ' + msg);
}
