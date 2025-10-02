
let voterEmail = null;
let selectedProfessional = null;
let selectedLeader = null;

// Carousel state
const carousels = {
    professional: { currentIndex: 0, slides: [] },
    leader: { currentIndex: 0, slides: [] }
};

function updateCountdown() {
    const now = new Date().getTime();
    const distance = endDate - now;
    
    if (distance < 0) {
        document.getElementById('countdown').innerHTML = 'VOTAÇÃO ENCERRADA';
        setTimeout(() => location.reload(), 2000);
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    let countdownText = '';
    if (days > 0) countdownText += `${days}d `;
    countdownText += `${hours}h ${minutes}m ${seconds}s`;
    
    document.getElementById('countdown').innerHTML = countdownText;
}

function updateSelectionDisplay() {
    const professionalSpan = document.getElementById('selectedProfessional');
    const leaderSpan = document.getElementById('selectedLeader');
    const submitBtn = document.getElementById('submitVotesBtn');
    
    professionalSpan.textContent = selectedProfessional ? selectedProfessional.name : 'Nenhum selecionado';
    leaderSpan.textContent = selectedLeader ? selectedLeader.name : 'Nenhum selecionado';
    
    if (professionalSpan.textContent === 'Nenhum selecionado') {
        professionalSpan.className = 'text-muted';
    } else {
        professionalSpan.className = 'text-success fw-bold';
    }
    
    if (leaderSpan.textContent === 'Nenhum selecionado') {
        leaderSpan.className = 'text-muted';
    } else {
        leaderSpan.className = 'text-success fw-bold';
    }
    
    if (selectedProfessional || selectedLeader) {
        submitBtn.style.display = 'block';
    } else {
        submitBtn.style.display = 'none';
    }
}

function updateCarousel(category) {
    const carousel = carousels[category];
    const slides = carousel.slides;
    
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev');
        if (index === carousel.currentIndex) {
            slide.classList.add('active');
        } else if (index < carousel.currentIndex) {
            slide.classList.add('prev');
        }
    });
    
    // Update indicators
    const indicatorsContainer = document.getElementById(`${category}Indicators`);
    if (indicatorsContainer) {
        const indicators = indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            if (index === carousel.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    updateSelectionStates();
}

function updateSelectionStates() {
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.className = 'btn btn-outline-claro w-100 select-btn';
        btn.textContent = 'Selecionar';
    });
    
    if (selectedProfessional) {
        // Update both desktop grid and mobile carousel
        const cards = document.querySelectorAll(`[data-id="${selectedProfessional.id}"][data-category="professional"] .candidate-card, .candidate-card[data-id="${selectedProfessional.id}"][data-category="professional"]`);
        const btns = document.querySelectorAll(`[data-id="${selectedProfessional.id}"][data-category="professional"] .select-btn, .select-btn[data-id="${selectedProfessional.id}"][data-category="professional"]`);
        
        cards.forEach(card => card.classList.add('selected'));
        btns.forEach(btn => {
            btn.className = 'btn btn-claro w-100 select-btn';
            btn.textContent = '✓ Selecionado';
        });
    }
    
    if (selectedLeader) {
        // Update both desktop grid and mobile carousel
        const cards = document.querySelectorAll(`[data-id="${selectedLeader.id}"][data-category="leader"] .candidate-card, .candidate-card[data-id="${selectedLeader.id}"][data-category="leader"]`);
        const btns = document.querySelectorAll(`[data-id="${selectedLeader.id}"][data-category="leader"] .select-btn, .select-btn[data-id="${selectedLeader.id}"][data-category="leader"]`);
        
        cards.forEach(card => card.classList.add('selected'));
        btns.forEach(btn => {
            btn.className = 'btn btn-claro w-100 select-btn';
            btn.textContent = '✓ Selecionado';
        });
    }
}

