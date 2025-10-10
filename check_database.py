
import os
from database import get_db_connection

def check_database():
    """Verifica o estado atual do banco de dados"""
    print("=" * 50)
    print("DIAGNÓSTICO DO BANCO DE DADOS")
    print("=" * 50)
    
    database_url = os.environ.get('DATABASE_URL', 'NÃO CONFIGURADA')
    print(f"\n📊 DATABASE_URL: {database_url[:50]}...")
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Contar candidatos
        cur.execute('SELECT COUNT(*) as total FROM candidates')
        total_candidates = cur.fetchone()['total']
        print(f"\n👥 Total de Candidatos: {total_candidates}")
        
        # Listar candidatos
        if total_candidates > 0:
            cur.execute('SELECT id, nome, categoria FROM candidates ORDER BY id')
            candidates = cur.fetchall()
            print("\n📋 Lista de Candidatos:")
            for c in candidates:
                print(f"  - ID {c['id']}: {c['nome']} ({c['categoria']})")
        
        # Contar votos
        cur.execute('SELECT COUNT(*) as total FROM voters')
        total_voters = cur.fetchone()['total']
        print(f"\n🗳️  Total de Eleitores: {total_voters}")
        
        # Verificar configuração
        cur.execute('SELECT * FROM config WHERE id = 1')
        config = cur.fetchone()
        print(f"\n⚙️  Votação Ativa: {config['voting_active']}")
        if config.get('voting_end_date'):
            print(f"   Data de Encerramento: {config['voting_end_date']}")
        
        cur.close()
        conn.close()
        
        print("\n" + "=" * 50)
        print("✅ Diagnóstico concluído com sucesso!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Erro ao acessar banco de dados: {e}")
        print("=" * 50)

if __name__ == '__main__':
    check_database()
