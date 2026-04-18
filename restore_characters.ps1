$files = Get-ChildItem -Path . -Include *.html -Recurse
$utf8NoBom = New-Object System.Text.UTF8Encoding($False)

foreach ($file in $files) {
    # Try reading as UTF8 first
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    $changed = $false
    
    # Fix the contact widget text (handle various corruptions)
    $corruptPattern = 'Precisa de adequa.*?o t.*?cnica ou projeto para seu empreendimento\? Fale com nossos engenheiros\.'
    $correctText = 'Precisa de adequação técnica ou projeto para seu empreendimento? Fale com nossos engenheiros.'
    
    if ($content -match $corruptPattern) {
        $content = [regex]::Replace($content, $corruptPattern, $correctText)
        $changed = $true
    }
    
    # Fix footer copyright
    $corruptFooter = '<span>.*? 2026 .*? Cavent Engenharia\. Todos os direitos reservados\. Brasil\.</span>'
    $correctFooter = '<span>© 2026 · Cavent Engenharia. Todos os direitos reservados. Brasil.</span>'
    if ($content -match $corruptFooter) {
        $content = [regex]::Replace($content, $corruptFooter, $correctFooter)
        $changed = $true
    }

    # Fix WhatsApp message
    $corruptWA = 'text=Ol.*? vim pelo site'
    $correctWA = 'text=Olá, vim pelo site'
    if ($content -match $corruptWA) {
        $content = [regex]::Replace($content, $corruptWA, $correctWA)
        $changed = $true
    }

    # Fix other common words
    $replacements = @{
        'solu.*?es' = 'soluções'
        'instala.*?es' = 'instalações'
        'servi.*?os' = 'serviços'
        'not.*?cias' = 'notícias'
        'resili.*?ncia' = 'resiliência'
        'seguran.*?a' = 'segurança'
        'vi.*?ria' = 'viária'
        'adequa.*?o' = 'adequação'
        't.*?cnica' = 'técnica'
        'scio' = 'sócio'
    }

    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        if ($content -match $old) {
            # Use a more targeted replacement to avoid destroying everything
            # This is risky, but necessary if many things are broken.
            # I'll only do it for specific known broken patterns if they appear with 
            $content = $content -replace $old, $new
            $changed = $true
        }
    }
    
    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Host "Fixed characters in $($file.Name)"
    }
}
