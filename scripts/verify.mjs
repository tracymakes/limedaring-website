import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import {load} from 'cheerio';
import {createArticleLinkResolver} from '../src/lib/article-links.mjs';
const imports=JSON.parse(fs.readFileSync('scripts/external-import-manifest.json','utf8'));
const resolveArticleLink=createArticleLinkResolver(imports.map(entry=>({...entry,imported:true})));
const imported=new Map(imports.map(entry=>[entry.slug,entry]));
const manifest=JSON.parse(fs.readFileSync('scripts/migration-manifest.json','utf8'));
const pageSources=fs.readdirSync('src/content/pages').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(`src/content/pages/${f}`,'utf8')));
const archivePages=pageSources.filter(p=>p.slug==='articles'||p.category);
const normal=s=>s.replace(/\s+/g,' ').trim();
const text=($,selector)=>{const copy=$(selector).clone();copy.find('h1,h2,h3,h4,p,div,ul,li,hr,section').prepend(' ').append(' ');return normal(copy.text());};
const legacyDirectory=process.env.LEGACY_BUILD_DIR || '.build';
const requireLegacy=process.env.REQUIRE_LEGACY_BASELINE==='true';
const failures=[],warnings=[];
const expect=(condition,message)=>{if(!condition)failures.push(message);};
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function assetSignature($,selector){return $(selector).map((i,e)=>`${e.tagName}:${$(e).attr('src')||resolveArticleLink($(e).attr('href')||'')}:${$(e).attr('alt')||''}`).get();}
for(const entry of [...manifest.pages,...manifest.articles]){
 const file=path.join('dist',entry.url,'index.html');
 expect(fs.existsSync(file),`Missing URL ${entry.url}`);
 if(!fs.existsSync(file))continue;
 const html=fs.readFileSync(file,'utf8'),$=load(html);
 const nonCode=$.root().clone();nonCode.find('pre,code').remove();
 expect(!/{%|{{/.test(nonCode.html()),`Unrendered template at ${entry.url}`);
 expect($('link[rel=canonical]').attr('href')===`https://tracyosborn.com${entry.url}`,`Wrong canonical ${entry.url}`);
 const legacyFile=path.join(legacyDirectory,entry.url,'index.html');
 if(requireLegacy)expect(fs.existsSync(legacyFile),`Missing required preservation baseline ${entry.url}`);
 if(fs.existsSync(legacyFile)){
  const old=load(fs.readFileSync(legacyFile,'utf8'));
  const selector=entry.url.startsWith('/articles/')?'.post-body':entry.url==='/articles/'||['authorship','design','development','entrepreneurship','howto','onspeaking','outdoorsy','personal','women-in-tech'].includes(entry.slug)?null:'#content';
  if(selector && entry.url!=='/' && !imported.has(entry.slug)){
   // The current contact address was updated on the contact and speaking pages.
   const legacyText=text(old,selector).replace(/\.\.\./g,'…');
   const expectedText=['contact','speaking'].includes(entry.slug)?legacyText.replaceAll('tracy@limedaring.com','tracy@tracyosborn.com'):legacyText;
   expect(expectedText===text($,selector).replace(/\.\.\./g,'…'),`Text changed ${entry.url}`);
   for(const tag of ['img','iframe','video','audio'])expect(JSON.stringify(assetSignature(old,`${selector} ${tag}`))===JSON.stringify(assetSignature($,`${selector} ${tag}`)),`${tag} changed ${entry.url}`);
   if(selector==='.post-body')expect(JSON.stringify(assetSignature(old,'.post-body a'))===JSON.stringify(assetSignature($,'.post-body a')),`Article links changed ${entry.url}`);
  }
  if(entry.url!=='/' && !entry.url.startsWith('/articles/') && !archivePages.some(p=>p.slug===entry.slug))expect(text(old,'.intro')===text($,'.intro'),`Introduction changed ${entry.url}`);
 }
 for(const el of $('[href], [src]').toArray()){
  const value=$(el).attr('href')||$(el).attr('src');
  if(!value||!value.startsWith('/')||value.startsWith('//'))continue;
  const url=new URL(value,'https://tracyosborn.com');
  let target=decodeURIComponent(url.pathname);
  let destination=path.join('dist',target);
  if(target.endsWith('/')||!path.extname(target))destination=path.join(destination,'index.html');
  if(!fs.existsSync(destination))warnings.push(`${entry.url}: missing existing target ${value}`);
 }
}
// The approved homepage and archive replace their legacy presentation.
const home=load(fs.readFileSync('dist/index.html','utf8'));
expect(home('.story-intro').length===1,'Approved story homepage missing');
expect(home('.mockup-switcher').length===0,'Homepage still has mockup controls');
for(const slug of ['index',...archivePages.map(p=>p.slug)]){
 const $=load(fs.readFileSync(slug==='index'?'dist/index.html':`dist/${slug}/index.html`,'utf8'));
 expect(!$('meta[name=robots]').attr('content')?.includes('noindex'),`Production page not indexable ${slug}`);
 expect(!$('a[href^="/mockups/"]').length,`Production navigation points to mockups ${slug}`);
}
for(const page of archivePages){
 const $=load(fs.readFileSync(`dist/${page.slug}/index.html`,'utf8'));
 const actual=$('.archive-year li a').map((i,e)=>$(e).attr('href')).get();
 const expected=manifest.articles.filter(p=>page.slug==='articles'||matter(fs.readFileSync(`src/content/articles/${p.slug}.md`,'utf8')).data.category.includes(page.category)).map(p=>p.url);
 expect(actual.length===expected.length && expected.every(url=>actual.includes(url)),`Archive coverage mismatch ${page.slug}`);
}
// Imported articles intentionally replace previously empty outbound-link stubs.
// Verify complete bodies and local illustrations against their import inventory.
for(const entry of imports){
 const file=`src/content/articles/${entry.slug}.md`;
 const {data,content}=matter(fs.readFileSync(file,'utf8'));
 const $=load(fs.readFileSync(`dist/articles/${entry.slug}/index.html`,'utf8'));
 const body=$('.post-body');
 const rawText=body.text().replace(/\s+/g,' ').trim();
 const checksum=crypto.createHash('sha256').update(rawText).digest('hex');
 expect(data.external==='' && data.imported===true,`External routing not replaced ${entry.slug}`);
 expect(checksum===entry.textSha256,`Imported text changed ${entry.slug}`);
 expect(body.find('img').length===entry.images,`Imported illustration count changed ${entry.slug}`);
 expect(body.find('iframe').length===entry.videos,`Imported video count changed ${entry.slug}`);
 expect($('.original-publication a').attr('href')===entry.originalUrl,`Missing source attribution ${entry.slug}`);
 expect(!body.find('script,form,input,button').length,`Publisher UI present in ${entry.slug}`);
 expect(!/Press enter or click to view image|Join Medium for free|Get Tracy Osborn’s stories/.test(body.text()),`Publisher UI text present in ${entry.slug}`);
 for(const image of body.find('img').toArray())expect($(image).attr('src').startsWith('/static/imported/'),`Remote illustration ${entry.slug}`);
}
for(const file of files('dist').filter(f=>f.endsWith('.html'))){
 const $=load(fs.readFileSync(file,'utf8'));
 for(const anchor of $('a[href]').toArray()){
  const href=$(anchor).attr('href');
  if($(anchor).closest('.original-publication').length)continue;
  for(const entry of imports)expect(href!==entry.originalUrl,`Still routing to imported external article in ${file}`);
 }
}
// Byte-for-byte preservation of every original public asset.
for(const file of files('static'))expect(fs.readFileSync(file).equals(fs.readFileSync(path.join('dist',file))),`Asset changed ${file}`);
const rss=load(fs.readFileSync('dist/rss.xml','utf8'),{xml:true});
expect(rss('item').length===10,'RSS must contain ten articles');
const sitemap=load(fs.readFileSync('dist/sitemap.xml','utf8'),{xml:true});
expect(sitemap('url').length===manifest.pages.length-1+manifest.articles.length,'Sitemap coverage mismatch');
expect(fs.existsSync('dist/404.html'),'Missing custom 404');
expect(fs.readFileSync('dist/CNAME','utf8').trim()==='tracyosborn.com','Wrong publishing domain');
expect(fs.existsSync('dist/robots.txt'),'Missing robots.txt');
expect(!fs.existsSync('dist/.git'),'Git metadata must not be published');
console.log(`${manifest.articles.length} articles, ${manifest.pages.length} pages, ${imports.length} imported articles, original assets, RSS, sitemap, canonical URLs checked.`);
if(warnings.length)console.log(`Existing broken internal references (${warnings.length}):\n${[...new Set(warnings)].join('\n')}`);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log('All preservation checks passed.');
