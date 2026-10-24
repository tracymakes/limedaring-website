import {posts,site,xml,postLink} from '../lib/content';
export function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Tracy Osborn</title><link>${site}</link><description>Tracy Osborn's personal blog.</description>${posts.slice(0,10).map(post=>`<item><title>${xml(post.title)}</title><description>${xml(post.html)}</description><link>${xml(new URL(postLink(post),site).href)}</link><guid isPermaLink="true">${site}${post.url}</guid><pubDate>${new Date(post.date+'T12:00:00Z').toUTCString()}</pubDate></item>`).join('')}</channel></rss>`, {headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
}
