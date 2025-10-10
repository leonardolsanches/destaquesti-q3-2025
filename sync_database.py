
import os
from database import get_db_connection

def force_schema_migration():
    """Força a migração do schema para TEXT"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    print("🔄 Iniciando migração forçada do schema...")
    
    try:
        # Migrar tabela candidates
        cur.execute('''
            ALTER TABLE candidates 
            ALTER COLUMN nome TYPE TEXT,
            ALTER COLUMN justificativa TYPE TEXT,
            ALTER COLUMN gestor TYPE TEXT,
            ALTER COLUMN periodo TYPE TEXT,
            ALTER COLUMN categoria TYPE TEXT,
            ALTER COLUMN photo TYPE TEXT
        ''')
        print("✅ Tabela candidates migrada com sucesso!")
    except Exception as e:
        print(f"⚠️  Erro ao migrar candidates: {e}")
        conn.rollback()
    
    try:
        # Migrar tabela voters
        cur.execute('ALTER TABLE voters ALTER COLUMN email TYPE TEXT')
        print("✅ Tabela voters migrada com sucesso!")
    except Exception as e:
        print(f"⚠️  Erro ao migrar voters: {e}")
        conn.rollback()
    
    conn.commit()
    cur.close()
    conn.close()
    
    print("\n✅ Migração concluída!")

if __name__ == '__main__':
    force_schema_migration()
