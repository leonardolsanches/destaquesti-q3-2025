# Sistema de Votação - Destaques Q3/2025

## Overview

This is an online voting system developed for Claro's Business Systems Directorate to conduct employee recognition voting for Q3/2025 professional highlights. The system enables administrators to manage candidates, configure voting periods, and allows employees to cast votes for standout professionals across two categories: Professional and Leadership. Results are displayed in real-time with automated ranking and TOP 5 selection logic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Structure

**Monolithic Flask Application**: The system uses Flask as a lightweight web framework with server-side rendering. Pages are rendered using Jinja2 templates with Bootstrap for responsive UI.

**File-Based Data Storage**: Data persistence uses JSON files instead of a traditional database. All data (candidates, votes, voters, configuration) is stored in the `/data` directory as separate JSON files managed by the `DataManager` class. This approach was chosen for simplicity and ease of deployment without database setup requirements.

**Stateless Voting Flow**: The application maintains voting state through email validation. Each email can vote once, tracked in `voters.json`. No user sessions are maintained beyond the voting transaction.

### Data Management Layer

**DataManager Class**: Centralized data access layer (`data_manager.py`) handles all CRUD operations for:
- Candidates list (`candidates.json`)
- Vote counts per candidate (`votes.json`)
- Voter registry to prevent duplicate voting (`voters.json`)
- System configuration including voting period and active status (`config.json`)

All JSON operations include UTF-8 encoding for proper handling of Portuguese characters and accented names.

### Image Processing Pipeline

**Photo Upload System**: Candidates can have photos uploaded via file input or clipboard paste (Ctrl+V). Images are processed using Pillow:
- Automatic format conversion to PNG
- Thumbnail generation (400x400px maximum)
- RGBA/transparency handling
- Secure filename generation with timestamps
- Storage in `/static/uploads`

### Voting Logic & Rules

**Category-Based Voting**: Two distinct categories:
- "Eu Faço a Diferença" (Professional)
- "Eu Faço a Diferença - Líder" (Leadership)

**Email Validation**: Only `@claro.com.br` corporate emails are accepted. Email addresses are stored in lowercase and tracked to prevent duplicate voting.

**TOP 5 Selection Algorithm**: Results page implements custom business logic:
- Preferentially selects 4 Professionals + 1 Leader
- If fewer leaders available, selects 3 Professionals + 2 Leaders
- Fifth position awarded to highest vote-getter regardless of category
- Full ranking of all candidates displayed below TOP 5

**Real-Time Updates**: While voting is active, results page auto-refreshes every 5 seconds using JavaScript polling.

### Admin Panel Features

**Excel Import**: Administrators upload XLSX files with candidate data using openpyxl. Expected columns:
- COLABORADOR (name)
- JUSTIFICATIVA (achievement description)
- GESTOR (manager name)
- PERIODO (period, e.g., Q3/2025)
- CATEGORIA (category type)

**Voting Control**: Admin can:
- Set voting end date/time
- Start/stop voting manually
- Reset all votes
- Edit candidate information
- Manage candidate photos

### Frontend Architecture

**Server-Side Rendering**: All pages rendered via Jinja2 templates extending `base.html`. JavaScript is limited to:
- Countdown timer updates
- AJAX form submissions
- Chart.js for result visualization
- Real-time result polling

**Responsive Design**: Bootstrap 5 provides mobile-first responsive layouts. Custom CSS defines Claro brand colors (--claro-red: #8B1538).

**Client-Side Scripts**: Separate JS files per feature:
- `admin.js` - Admin panel interactions
- `vote.js` - Voting flow and countdown
- `results.js` - Chart updates and polling

### Routing Structure

- `/` - Redirects to voting page
- `/vote` - Public voting interface
- `/admin` - Administrative panel
- `/results` - Real-time results display
- `/api/results` - JSON endpoint for result data

### Security Considerations

**Email-Based Access Control**: No authentication system. Access controlled by corporate email validation only.

**File Upload Restrictions**: 16MB maximum file size, limited to image formats (PNG, JPG, JPEG, GIF) and Excel (XLSX).

**Secret Key**: Flask session secret loaded from environment variable with fallback to development key.

## External Dependencies

### Python Libraries

- **Flask 3.1.2** - Web framework for routing, templating, and request handling
- **Gunicorn 23.0.0** - WSGI HTTP server for production deployment
- **openpyxl 3.1.5** - Excel file reading/writing for candidate data import
- **Pillow 11.3.0** - Image processing library for photo uploads and thumbnails
- **Werkzeug 3.1.3** - WSGI utility library (Flask dependency) for secure filename handling

### Frontend Libraries (CDN)

- **Bootstrap 5.3.0** - CSS framework for responsive UI components
- **Chart.js** - JavaScript charting library for vote visualization

### File System Dependencies

- Local file storage in `/static/uploads` for candidate photos
- JSON file storage in `/data` directory for all persistent data
- Static assets in `/static` (CSS, JS, images including Claro logo)

### Environment Variables

- `SESSION_SECRET` - Flask session encryption key (optional, defaults to development key)