import fs from 'node:fs';import path from 'node:path';
const directory=process.argv[2];
for(const [slug,source] of [['external-nondesigners-1','tutorial-design-for-nondesigners'],['external-nondesigners-2','tutorial-design-for-non-designers-part-2'],['external-nondesigners-3','tutorial-design-for-non-designers-part-3']]){
 const url=`https://hellowebbooks.com/news/${source}/`;
 const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`${response.status}: ${url}`);
 fs.writeFileSync(path.join(directory,slug+'.html'),await response.text());
 console.log(JSON.stringify({slug,url,status:response.status}));
}
