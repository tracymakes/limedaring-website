// Read-only comparison against the public website. Run after npm run build.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {load} from 'cheerio';
const manifest=JSON.parse(fs.readFileSync('scripts/migration-manifest.json','utf8'));
const entries=[...manifest.pages,...manifest.articles];
const offline=process.argv[2];
const directory=offline||fs.mkdtempSync(path.join(os.tmpdir(),'tracy-live-'));
const normalize=s=>s.replace(/\s+/g,' ').trim().replace(/\.\.\./g,'…');
const results=[];let cursor=0;
async function worker(){while(cursor<entries.length){const entry=entries[cursor++];try{
 const response=offline?{ok:true,status:200}:await fetch('https://tracyosborn.com'+entry.url,{signal:AbortSignal.timeout(15000)});
 const html=offline?fs.readFileSync(path.join(directory,entry.slug+'.html'),'utf8'):await response.text();if(!offline)fs.writeFileSync(path.join(directory,entry.slug+'.html'),html);
 if(!response.ok){results.push({url:entry.url,status:response.status});continue;}
 const a=load(html),b=load(fs.readFileSync(path.join('dist',entry.url,'index.html'),'utf8'));
 const selector=entry.url.startsWith('/articles/')?'.post-body':'#content';
 for(const el of a('[data-cfemail]').toArray()){const code=a(el).attr('data-cfemail');const key=parseInt(code.slice(0,2),16);a(el).text(code.slice(2).match(/../g).map(c=>String.fromCharCode(parseInt(c,16)^key)).join(''));}
 const text=($)=>{const copy=$(selector).clone();copy.find('h1,h2,h3,h4,p,div,ul,li,hr,section').prepend(' ').append(' ');return normalize(copy.text());};
 const old=text(a),fresh=text(b);
 let i=0;while(old[i]===fresh[i]&&i<old.length)i++;
 results.push({url:entry.url,status:response.status,match:old===fresh,...(old===fresh?{}:{old:old.slice(i,i+160),new:fresh.slice(i,i+160)})});
 }catch(error){results.push({url:entry.url,error:error.message});}}}
await Promise.all(Array.from({length:4},worker));
console.log(JSON.stringify({directory,checked:results.length,matched:results.filter(r=>r.match).length,differences:results.filter(r=>!r.match)},null,2));
