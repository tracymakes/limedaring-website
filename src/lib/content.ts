import legacyOrder from '../content/post-order.json';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import {createArticleLinkResolver} from './article-links.mjs';

const markdown = new MarkdownIt({ html: true, linkify: false, typographer: false });
export const site = 'https://tracyosborn.com';
export const defaultDescription = 'The personal website of Tracy Osborn - designer, developer, author, and entreprenerd.';
export const defaultSubheader = '<h2>is an outdoorsy designer, developer, author, and entreprenerd living in Toronto, Ontario.</h2>';
export const categories = [
  ['entrepreneurship','Entrepreneurship','entrepreneurship'], ['onspeaking','Speaking','speaking'],
  ['howto','instructionals','instruction'], ['design','Design','design'], ['development','Development','development'],
  ['authorship','Authorship','authorship'], ['women-in-tech','Women in Tech','womenintech'],
  ['outdoorsy','Being Outdoors','outdoors'], ['personal','Personal','personal'],
];
export type Post = {slug: string; title: string; date: string; author: string; excerpt: string; category: string; featured: string; featuredimage: string; external: string; headline?: string; originalUrl?: string; sourceUrl?: string; imported?: boolean; html: string; url: string};
// Raw imports let Astro refresh the preview when an article is edited.
const articleFiles = import.meta.glob<string>('../content/articles/*.md', {eager:true, query:'?raw', import:'default'});
export const posts: Post[] = Object.entries(articleFiles).map(([file, source]) => {
  const {data, content} = matter(source);
  if (!data.slug || !data.title || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date))) {
    throw new Error(`Missing slug, title, or valid publication date in ${file}`);
  }
  return {...data, html: data.imported ? content.trim() : markdown.render(content) || '<p></p>', url: `/articles/${data.slug}/`} as Post;
}).sort((a, b) => b.date.localeCompare(a.date) || legacyOrder.indexOf(a.slug) - legacyOrder.indexOf(b.slug));
const resolveArticleLink = createArticleLinkResolver(posts);
for (const post of posts) {
  post.html = post.html.replace(/href=(['"])(.*?)\1/g, (match, quote, href) => `href=${quote}${resolveArticleLink(href)}${quote}`);
}
const pageFiles = import.meta.glob('../content/pages/*.json', {eager:true, import:'default'});
export const pages: any[] = Object.values(pageFiles);
export const postLink = (post: Post) => post.external || post.url;
export function truncate(value: string, words: number) {
  const list = value.trim().split(/\s+/);
  return list.length > words ? list.slice(0, words).join(' ') + ' …' : value;
}
export function dateLabel(value: string) {
  return new Date(value + 'T12:00:00Z').toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'});
}
export const xml = (value: string) => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
