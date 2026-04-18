import os
import re

def fix_file(filepath):
    with open(filepath, 'rb') as f:
        content_bytes = f.read()
    
    # Try decoding
    try:
        content = content_bytes.decode('utf-8')
    except UnicodeDecodeError:
        content = content_bytes.decode('latin-1')

    # Fix common corruptions (including the one the user pointed out)
    # The user's example: Precisa de adequaÃ§Ã£o tÃ©cnica
    # This happens when UTF-8 bytes are read as Latin-1.
    
    replacements = {
        'adequaÃ§Ã£o': 'adequação',
        'tÃ©cnica': 'técnica',
        'soluÃ§Ãµes': 'soluções',
        'serviÃ§os': 'serviços',
        'notÃ­cias': 'notícias',
        'resiliÃªncia': 'resiliência',
        'seguranÃ§a': 'segurança',
        'viÃ¡ria': 'viária',
        'sÃ³cio': 'sócio',
        'Â©': '©',
        'OlÃ¡': 'Olá',
        'instalaÃ§Ãµes': 'instalações'
    }

    # Handle the weird diamond question mark characters if they were already written as literal characters
    # Or if they are represented differently.
    
    for old, new in replacements.items():
        content = content.replace(old, new)

    # Specific fix for the user's snippet that might be already semi-fixed but with diamond marks
    content = re.sub(r'Precisa de adequa.*?o t.*?cnica ou projeto para seu empreendimento\?', 
                     'Precisa de adequação técnica ou projeto para seu empreendimento?', content)

    # Fix footer
    content = re.sub(r'<span>.*? 2026 .*? Cavent Engenharia.*?</span>', 
                     '<span>© 2026 · Cavent Engenharia. Todos os direitos reservados. Brasil.</span>', content)

    # Write back as clean UTF-8
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        f.write(content)

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.html') or file.endswith('.css') or file.endswith('.js'):
            fix_file(os.path.join(root, file))
            print(f"Processed {file}")
