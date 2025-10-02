document.getElementById('uploadExcelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showMessage('Por favor, selecione um arquivo', 'danger');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/admin/upload-excel', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(`Sucesso! ${data.count} candidatos carregados.`, 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showMessage(`Erro: ${data.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`Erro: ${error.message}`, 'danger');
    }
});

document.getElementById('votingConfigForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const endDate = document.getElementById('endDate').value;
    
    if (!endDate) {
        alert('Por favor, selecione uma data e hora');
        return;
    }
    
    try {
        const response = await fetch('/admin/set-voting-config', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ end_date: endDate })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Votação iniciada com sucesso!');
            location.reload();
        } else {
            alert(`Erro: ${data.error}`);
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

document.getElementById('stopVotingBtn').addEventListener('click', async () => {
    if (!confirm('Tem certeza que deseja encerrar a votação?')) return;
    
    try {
        const response = await fetch('/admin/stop-voting', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Votação encerrada!');
            location.reload();
        } else {
            alert(`Erro: ${data.error}`);
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

document.getElementById('resetVotingBtn').addEventListener('click', async () => {
    if (!confirm('ATENÇÃO: Isso irá apagar todos os votos! Tem certeza?')) return;
    
    try {
        const response = await fetch('/admin/reset-voting', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Votos resetados com sucesso!');
            location.reload();
        } else {
            alert(`Erro: ${data.error}`);
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

document.getElementById('deleteAllCandidatesBtn').addEventListener('click', async () => {
    if (!confirm('ATENÇÃO: Isso irá excluir TODOS os candidatos carregados! Tem certeza?')) return;
    
    try {
        const response = await fetch('/admin/delete-all-candidates', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Todos os candidatos foram excluídos com sucesso!');
            location.reload();
        } else {
            alert(`Erro: ${data.error}`);
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const row = this.closest('tr');
        const id = this.dataset.id;
        
        document.getElementById('editId').value = id;
        document.getElementById('editNome').value = row.querySelector('.candidate-nome').textContent;
        document.getElementById('editGestor').value = row.querySelector('.candidate-gestor').textContent;
        document.getElementById('editCategoria').value = row.querySelector('.candidate-categoria').textContent;
        
        // Buscar a justificativa completa do servidor
        try {
            const response = await fetch('/api/candidate/' + id);
            const candidate = await response.json();
            if (candidate) {
                document.getElementById('editJustificativa').value = candidate.justificativa || '';
            }
        } catch (error) {
            console.error('Erro ao carregar justificativa:', error);
            document.getElementById('editJustificativa').value = '';
        }
        
        new bootstrap.Modal(document.getElementById('editModal')).show();
    });
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const data = {
        id: parseInt(id),
        nome: document.getElementById('editNome').value,
        justificativa: document.getElementById('editJustificativa').value,
        gestor: document.getElementById('editGestor').value,
        categoria: document.getElementById('editCategoria').value
    };
    
    try {
        const response = await fetch('/admin/update-candidate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Candidato atualizado!');
            location.reload();
        } else {
            alert(`Erro: ${result.error}`);
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        if (!confirm('Tem certeza que deseja excluir este candidato?')) return;
        
        const id = this.dataset.id;
        
        try {
            const response = await fetch('/admin/delete-candidate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id: parseInt(id) })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Candidato excluído!');
                location.reload();
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });
});

let currentPhotoId = null;
let pastedImage = null;

document.querySelectorAll('.photo-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        currentPhotoId = this.dataset.id;
        document.getElementById('photoId').value = currentPhotoId;
        pastedImage = null;
        document.getElementById('pasteArea').innerHTML = 'Clique aqui e pressione Ctrl+V para colar a imagem';
        document.getElementById('photoFile').value = '';
        new bootstrap.Modal(document.getElementById('photoModal')).show();
    });
});

const pasteArea = document.getElementById('pasteArea');

pasteArea.addEventListener('click', () => {
    pasteArea.focus();
});

// Adicionar tabindex para permitir foco
pasteArea.setAttribute('tabindex', '0');

// Evento de paste no pasteArea
pasteArea.addEventListener('paste', (e) => {
    e.preventDefault();
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            
            reader.onload = (event) => {
                pastedImage = event.target.result;
                pasteArea.innerHTML = `<img src="${pastedImage}" style="max-width: 100%; max-height: 200px;">`;
            };
            
            reader.readAsDataURL(blob);
            break;
        }
    }
});

// Também escutar paste em nível de documento quando o modal está aberto
document.addEventListener('paste', (e) => {
    const photoModal = document.getElementById('photoModal');
    if (photoModal && photoModal.classList.contains('show')) {
        e.preventDefault();
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    pastedImage = event.target.result;
                    pasteArea.innerHTML = `<img src="${pastedImage}" style="max-width: 100%; max-height: 200px;">`;
                };
                
                reader.readAsDataURL(blob);
                break;
            }
        }
    }
});

document.getElementById('uploadPhotoBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('photoFile');
    const formData = new FormData();
    formData.append('candidate_id', currentPhotoId);
    
    if (fileInput.files.length > 0) {
        formData.append('photo', fileInput.files[0]);
    } else if (pastedImage) {
        formData.append('photo_base64', pastedImage);
    } else {
        alert('Por favor, selecione ou cole uma imagem');
        return;
    }
    
    try {
        const response = await fetch('/admin/upload-photo', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Foto enviada com sucesso!');
            location.reload();
        } else {
            alert(`Erro: ${data.error}`);
        }
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('uploadMessage');
    messageDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}
