"""Create an offline, single-file preview from the canonical source files."""
from pathlib import Path
import re
root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: '<style>\n' + (root / m[1]).read_text() + '\n</style>', html)
html = re.sub(r'<script defer src="([^"]+)"></script>', lambda m: '<script>\n' + (root / m[1]).read_text() + '\n</script>', html)
(root / 'preview.html').write_text(html)
print('Built preview.html')
