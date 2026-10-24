// One-time archival import. Sources must be full, publicly accessible articles.
// HTML snapshots come from fetch-external.mjs or the browser's rendered article DOM.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import {load} from 'cheerio';
const directory=process.argv[2];
if(!directory)throw Error('Pass the source snapshot directory.');
const markdown=new MarkdownIt({html:true});
const mediumSources={
 'external-conference-proposal-rejections':'conference',
 'external-third-kickstarter':'kickstarter',
 'external-selling-weddinglovely':'selling',
 'external-dangerous-thing':'hiking',
};
const designSources={
 'external-nondesigners-1':'tutorial-design-for-nondesigners',
 'external-nondesigners-2':'tutorial-design-for-non-designers-part-2',
 'external-nondesigners-3':'tutorial-design-for-non-designers-part-3',
};
const entries=fs.readdirSync('src/content/articles').map(file=>{const data=matter(fs.readFileSync('src/content/articles/'+file,'utf8')).data;return {file,...data,external:data.external||data.originalUrl};}).filter(p=>p.external);
const urlMap=new Map();
function key(url){const parsed=new URL(url);return parsed.hostname.replace(/^www\./,'')+parsed.pathname.replace(/\/$/,'');}
for(const entry of entries){if(entry.slug==='external-technical-writing')continue;urlMap.set(key(entry.external),`/articles/${entry.slug}/`);if(new URL(entry.external).hostname==='hellowebapp.com')urlMap.set(key(entry.external.replace('hellowebapp.com','hellowebbooks.com')),`/articles/${entry.slug}/`);if(designSources[entry.slug])urlMap.set(key(`https://hellowebbooks.com/news/${designSources[entry.slug]}/`),`/articles/${entry.slug}/`);}
const assets=[],report=[];
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const normalizedText=$=>$.root().text().replace(/\s+/g,' ').trim();
function clean(html,base){
 const $=load(html,null,false);
 $('script,style,form,input,button,svg,noscript').remove();
 $('span').filter((i,el)=>$(el).text()==='Press enter or click to view image in full size').remove();
 $('[data-cfemail]').each((i,el)=>{const code=$(el).attr('data-cfemail');const key=parseInt(code.slice(0,2),16);const email=code.slice(2).match(/../g).map(c=>String.fromCharCode(parseInt(c,16)^key)).join('');$(el).text(email);if(el.tagName==='a')$(el).attr('href','mailto:'+email);});
 // Medium's picture sources duplicate img elements. Use one observed source.
 $('picture').each((i,el)=>{
  const image=$(el).find('img').first();
  if(!image.length)return;
  const candidates=($(el).find('source').first().attr('srcset')||image.attr('srcset')||'').split(',').map(value=>value.trim().split(/\s+/)).filter(x=>x[0]);
  const sized=candidates.filter(x=>parseInt(x[1])<=1600).sort((a,b)=>parseInt(b[1])-parseInt(a[1]));
  if(sized[0])image.attr('src',sized[0][0]);
  $(el).replaceWith(image);
 });
 $('*').each((i,el)=>{
  for(const name of Object.keys(el.attribs||{}))if(name.startsWith('on')||name.startsWith('data-')||['class','style','srcset','sizes','role','tabindex','target'].includes(name))$(el).removeAttr(name);
 });
 // Inline embeds use original providers, without Medium's Embedly wrapper.
 $('iframe').each((i,el)=>{
  let src=$(el).attr('src');if(!src)return $(el).remove();
  const url=new URL(src,base);
  if(url.hostname==='cdn.embedly.com'){
   const provider=url.searchParams.get('schema');
   if(provider==='youtube')src=url.searchParams.get('src');
   else if(provider==='twitter'){
    const tweet=url.searchParams.get('url');
    const image=url.searchParams.get('image');
    let imageUrl=image?new URL(image).searchParams.get('url'):null;
    const figure=$('<figure></figure>');
    if(imageUrl)figure.append($('<img>').attr('src',imageUrl).attr('alt','Guess when my Kickstarter ended — resting heart rate during the campaign.'));
    figure.append($('<figcaption></figcaption>').append($('<a></a>').attr('href',tweet).text('Guess when my Kickstarter ended. — Tracy Osborn, February 18, 2017')));
    $(el).closest('figure').replaceWith(figure);return;
   }else {const link=url.searchParams.get('url');if(link)$(el).replaceWith($('<p></p>').append($('<a></a>').attr('href',link).text('View original embedded media')));else $(el).remove();return;}
  }
  const final=new URL(src,base);
  if(!['www.youtube.com','youtube.com','www.youtube-nocookie.com','player.vimeo.com','www.kickstarter.com','w.soundcloud.com'].includes(final.hostname)){
   $(el).replaceWith($('<p></p>').append($('<a></a>').attr('href',final.href).text('View original embedded media')));return;
  }
  $(el).attr('src',final.href).attr('loading','lazy').attr('title',$(el).attr('title')||'Video included with the original article').attr('allowfullscreen','');
 });
 $('[data-cfemail]').each((i,el)=>{$(el).remove();});
 $('a[href]').each((i,el)=>{
  const href=$(el).attr('href');if(href.startsWith('#')||href.startsWith('mailto:'))return;
  try{const url=new URL(href,base);if(!['https:','http:'].includes(url.protocol)){$(el).removeAttr('href');return;}
   if(key(url.href)===key(base)&&url.hash)$(el).attr('href',url.hash);
   else $(el).attr('href',(urlMap.get(key(url.href))||url.href)+(!urlMap.has(key(url.href))?'':url.hash));
  }catch{$(el).removeAttr('href');}
 });
 return $;
}
for(const entry of entries){
 let originalUrl=entry.external,sourceUrl=entry.external,html,headline;
 if(mediumSources[entry.slug]){
  const source=load(fs.readFileSync(path.join(directory,`medium-${mediumSources[entry.slug]}.html`),'utf8'));
  const chosen=new Set(),blocks=[];let bodyStarted=false;
  for(const el of source('article [data-selectable-paragraph],article figure,article hr').toArray()){
   const tag=el.tagName;
   if(tag==='h1'||tag==='figcaption'||(tag!=='figure'&&source(el).parents('figure').length))continue;
   if(tag==='h2'&&!bodyStarted){headline=source(el).text();continue;}
   if(tag==='p'||tag==='li')bodyStarted=true;
   const container=source(el).parentsUntil('article').filter('blockquote,ul,ol,pre').last()[0]||el;
   if(chosen.has(container))continue;chosen.add(container);
   blocks.push(source.html(container));
  }
  html=blocks.join('\n\n');
 }else if(entry.slug==='external-technical-writing'){
  // This old entry accidentally linked to a completely different design article.
  originalUrl='https://medium.com/@tracymakes/five-tips-for-improving-your-technical-writing-and-documentation-47353723c8a7';
  sourceUrl='https://tracyosborn.com/articles/writing-clearly/';
  const original=matter(fs.readFileSync('src/content/articles/writing-clearly.md','utf8'));
  html=markdown.render(original.content);
 }else{
  if(designSources[entry.slug])sourceUrl=`https://hellowebbooks.com/news/${designSources[entry.slug]}/`;
  else sourceUrl=new URL(entry.external.replace('hellowebapp.com','hellowebbooks.com')).href;
  const source=load(fs.readFileSync(path.join(directory,entry.slug+'.html'),'utf8'));
  if(!source('#post-body').length)throw Error(`Missing article body: ${entry.slug}`);
  html=source('#post-body').html();
 }
 const $=clean(html,sourceUrl);
 // Medium presents decorative image-zoom hints as buttons; removed above.
 $('figure').each((i,el)=>{if(!$(el).find('img,iframe,a').length&&!$(el).text().trim())$(el).remove();});
 const sourceText=normalizedText($);
 if(sourceText.length<1000)throw Error(`Article may be incomplete: ${entry.slug}`);
 $('img[src]').each((i,el)=>{
  const url=new URL($(el).attr('src'),sourceUrl).href;
  const id=hash(url).slice(0,12);
  let ext=path.extname(new URL(url).pathname).toLowerCase();
  if(url.includes('/format:webp/'))ext='.webp';
  if(!['.png','.jpg','.jpeg','.gif','.webp','.svg'].includes(ext))ext='.jpg';
  const destination=`/static/imported/${entry.slug}/${id}${ext}`;
  assets.push({url,destination});
  $(el).attr('src',destination).attr('loading','lazy').attr('decoding','async');
  if(!$(el).attr('alt'))$(el).attr('alt','');
 });
 const importedHtml=$.html().trim();
 const {file,...data}=entry;
 const updated={...data,external:'',originalUrl,sourceUrl,imported:true,...(headline?{headline}:{})};
 fs.writeFileSync('src/content/articles/'+file,'---\n'+JSON.stringify(updated,null,2)+'\n---\n\n'+importedHtml+'\n');
 report.push({slug:entry.slug,originalUrl,sourceUrl,textSha256:hash(sourceText),textLength:sourceText.length,images:$('img').length,videos:$('iframe').length,htmlSha256:hash(importedHtml)});
}
fs.writeFileSync('scripts/external-import-manifest.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(directory,'assets.json'),JSON.stringify(assets,null,2)+'\n');
console.log(JSON.stringify({imported:report.length,assets:assets.length,assetManifest:path.join(directory,'assets.json')},null,2));