function initCarousels() {
    ['professional', 'leader'].forEach(category => {
        const wrapper = document.getElementById(`${category}Carousel`);
        if (!wrapper) return;
        
        carousels[category].slides = Array.from(wrapper.querySelectorAll('.carousel-slide'));
        
        // Navigation buttons
        document.querySelectorAll(`.carousel-prev[data-category="${category}"]`).forEach(btn => {
            btn.addEventListener('click', () => navigateCarousel(category, -1));
        });
        
        document.querySelectorAll(`.carousel-next[data-category="${category}"]`).forEach(btn => {
            btn.addEventListener('click', () => navigateCarousel(category, 1));
        });
        
        // Indicator clicks
        const indicatorsContainer = document.getElementById(`${category}Indicators`);
        if (indicatorsContainer) {
            indicatorsContainer.querySelectorAll('.indicator').forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    carousels[category].currentIndex = index;
                    updateCarousel(category);
                });
            });
        }
        
        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        wrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe(category);
        });
        
        function handleSwipe(cat) {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next
                    navigateCarousel(cat, 1);
                } else {
                    // Swipe right - prev
                    navigateCarousel(cat, -1);
                }
            }
        }
        
        // Double tap to select on mobile
        let lastTap = 0;
        wrapper.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                const activeSlide = carousels[category].slides[carousels[category].currentIndex];
                const selectBtn = activeSlide.querySelector('.select-btn');
                if (selectBtn) {
                    selectBtn.click();
                    
                    // Auto-navigate to next category on mobile after selection
                    if (window.innerWidth <= 992) {
                        setTimeout(() => {
                            if (category === 'professional' && carousels['leader'].slides.length > 0) {
                                document.querySelector('h4:contains("Líder")').scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 500);
                    }
                }
            }
            
            lastTap = currentTime;
        });
    });
}

function navigateCarousel(category, direction) {
    const carousel = carousels[category];
    const newIndex = carousel.currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < carousel.slides.length) {
        carousel.currentIndex = newIndex;
        updateCarousel(category);
    }
}

updateCountdown();
setInterval(updateCountdown, 1000);

document.getElementById('emailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('voterEmail').value.trim().toLowerCase();
    
    if (!email.endsWith('@claro.com.br')) {
        alert('Por favor, use um e-mail corporativo @claro.com.br');
        return;
    }
    
    voterEmail = email;
    document.getElementById('emailForm').style.display = 'none';
    document.getElementById('votingSection').style.display = 'block';
    
    initCarousels();
    
    window.scrollTo({ top: document.getElementById('votingSection').offsetTop - 100, behavior: 'smooth' });
});

document.querySelectorAll('.select-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.card.candidate-card');
        const candidateId = this.dataset.id;
        const candidateName = this.dataset.nome;
        const category = this.dataset.category;
        
        if (category === 'professional') {
            if (selectedProfessional && selectedProfessional.id === candidateId) {
                selectedProfessional = null;
            } else {
                selectedProfessional = { id: candidateId, name: candidateName };
            }
        } else if (category === 'leader') {
            if (selectedLeader && selectedLeader.id === candidateId) {
                selectedLeader = null;
            } else {
                selectedLeader = { id: candidateId, name: candidateName };
            }
        }
        
        updateSelectionDisplay();
        updateSelectionStates();
    });
});

document.getElementById('submitVotesBtn').addEventListener('click', () => {
    if (!selectedProfessional && !selectedLeader) {
        alert('Por favor, selecione pelo menos um candidato (Profissional ou Líder).');
        return;
    }
    
    document.getElementById('confirmProfessional').textContent = selectedProfessional ? selectedProfessional.name : 'Não selecionado';
    document.getElementById('confirmLeader').textContent = selectedLeader ? selectedLeader.name : 'Não selecionado';
    
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
});

document.getElementById('confirmVoteBtn').addEventListener('click', async () => {
    if (!voterEmail || (!selectedProfessional && !selectedLeader)) {
        alert('Erro: Dados de votação inválidos');
        return;
    }
    
    try {
        let votesSuccessful = 0;
        let votesTotal = 0;
        
        if (selectedProfessional) {
            votesTotal++;
            const professionalResponse = await fetch('/submit-vote', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: voterEmail,
                    candidate_id: parseInt(selectedProfessional.id)
                })
            });
            
            const professionalData = await professionalResponse.json();
            
            if (!professionalData.success) {
                alert(`Erro ao votar no profissional: ${professionalData.error}`);
                return;
            }
            votesSuccessful++;
        }
        
        if (selectedLeader) {
            votesTotal++;
            const leaderResponse = await fetch('/submit-vote', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: voterEmail,
                    candidate_id: parseInt(selectedLeader.id)
                })
            });
            
            const leaderData = await leaderResponse.json();
            
            if (!leaderData.success) {
                alert(`Erro ao votar no líder: ${leaderData.error}`);
                return;
            }
            votesSuccessful++;
        }
        
        if (votesSuccessful === votesTotal) {
            bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
            alert(`Voto${votesTotal > 1 ? 's' : ''} registrado${votesTotal > 1 ? 's' : ''} com sucesso!`);
            window.location.href = '/results';
        }
        
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});
