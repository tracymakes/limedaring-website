"""One-time, repeatable migration. Original Cactus files remain untouched."""
from pathlib import Path
import re,json,shutil
from datetime import datetime

def block(text,name):
 opening=re.search(r'{% block '+name+r' %}',text)
 if not opening:return None
 depth=1
 for token in re.finditer(r'{% (block \w+|endblock(?: \w+)?) %}',text[opening.end():]):
  depth += -1 if token[1].startswith('endblock') else 1
  if depth==0:return text[opening.end():opening.end()+token.start()].strip()
 raise ValueError('Unclosed block '+name)

def clean(text):
 text=re.sub(r'{% comment %}.*?{% endcomment %}','',text,flags=re.S)
 text=re.sub(r"{% static ['\"]/?(.*?)['\"] %}",r'/static/\1',text)
 text=re.sub(r"{% url ['\"]/(.*?)\.html['\"] %}",lambda m:'/' if m[1]=='index' else '/'+m[1]+'/',text)
 return re.sub(r'{% (?:block \w+|endblock(?: \w+)?) %}', '', text)

# Keep public URLs for every asset, including downloadable files and old CSS.
shutil.copytree('static','public/static',dirs_exist_ok=True)
Path('public/CNAME').write_text('tracyosborn.com\n')
Path('public/robots.txt').write_text('User-agent: *\nDisallow:\n\nSitemap: https://tracyosborn.com/sitemap.xml\n')
manifest={'articles':[],'pages':[]}
for p in sorted(Path('pages/articles').glob('*.html')):
 text=p.read_text()
 meta={}
 for line in text.split('{% extends',1)[0].strip().splitlines():
  if ': ' in line or line.endswith(':'):
   key,_,value=line.partition(':');meta[key]=value.strip()
 meta['slug']=p.stem
 meta['date']=datetime.strptime(meta['date'],'%Y-%m-%d').date().isoformat()
 body=block(text,'body') or ''
 # Mixed HTML/Markdown sections are separated explicitly to preserve figures.
 body=re.sub(r'{% filter markdown %}\s*','\n\n',body)
 body=re.sub(r'{% endfilter(?: markdown)? %}','\n\n',body)
 body=clean(body).strip()
 # Python Markdown and CommonMark interpret three malformed emphasis spans
 # differently. Preserve those published paragraphs verbatim as portable HTML.
 phrases = {
  'how-i-run-a-marketplace-with-eleven-different-properties-and-5000-vendors': ['When I list it all out', '**I launched our weddings blog'],
  'moving-to-toronto-opening-up-to-new-opportunities': ["**Along with workshops"],
  'the-worst-enemy-to-my-startup-is-depression': ['**Basically', "**It's impossible"],
 }
 if p.stem in phrases:
  old=Path('.build/articles',p.stem,'index.html').read_text()
  for phrase in phrases[p.stem]:
   needle=phrase.lstrip('*')
   published=next(x for x in re.findall(r'<p>.*?</p>',old,re.S) if needle in re.sub('<[^>]+>','',x))
   paragraphs=body.split('\n\n')
   body='\n\n'.join(published if x.strip().startswith(phrase) else x for x in paragraphs)
 if '{%' in body or '{{' in body:raise ValueError(p)
 Path('src/content/articles',p.stem+'.md').write_text('---\n'+json.dumps(meta,ensure_ascii=False,indent=2)+'\n---\n\n'+body+'\n')
 manifest['articles'].append({'slug':p.stem,'url':'/articles/'+p.stem+'/','source':str(p)})
for p in sorted(Path('pages').glob('*.html')):
 text=p.read_text()
 content=block(text,'content') or ''
 category=re.search(r'{% if "(.*?)" in post.category %}',content)
 data={'slug':p.stem,'title':block(text,'title') or 'Tracy Osborn','bodyId':(re.search(r'<body id="(.*?)"',text) or ['',''])[1]}
 if category:data['category']=category[1]
 for name in ['intro','subheader','contentsize']:
  value=block(text,name)
  if value is not None:data[name]=clean(value)
 if p.stem not in ['index','articles'] and not category:
  data['content']=clean(content)
 Path('src/content/pages',p.stem+'.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 manifest['pages'].append({'slug':p.stem,'url':'/' if p.stem=='index' else '/'+p.stem+'/','source':str(p)})
Path('scripts/migration-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Migrated {len(manifest["articles"])} articles and {len(manifest["pages"])} pages.')
