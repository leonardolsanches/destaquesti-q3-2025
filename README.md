# Sistema de Votação - Destaques Q3/2025

Sistema de votação online desenvolvido para a Diretoria de Sistemas de Negócio da Claro, permitindo a votação e apuração dos Destaques Profissionais do terceiro quartil de 2025.

## Funcionalidades

### Painel Administrativo (/admin)
- **Upload de Planilha Excel**: Carregue uma planilha XLSX com os dados dos candidatos
- **Gerenciamento de Candidatos**: Edite informações, adicione fotos (upload ou Ctrl+V), ou exclua candidatos
- **Configuração de Votação**: Defina data/hora de encerramento e inicie a votação
- **Controles**: Encerre votação manualmente ou resete todos os votos

### Votação Pública (/vote)
- Validação de e-mail corporativo (@claro.com.br)
- Voto único por e-mail
- Contagem regressiva em tempo real
- Cards visuais com foto, nome, justificativa e gestor de cada candidato
- Categorias separadas: Profissional e Liderança

### Resultados (/results)
- Gráficos de barras verticais por categoria
- Atualização automática em tempo real durante votação ativa
- TOP 5 Destaques com lógica de apuração:
  - 4 Profissionais + 1 Líder, OU
  - 3 Profissionais + 2 Líderes
  - Quinto lugar vai para quem tiver mais votos
- Ranking completo de todos os candidatos

## Formato da Planilha Excel

A planilha deve ter as seguintes colunas (linha 1 = cabeçalho):

| COLABORADOR | JUSTIFICATIVA | GESTOR | PERIODO | CATEGORIA |
|-------------|---------------|--------|---------|-----------|
| Nome        | Texto         | Nome   | Q3/2025 | Eu Faço a Diferença OU Eu Faço a Diferença - Líder |

## Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Banco de Dados**: JSON (arquivos locais)
- **Frontend**: Bootstrap 5, Chart.js
- **Processamento**: openpyxl (Excel), Pillow (Imagens)

## Instalação Local

```bash
pip install -r requirements.txt
python app.py
```

Acesse: http://localhost:5000

## Deploy no Render

Este projeto está pronto para deploy no Render. O arquivo `requirements.txt` já está configurado.

Para produção, use Gunicorn:
```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

## Estrutura de Arquivos

```
.
├── app.py                  # Aplicação Flask principal
├── data_manager.py         # Gerenciamento de dados JSON
├── templates/              # Templates HTML
│   ├── base.html
│   ├── admin.html
│   ├── vote.html
│   ├── results.html
│   └── voting_closed.html
├── static/
│   ├── css/style.css       # Estilos com cores Claro
│   ├── js/                 # Scripts JavaScript
│   │   ├── admin.js
│   │   ├── vote.js
│   │   └── results.js
│   ├── images/             # Logo e imagem padrão
│   └── uploads/            # Fotos dos candidatos
├── data/                   # Arquivos JSON (gerados automaticamente)
│   ├── candidates.json
│   ├── votes.json
│   ├── voters.json
│   └── config.json
└── requirements.txt
```

## Segurança

- Validação de e-mail @claro.com.br no backend
- Voto único por e-mail
- Proteção contra votos duplicados
- Resetagem automática de votos ao carregar nova planilha

## Cores Corporativas

- **Vermelho Claro**: #8B1538 (bordeaux)
- **Branco**: #FFFFFF
- **Preto**: Para textos e rodapé

## Desenvolvido para

Time DEV - Diretoria Sistemas de Negócio Claro
