
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    """Conecta ao PostgreSQL usando a URL do ambiente"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL não configurada nas variáveis de ambiente')
    
    # Render usa postgres://, mas psycopg2 precisa de postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def init_database():
    """Inicializa as tabelas do banco de dados"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Tabela de candidatos
    cur.execute('''
        CREATE TABLE IF NOT EXISTS candidates (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            justificativa TEXT,
            gestor VARCHAR(255),
            periodo VARCHAR(50),
            categoria VARCHAR(100),
            photo VARCHAR(255) DEFAULT 'default_avatar.png',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de votos
    cur.execute('''
        CREATE TABLE IF NOT EXISTS votes (
            id SERIAL PRIMARY KEY,
            candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
            count INTEGER DEFAULT 0,
            UNIQUE(candidate_id)
        )
    ''')
    
    # Tabela de eleitores
    cur.execute('''
        CREATE TABLE IF NOT EXISTS voters (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            professional_id INTEGER REFERENCES candidates(id) ON DELETE SET NULL,
            leader_id INTEGER REFERENCES candidates(id) ON DELETE SET NULL,
            voted_professional BOOLEAN DEFAULT FALSE,
            voted_leader BOOLEAN DEFAULT FALSE,
            voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de configuração
    cur.execute('''
        CREATE TABLE IF NOT EXISTS config (
            id INTEGER PRIMARY KEY DEFAULT 1,
            voting_end_date TIMESTAMP,
            voting_active BOOLEAN DEFAULT FALSE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CHECK (id = 1)
        )
    ''')
    
    # Inserir configuração padrão se não existir
    cur.execute('''
        INSERT INTO config (id, voting_active) 
        VALUES (1, FALSE) 
        ON CONFLICT (id) DO NOTHING
    ''')
    
    # Tabela de histórico
    cur.execute('''
        CREATE TABLE IF NOT EXISTS voting_history (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description TEXT,
            config JSONB,
            candidates JSONB,
            total_voters INTEGER,
            total_votes INTEGER
        )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()
