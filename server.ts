import { timingSafeEqual } from 'crypto';
import esbuild from 'esbuild';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { mockListings } from './views/data/mockListings';
import { pageMeta, pages } from './views/registry';
import type { PageName, PagePropsMap } from './views/types';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const root = fs.existsSync(path.join(__dirname, 'public'))
  ? __dirname
  : path.resolve(__dirname, '..');

function matchesPassword(candidate: string, expected: string): boolean {
  const candidateBuf = Buffer.from(candidate, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  return (
    candidateBuf.length === expectedBuf.length &&
    timingSafeEqual(candidateBuf, expectedBuf)
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderDocument<K extends PageName>(
  name: K,
  props: PagePropsMap[K],
  titleOverride?: string,
) {
  const Page = pages[name] as ComponentType<PagePropsMap[K]>;
  const meta = pageMeta[name];
  const title = titleOverride ?? meta.title;
  const body = renderToString(createElement(Page, props));
  const styles = meta.styles
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join('\n  ');
  const safeProps = JSON.stringify(props).replace(/</g, '\\u003c');

  const description =
    'Verified B2B agricultural microingredient marketplace for FDA-licensed operations and licensed feed mills.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="/images/mme-logo.png">
  <link rel="icon" type="image/png" href="/images/small-mme-logo.png">
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

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    await esbuild.build({
      entryPoints: [path.join(root, 'views', 'client.tsx')],
      bundle: true,
      outfile: path.join(root, 'public/js/app.js'),
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      minify: true,
      logLevel: 'warning',
    });
  }

  const app = express();

  const reviewPassword = process.env.REVIEW_PASSWORD ?? '';
  if (reviewPassword.length > 0) {
    app.use((req, res, next) => {
      const authHeader = req.headers.authorization ?? '';
      const [scheme, encoded] = authHeader.split(' ');
      let providedPassword = '';
      if (scheme === 'Basic' && encoded) {
        try {
          const decoded = Buffer.from(encoded, 'base64').toString('utf8');
          const colonIdx = decoded.indexOf(':');
          providedPassword = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;
        } catch {
          providedPassword = '';
        }
      }

      if (matchesPassword(providedPassword, reviewPassword)) {
        next();
        return;
      }

      res.setHeader('WWW-Authenticate', 'Basic realm="MicroMarket Exchange Preview"');
      res.status(401).send('Password required');
    });
  }

  app.get('/favicon.ico', (_req, res) => {
    res.sendFile(path.join(root, 'public/images/small-mme-logo.png'));
  });

  app.use(express.static(path.join(root, 'public')));

  app.get('/', (_req, res) => {
    res.redirect('/homepage');
  });

  app.get('/homepage', (_req, res) => {
    res.send(renderDocument('homepage', {}));
  });

  app.get('/marketplace', (_req, res) => {
    res.send(renderDocument('marketplace', { listings: mockListings }));
  });

  app.get('/product/:id', (req, res) => {
    const listing = mockListings.find((item) => String(item.id) === req.params.id);
    if (!listing) {
      res.status(404).send(renderDocument('notFound', {}));
      return;
    }
    res.send(
      renderDocument(
        'product',
        { productId: req.params.id, listing },
        `${listing.name} — MicroMarket Exchange`,
      ),
    );
  });

  app.get('/sell/list', (_req, res) => {
    res.send(renderDocument('listProduct', {}));
  });

  app.get('/list-product', (_req, res) => {
    res.send(renderDocument('listProduct', {}));
  });

  app.get('/listProduct', (_req, res) => {
    res.redirect('/list-product');
  });

  app.get('/account', (_req, res) => {
    res.send(renderDocument('account', {}));
  });

  app.get('/cart', (_req, res) => {
    res.send(renderDocument('cart', {}));
  });

  app.get('/login', (_req, res) => {
    res.send(renderDocument('login', {}));
  });

  app.get('/signin', (_req, res) => {
    res.redirect('/login');
  });

  app.get('/registration', (_req, res) => {
    res.send(renderDocument('registration', {}));
  });

  app.get('/registration/success', (_req, res) => {
    res.send(renderDocument('registrationSuccess', {}));
  });

  app.get('/registration/success-observer', (_req, res) => {
    res.send(renderDocument('registrationSuccessObserver', {}));
  });

  app.get('/contact', (_req, res) => {
    res.send(renderDocument('contact', {}));
  });

  app.get('/contactpage', (_req, res) => {
    res.send(renderDocument('contact', {}));
  });

  app.get('/infopage', (_req, res) => {
    res.send(renderDocument('infopage', {}));
  });

  app.use((_req, res) => {
    res.status(404).send(renderDocument('notFound', {}));
  });

  app.listen(PORT, HOST, () => {
    console.log('\n🚀 Ag Marketplace Platform Live!');
    console.log(`🔗 Listening on http://${HOST}:${PORT}/homepage\n`);
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
