let professionalChart = null;
let leaderChart = null;

const AVATAR_RADIUS = 14;
const AVATAR_EXTRA_WIDTH = 36;

const avatarPlugin = {
    id: 'avatarPlugin',
    afterDraw(chart) {
        const images = chart._images;
        if (!images || !images.length) return;

        const { ctx, scales: { y } } = chart;
        const avatarX = chart.chartArea.left - y.width + AVATAR_RADIUS + 4;

        y.ticks.forEach((_, i) => {
            if (i >= images.length) return;
            const img = images[i];
            if (!img || !img.complete || img.naturalWidth === 0) return;

            const yPos = y.getPixelForTick(i);

            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, yPos, AVATAR_RADIUS, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, avatarX - AVATAR_RADIUS, yPos - AVATAR_RADIUS, AVATAR_RADIUS * 2, AVATAR_RADIUS * 2);
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, yPos, AVATAR_RADIUS, 0, Math.PI * 2);
            ctx.strokeStyle = '#8B1538';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        });
    }
};

Chart.register(avatarPlugin);

function resolvePhotoUrl(photo) {
    if (!photo || photo === 'default_avatar.png') return '/static/images/default_avatar.png';
    if (photo.startsWith('data:') || photo.startsWith('http')) return photo;
    return '/static/uploads/' + photo;
}

function shortenName(nome) {
    const parts = nome.trim().split(/\s+/);
    if (parts.length <= 2) return nome;
    return parts[0] + ' ' + parts[parts.length - 1];
}

function loadImages(candidates, chart) {
    const images = candidates.map(c => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { try { chart.draw(); } catch(_) {} };
        img.onerror = () => {
            img.src = '/static/images/default_avatar.png';
        };
        img.src = resolvePhotoUrl(c.photo);
        return img;
    });
    chart._images = images;
}

async function loadResults() {
    try {
        const response = await fetch('/api/results');
        const data = await response.json();

        const validCandidates = data.candidates.filter(c => c && c.nome && c.id);

        const professional = validCandidates.filter(c => !c.categoria.includes('Líder'));
        const leader = validCandidates.filter(c => c.categoria.includes('Líder'));

        if (professional.length > 0) updateChart(professional, 'professional');
        if (leader.length > 0) updateChart(leader, 'leader');

        if (data.is_active) setTimeout(loadResults, 5000);
    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
    }
}

function updateChart(candidates, type) {
    candidates.sort((a, b) => b.vote_count - a.vote_count);

    const labels = candidates.map(c => shortenName(c.nome));
    const votes = candidates.map(c => c.vote_count);

    const chartData = {
        labels,
        datasets: [{
            label: 'Votos',
            data: votes,
            backgroundColor: '#8B1538',
            borderColor: '#6B0F2A',
            borderWidth: 2,
            borderRadius: 4
        }]
    };

    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 16 } },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { stepSize: 1, precision: 0 },
                grid: { color: 'rgba(0,0,0,0.06)' }
            },
            y: {
                ticks: {
                    font: { size: 12 },
                    padding: 6
                },
                afterFit(scale) {
                    scale.width = Math.max(scale.width + AVATAR_EXTRA_WIDTH, 180);
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.parsed.x} voto${ctx.parsed.x !== 1 ? 's' : ''}`,
                    title: ctx => {
                        const idx = ctx[0].dataIndex;
                        return candidates[idx]?.nome || ctx[0].label;
                    }
                }
            }
        }
    };

    const canvasId = type === 'professional' ? 'professionalChart' : 'leaderChart';
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const wrapHeight = Math.max(180, candidates.length * 48 + 40);
    canvas.parentElement.style.height = wrapHeight + 'px';

    if (type === 'professional') {
        if (professionalChart) {
            professionalChart.data = chartData;
            professionalChart._images = null;
            professionalChart.update();
            loadImages(candidates, professionalChart);
        } else {
            professionalChart = new Chart(canvas, { type: 'bar', data: chartData, options: chartOptions });
            loadImages(candidates, professionalChart);
        }
    } else {
        if (leaderChart) {
            leaderChart.data = chartData;
            leaderChart._images = null;
            leaderChart.update();
            loadImages(candidates, leaderChart);
        } else {
            leaderChart = new Chart(canvas, { type: 'bar', data: chartData, options: chartOptions });
            loadImages(candidates, leaderChart);
        }
    }
}

loadResults();
