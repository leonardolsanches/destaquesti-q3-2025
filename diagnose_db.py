
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def diagnose():
    database_url = os.environ.get('DATABASE_URL')
    
    print("=" * 60)
    print("DIAGNÓSTICO COMPLETO DO BANCO DE DADOS")
    print("=" * 60)
    
    print(f"\n📊 DATABASE_URL completa:")
    print(f"   {database_url}")
    
    # Ajustar URL se necessário
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
        print(f"\n🔄 URL ajustada para:")
        print(f"   {database_url}")
    
    try:
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        
        # Verificar versão do PostgreSQL
        cur.execute('SELECT version()')
        version = cur.fetchone()
        print(f"\n📌 Versão PostgreSQL: {version['version']}")
        
        # Verificar nome do banco atual
        cur.execute('SELECT current_database()')
        db_name = cur.fetchone()
        print(f"📌 Banco atual: {db_name['current_database']}")
        
        # Verificar tabelas existentes
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cur.fetchall()
        print(f"\n📋 Tabelas encontradas ({len(tables)}):")
        for t in tables:
            print(f"   - {t['table_name']}")
        
        # Verificar candidatos
        cur.execute('SELECT COUNT(*) as total FROM candidates')
        total_candidates = cur.fetchone()['total']
        print(f"\n👥 Total de Candidatos: {total_candidates}")
        
        if total_candidates > 0:
            cur.execute("""
                SELECT id, nome, categoria, created_at 
                FROM candidates 
                ORDER BY id
            """)
            candidates = cur.fetchall()
            print("\n📋 Candidatos cadastrados:")
            for c in candidates:
                print(f"   - ID {c['id']}: {c['nome']} | {c['categoria']} | {c['created_at']}")
        
        # Verificar votos
        cur.execute('SELECT COUNT(*) as total FROM voters')
        total_voters = cur.fetchone()['total']
        print(f"\n🗳️  Total de Votos registrados: {total_voters}")
        
        # Verificar configuração
        cur.execute('SELECT * FROM config WHERE id = 1')
        config = cur.fetchone()
        print(f"\n⚙️  Configuração:")
        print(f"   - Votação ativa: {config['voting_active']}")
        print(f"   - Data encerramento: {config.get('voting_end_date', 'Não definida')}")
        print(f"   - Última atualização: {config.get('updated_at', 'N/A')}")
        
        cur.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ Diagnóstico concluído!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERRO: {e}")

if __name__ == '__main__':
    diagnose()
