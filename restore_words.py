import os
import re

words = {
    'adequa.o': 'adequação',
    't.cnica': 'técnica',
    'solu.o': 'solução',
    'solu.es': 'soluções',
    'servi.o': 'serviço',
    'servi.os': 'serviços',
    'instala.o': 'instalação',
    'instala.es': 'instalações',
    'not.cia': 'notícia',
    'not.cias': 'notícias',
    'hist.ria': 'história',
    'vit.ria': 'vitória',
    's.cio': 'sócio',
    'resili.ncia': 'resiliência',
    'seguran.a': 'segurança',
    'vi.ria': 'viária',
    'vi.rio': 'viário',
    'pavimenta.o': 'pavimentação',
    'manuten.o': 'manutenção',
    'opera.o': 'operação',
    'opera.es': 'operações',
    'coordena.o': 'coordenação',
    'aplica.o': 'aplicação',
    'decis.o': 'decisão',
    'decis.es': 'decisões',
    'produ.o': 'produção',
    'efici.ncia': 'eficiência',
    'excel.ncia': 'excelência',
    'experi.ncia': 'experiência',
    'n.s': 'nós',
    'in.cio': 'início',
    'fale conosco': 'fale conosco', # just in case
    'Ol.': 'Olá',
    'Atua.o': 'Atuação'
}

def fix_content(content):
    # Fix the specific sidebar widget text first (as it might have diamond marks now)
    content = re.sub(r'Precisa de adequa.*?o t.*?cnica ou projeto para seu empreendimento\?', 
                     'Precisa de adequação técnica ou projeto para seu empreendimento?', content)
    
    # Fix copyright symbol (often shows as diamond or weird characters)
    content = re.sub(r'<span>.*? 2026 .*? Cavent Engenharia', '<span>© 2026 · Cavent Engenharia', content)

    # Use regex to match words with diamond question marks (represented as \ufffd in Python strings)
    # The diamond marks often appear as \ufffd when reading UTF8 files with bad characters.
    for pattern, replacement in words.items():
        # Replace the dot with the literal diamond character or any non-ascii character
        regex_pattern = pattern.replace('.', r'[\ufffd\u00b4\u0060\u005e\u007e\xc0-\xff]')
        content = re.sub(regex_pattern, replacement, content, flags=re.IGNORECASE)

    return content

def process_files():
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html') or file.endswith('.css') or file.endswith('.js'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = fix_content(content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8', newline='') as f:
                            f.write(new_content)
                        print(f"Fixed: {file}")
                except Exception as e:
                    print(f"Error processing {file}: {e}")

if __name__ == "__main__":
    process_files()
