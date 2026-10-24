// Prefer the author's local image originals; download only missing article images.
import fs from 'node:fs';import path from 'node:path';
const input=process.argv[2];
const assets=JSON.parse(fs.readFileSync(input,'utf8'));
let cursor=0,copied=0,downloaded=0;const failures=[];
async function worker(){while(cursor<assets.length){const asset=assets[cursor++];try{
 const url=new URL(asset.url),destination=path.join('public',asset.destination);
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 const local=url.hostname==='hellowebbooks.com'?'/Users/tracy/projects/hellowebbooks'+decodeURIComponent(url.pathname):null;
 if(local&&fs.existsSync(local)){fs.copyFileSync(local,destination);copied++;continue;}
 const response=await fetch(asset.url,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(`HTTP ${response.status}`);
 if(!response.headers.get('content-type')?.startsWith('image/'))throw Error('Source did not return an image');
 fs.writeFileSync(destination,Buffer.from(await response.arrayBuffer()));downloaded++;
 }catch(error){failures.push({...asset,error:error.message});}}}
await Promise.all(Array.from({length:4},worker));
fs.writeFileSync(input.replace('assets.json','asset-results.json'),JSON.stringify({copied,downloaded,failures},null,2)+'\n');
console.log(JSON.stringify({copied,downloaded,failures},null,2));if(failures.length)process.exitCode=1;
