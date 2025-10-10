
import os
import base64
from PIL import Image
import io
from database import get_db_connection

def process_image_file(filepath):
    """Converte imagem em base64"""
    try:
        img = Image.open(filepath)
        
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')
        
        img.thumbnail((400, 400), Image.Resampling.LANCZOS)
        
        buffer = io.BytesIO()
        if img.mode == 'RGBA':
            img.save(buffer, 'PNG', optimize=True)
        else:
            img.save(buffer, 'PNG', optimize=True)
        
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"❌ Erro ao processar {filepath}: {e}")
        return None

def migrate_photos():
    """Migra fotos do diretório uploads para o banco de dados"""
    uploads_dir = 'static/uploads'
    
    if not os.path.exists(uploads_dir):
        print(f"❌ Diretório {uploads_dir} não encontrado")
        return
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Buscar candidatos que têm referência a arquivo
    cur.execute("""
        SELECT id, nome, photo 
        FROM candidates 
        WHERE photo NOT LIKE 'data:image%' 
        AND photo != 'default_avatar.png'
    """)
    
    candidates = cur.fetchall()
    
    if not candidates:
        print("✅ Nenhum candidato com foto em arquivo encontrado")
        cur.close()
        conn.close()
        return
    
    print(f"\n🔄 Encontrados {len(candidates)} candidato(s) com fotos em arquivo")
    print("=" * 60)
    
    migrated = 0
    failed = 0
    
    for candidate in candidates:
        candidate_id = candidate['id']
        nome = candidate['nome']
        photo_filename = candidate['photo']
        
        filepath = os.path.join(uploads_dir, photo_filename)
        
        print(f"\n📸 Processando: {nome}")
        print(f"   Arquivo: {photo_filename}")
        
        if os.path.exists(filepath):
            photo_base64 = process_image_file(filepath)
            
            if photo_base64:
                cur.execute("""
                    UPDATE candidates 
                    SET photo = %s 
                    WHERE id = %s
                """, (photo_base64, candidate_id))
                
                print(f"   ✅ Migrado com sucesso!")
                migrated += 1
            else:
                print(f"   ❌ Erro ao processar imagem")
                failed += 1
        else:
            print(f"   ⚠️  Arquivo não encontrado, definindo como default")
            cur.execute("""
                UPDATE candidates 
                SET photo = 'default_avatar.png' 
                WHERE id = %s
            """, (candidate_id,))
            failed += 1
    
    conn.commit()
    cur.close()
    conn.close()
    
    print("\n" + "=" * 60)
    print(f"✅ Migração concluída!")
    print(f"   Migrados: {migrated}")
    print(f"   Falhas/Padrão: {failed}")
    print("=" * 60)

if __name__ == '__main__':
    migrate_photos()
