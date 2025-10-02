let voterEmail = null;
let selectedCandidateId = null;
let selectedCandidateName = null;

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
    
    window.scrollTo({ top: document.getElementById('votingSection').offsetTop - 100, behavior: 'smooth' });
});

document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        selectedCandidateId = this.dataset.id;
        selectedCandidateName = this.dataset.nome;
        
        document.getElementById('confirmName').textContent = selectedCandidateName;
        new bootstrap.Modal(document.getElementById('confirmModal')).show();
    });
});

document.getElementById('confirmVoteBtn').addEventListener('click', async () => {
    if (!voterEmail || !selectedCandidateId) {
        alert('Erro: Dados de votação inválidos');
        return;
    }
    
    try {
        const response = await fetch('/submit-vote', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: voterEmail,
                candidate_id: parseInt(selectedCandidateId)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
            alert('Voto registrado com sucesso! Você ainda pode votar na outra categoria.');
            location.reload();
        } else {
            alert(`Erro: ${data.error}`);
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});
