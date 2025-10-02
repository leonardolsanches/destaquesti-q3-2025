let professionalChart = null;
let leaderChart = null;

async function loadResults() {
    try {
        const response = await fetch('/api/results');
        const data = await response.json();
        
        const professional = data.candidates.filter(c => !c.categoria.includes('Líder'));
        const leader = data.candidates.filter(c => c.categoria.includes('Líder'));
        
        updateChart(professional, 'professional');
        updateChart(leader, 'leader');
        
        if (data.is_active) {
            setTimeout(loadResults, 5000);
        }
    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
    }
}

function updateChart(candidates, type) {
    candidates.sort((a, b) => b.vote_count - a.vote_count);
    
    const labels = candidates.map(c => c.nome);
    const votes = candidates.map(c => c.vote_count);
    const colors = candidates.map(() => '#8B1538');
    
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Votos',
            data: votes,
            backgroundColor: colors,
            borderColor: '#6B0F2A',
            borderWidth: 2
        }]
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.parsed.y} voto${context.parsed.y !== 1 ? 's' : ''}`;
                    }
                }
            }
        }
    };
    
    const canvasId = type === 'professional' ? 'professionalChart' : 'leaderChart';
    const ctx = document.getElementById(canvasId);
    
    if (!ctx) return;
    
    if (type === 'professional') {
        if (professionalChart) {
            professionalChart.data = chartData;
            professionalChart.update();
        } else {
            professionalChart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: chartOptions
            });
        }
    } else {
        if (leaderChart) {
            leaderChart.data = chartData;
            leaderChart.update();
        } else {
            leaderChart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: chartOptions
            });
        }
    }
}

loadResults();
