// Keep references to archived articles on this site, including historical aliases.
export function createArticleLinkResolver(entries) {
  const urls=new Map(),mediumIds=new Map();
  const key=url=>url.hostname.replace(/^www\./,'')+url.pathname.replace(/\/$/,'');
  for(const entry of entries){
    if(!entry.imported)continue;
    const local=`/articles/${entry.slug}/`;
    for(const value of [entry.originalUrl,entry.sourceUrl].filter(Boolean)){
      const url=new URL(value);
      if(['tracyosborn.com','limedaring.com'].includes(url.hostname))continue;
      urls.set(key(url),local);
      if(['hellowebbooks.com','hellowebapp.com'].includes(url.hostname)){
        for(const host of ['hellowebbooks.com','hellowebapp.com']){const alias=new URL(url);alias.hostname=host;urls.set(key(alias),local);}
      }
      if(['medium.com','code.likeagirl.io','blog.prototypr.io'].includes(url.hostname)){
        const id=url.pathname.match(/([a-f0-9]{10,})$/)?.[1];if(id)mediumIds.set(id,local);
      }
    }
  }
  return function resolve(href){
    try{
      const url=new URL(href);
      let target=urls.get(key(url));
      if(!target&&['medium.com','code.likeagirl.io','blog.prototypr.io'].includes(url.hostname))target=mediumIds.get(url.pathname.match(/([a-f0-9]{10,})$/)?.[1]);
      return target?target+url.hash:href;
    }catch{return href;}
  };
}
