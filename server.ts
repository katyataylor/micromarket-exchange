import esbuild from 'esbuild';
import express from 'express';
import path from 'path';
import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { pageMeta, pages } from './views/registry';
import type { Listing, PageName, PagePropsMap } from './views/types';

const PORT = 3000;
// const root = process.cwd();
const root = __dirname;

async function main() {
await esbuild.build({
  entryPoints: [path.join(root, 'views','client.tsx')],
  bundle: true,
  outfile: path.join(root, 'public/js/app.js'),
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  logLevel: 'warning',
});

const mockListings: Listing[] = [
  { id: 101, name: 'USP Grade Citric Acid Powder', qty: '450 lbs', price: 1200, expires: '2027-04-12' },
  { id: 102, name: 'Organic Xanthan Gum Batch B', qty: '200 lbs', price: 2400, expires: '2026-11-30' },
  { id: 103, name: 'Pure Ascorbic Acid (Vitamin C)', qty: '600 lbs', price: 4100, expires: '2027-01-15' },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderDocument<K extends PageName>(name: K, props: PagePropsMap[K]) {
  const Page = pages[name] as ComponentType<PagePropsMap[K]>;
  const meta = pageMeta[name];
  const body = renderToString(createElement(Page, props));
  const styles = meta.styles
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join('\n  ');
  const safeProps = JSON.stringify(props).replace(/</g, '\\u003c');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.title)}</title>
  <link rel="stylesheet" href="/css/global.css">
  ${styles}
</head>
<body>
  <div id="root" data-page="${name}">${body}</div>
  <script id="page-props" type="application/json">${safeProps}</script>
  <script src="/js/app.js" defer></script>
</body>
</html>`;
}

const app = express();

app.use(express.static(path.join(root, 'public')));

app.get('/homepage', (_req, res) => {
  res.send(renderDocument('homepage', {}));
});

app.get('/marketplace', (_req, res) => {
  res.send(renderDocument('marketplace', { listings: mockListings }));
});

app.get('/product/:id', (req, res) => {
  res.send(renderDocument('product', { productId: req.params.id }));
});

app.get('/sell/list', (_req, res) => {
  res.send(renderDocument('listProduct', {}));
});

app.get('/account', (_req, res) => {
  res.send(renderDocument('account', {}));
});

app.get('/cart', (_req, res) => {
  res.send(renderDocument('cart', {}));
});

app.get('/registration', (_req, res) => {
  res.send(renderDocument('registration', {}));
});

app.get('/contact', (_req, res) => {
  res.send(renderDocument('contact', {}));
});

app.get('/infopage', (_req, res) => {
  res.send(renderDocument('infopage', {}));
});

app.get('/test-product', (_req, res) => {
  res.send(renderDocument('registration', {}));
});

app.listen(PORT, () => {
  console.log('\n🚀 Ag Marketplace Platform Live!');
  console.log(`🔗 Access locally at: http://localhost:${PORT}/homepage\n`);
});
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});