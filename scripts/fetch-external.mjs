// Read-only retrieval of the author's linked publications for archival import.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import {load} from 'cheerio';
const output=fs.mkdtempSync(path.join(os.tmpdir(),'tracy-external-'));
const entries=fs.readdirSync('src/content/articles').map(file=>({file,...matter(fs.readFileSync('src/content/articles/'+file,'utf8')).data})).filter(p=>p.external);
let cursor=0;const results=[];
async function worker(){while(cursor<entries.length){const entry=entries[cursor++];try{
 const response=await fetch(entry.external,{signal:AbortSignal.timeout(25000)});
 const html=await response.text();fs.writeFileSync(path.join(output,entry.slug+'.html'),html);
 const $=load(html);results.push({slug:entry.slug,url:entry.external,finalUrl:response.url,status:response.status,title:$('h1').first().text(),articleLength:$('article').text().length,bodyLength:$('body').text().length});
 }catch(error){results.push({slug:entry.slug,url:entry.external,error:error.message});}}}
await Promise.all(Array.from({length:3},worker));
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({output,results},null,2));
