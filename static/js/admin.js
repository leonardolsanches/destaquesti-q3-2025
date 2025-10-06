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
            showMessage(`Sucesso! ${data.added} novos candidatos adicionados, ${data.skipped} já existentes foram mantidos.`, 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showMessage(`Erro: ${data.error}`, 'danger');
        }
    } catch (error) {
        showMessage(`Erro: ${error.message}`, 'danger');
    }
});

document.getElementById('addCandidateForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const candidateData = {
        nome: document.getElementById('addNome').value,
        justificativa: document.getElementById('addJustificativa').value,
        gestor: document.getElementById('addGestor').value,
        categoria: document.getElementById('addCategoria').value
    };

    try {
        const response = await fetch('/admin/add-candidate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(candidateData)
        });

        const data = await response.json();

        if (data.success) {
            showAddCandidateMessage('Candidato adicionado com sucesso!', 'success');
            document.getElementById('addCandidateForm').reset();
            setTimeout(() => location.reload(), 1500);
        } else {
            showAddCandidateMessage(`Erro: ${data.error}`, 'danger');
        }
    } catch (error) {
        showAddCandidateMessage(`Erro: ${error.message}`, 'danger');
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

document.getElementById('saveHistoryBtn').addEventListener('click', async () => {
    const period = prompt('Digite o período desta votação (ex: Q3/2025):');
    if (!period) return;

    try {
        const response = await fetch('/admin/save-history', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ period })
        });

        const data = await response.json();

        if (data.success) {
            alert('Histórico de votação salvo com sucesso!');
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

function showAddCandidateMessage(message, type) {
    const messageDiv = document.getElementById('addCandidateMessage');
    messageDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// Modal de criação de candidato
const createModal = `
    <div class="modal fade" id="createCandidateModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Criar Novo Candidato</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="createCandidateForm">
                        <div class="mb-3">
                            <label class="form-label">Nome</label>
                            <input type="text" class="form-control" id="createNome" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Justificativa</label>
                            <textarea class="form-control" id="createJustificativa" rows="3" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Gestor</label>
                            <input type="text" class="form-control" id="createGestor" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Período</label>
                            <input type="text" class="form-control" id="createPeriodo" value="Q3/2025">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Categoria</label>
                            <select class="form-control" id="createCategoria">
                                <option value="Eu Faço a Diferença">Eu Faço a Diferença</option>
                                <option value="Eu Faço a Diferença - Líder">Eu Faço a Diferença - Líder</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success" id="saveNewCandidate">Criar Candidato</button>
                </div>
            </div>
        </div>
    </div>
`;
$('body').append(createModal);

// Botão criar candidato
$('#createCandidateBtn').click(function() {
    $('#createCandidateModal').modal('show');
});

// Salvar novo candidato
$('#saveNewCandidate').click(function() {
    const candidateData = {
        nome: $('#createNome').val().trim(),
        justificativa: $('#createJustificativa').val().trim(),
        gestor: $('#createGestor').val().trim(),
        periodo: $('#createPeriodo').val().trim(),
        categoria: $('#createCategoria').val()
    };

    if (!candidateData.nome || !candidateData.justificativa || !candidateData.gestor) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    $.ajax({
        url: '/admin/create-candidate',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(candidateData),
        success: function(response) {
            if (response.success) {
                alert('Candidato criado com sucesso!');
                $('#createCandidateModal').modal('hide');
                location.reload();
            } else {
                alert('Erro: ' + response.error);
            }
        },
        error: function() {
            alert('Erro ao criar candidato');
        }
    });
});

// Modal de edição
    const editModal = `
// Atualizar mensagem de importação Excel
$(document).ready(function() {
    $('#uploadExcelForm').submit(function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        $.ajax({
            url: '/admin/upload-excel',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert(response.message || `${response.added} novos candidatos adicionados!`);
                    location.reload();
                } else {
                    alert('Erro: ' + response.error);
                }
            },
            error: function() {
                alert('Erro ao importar arquivo.');
            }
        });
    });
});