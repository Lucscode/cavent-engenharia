import os

# Mapping of corrupted words (with diamond mark) to correct Portuguese words
# The diamond mark is \ufffd in unicode
words = {
    'adequa\ufffdo': 'adequação',
    't\ufffdcnica': 'técnica',
    'solu\ufffdo': 'solução',
    'solu\ufffdes': 'soluções',
    'servi\ufffdo': 'serviço',
    'servi\ufffdos': 'serviços',
    'instala\ufffdo': 'instalação',
    'instala\ufffdes': 'instalações',
    'not\ufffdcia': 'notícia',
    'not\ufffdcias': 'notícias',
    'hist\ufffdria': 'história',
    'vit\ufffdria': 'vitória',
    's\ufffdcio': 'sócio',
    'resili\ufffdncia': 'resiliência',
    'seguran\ufffda': 'segurança',
    'vi\ufffdria': 'viária',
    'vi\ufffdrio': 'viário',
    'pavimenta\ufffdo': 'pavimentação',
    'manuten\ufffdo': 'manutenção',
    'opera\ufffdo': 'operação',
    'opera\ufffdes': 'operações',
    'coordena\ufffdo': 'coordenação',
    'aplica\ufffdo': 'aplicação',
    'decis\ufffdo': 'decisão',
    'decis\ufffdes': 'decisões',
    'produ\ufffdo': 'produção',
    'efici\ufffdncia': 'eficiência',
    'excel\ufffdncia': 'excelência',
    'experi\ufffdncia': 'experiência',
    'n\ufffdos': 'nós',
    'in\ufffdcio': 'início',
    'Ol\ufffd': 'Olá',
    'Atua\ufffdo': 'Atuação'
}

def fix_file(path):
    try:
        with open(path, 'rb') as f:
            content_bytes = f.read()
        
        # Decode as UTF-8, replacing errors with diamond mark
        content = content_bytes.decode('utf-8', errors='replace')
        
        new_content = content
        for old, new in words.items():
            new_content = new_content.replace(old, new)
        
        # Additional cleanup for the copyright symbol
        if '2026' in new_content:
             import re
             new_content = re.sub(r'<span>.*? 2026 .*? Cavent Engenharia', '<span>© 2026 · Cavent Engenharia', new_content)
             new_content = re.sub(r' 2026 ', '© 2026 ·', new_content)

        if new_content != content:
            with open(path, 'w', encoding='utf-8', newline='') as f:
                f.write(new_content)
            print(f"Fixed: {path}")
            
    except Exception as e:
        print(f"Error {path}: {e}")

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith(('.html', '.css', '.js')):
            fix_file(os.path.join(root, file))
