import {posts,pages,site,xml} from '../lib/content';
export function GET() {
  const urls = [...pages.filter(p=>p.slug!=='error').map(p=>p.slug==='index'?'/':`/${p.slug}/`),...posts.map(p=>p.url)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${xml(site+url)}</loc></url>`).join('')}</urlset>`, {headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
