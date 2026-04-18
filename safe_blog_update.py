import os

# The exact old block to find (with potentially different whitespace or styles)
# We will use a flexible search for the container and its content
old_widget_start = '<div class="sidebar-widget widget-contact">'
old_widget_end = '</div>'

# The new clean block
new_widget_content = """
              <h3>Entre em contato</h3>
              <p>Precisa de adequação técnica ou projeto para seu empreendimento? Fale com nossos engenheiros.</p>
              <a href="../contato.html" class="btn btn--light" style="width: 100%; justify-content: center">Solicitar proposta</a>
            """

def fix_blog_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    inside_widget = False
    updated = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        if old_widget_start in line:
            new_lines.append(line) # Keep the div start
            new_lines.append(new_widget_content)
            updated = True
            # Skip until the matching </div>
            # Assuming the widget is self-contained and simple
            while i < len(lines) and old_widget_end not in lines[i]:
                i += 1
            # Now we are at the line with </div> or end of file
            if i < len(lines):
                new_lines.append(lines[i]) # Keep the div end
            i += 1
        else:
            new_lines.append(line)
            i += 1
            
    if updated:
        with open(path, 'w', encoding='utf-8', newline='') as f:
            f.writelines(new_lines)
        print(f"Updated: {path}")

# Only process files in the blog directory
for root, dirs, files in os.walk('blog'):
    for file in files:
        if file.endswith('.html'):
            fix_blog_file(os.path.join(root, file))
