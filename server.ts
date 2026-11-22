import { timingSafeEqual } from 'crypto';
import esbuild from 'esbuild';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { AuthProvider, buildLoginUrl, hasAuthCookie, sanitizeNextPath } from './views/auth';
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

type RenderOptions = {
  req?: express.Request;
  titleOverride?: string;
};

function renderDocument<K extends PageName>(
  name: K,
  props: PagePropsMap[K],
  options?: RenderOptions,
) {
  const Page = pages[name] as ComponentType<PagePropsMap[K]>;
  const meta = pageMeta[name];
  const title = options?.titleOverride ?? meta.title;
  const isAuthenticated = hasAuthCookie(options?.req?.headers.cookie);
  const body = renderToString(
    createElement(
      AuthProvider,
      { initialAuthenticated: isAuthenticated },
      createElement(Page, props),
    ),
  );
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
  <div id="root" data-page="${name}" data-auth="${isAuthenticated ? '1' : '0'}">${body}</div>
  <script id="page-props" type="application/json">${safeProps}</script>
  <script src="/js/app.js" defer></script>
</body>
</html>`;
}

function requireMemberAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (hasAuthCookie(req.headers.cookie)) {
    next();
    return;
  }
  const target = sanitizeNextPath(req.originalUrl) ?? '/marketplace';
  res.redirect(buildLoginUrl(target));
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

  app.get('/homepage', (req, res) => {
    res.send(renderDocument('homepage', {}, { req }));
  });

  app.get('/infopage', (req, res) => {
    res.send(renderDocument('infopage', {}, { req }));
  });

  app.get('/faq', (_req, res) => {
    res.redirect('/infopage');
  });

  app.get('/login', (req, res) => {
    const rawNext = typeof req.query.next === 'string' ? req.query.next : null;
    const nextUrl = sanitizeNextPath(rawNext);
    res.send(renderDocument('login', { nextUrl }, { req }));
  });

  app.get('/signin', (req, res) => {
    const rawNext = typeof req.query.next === 'string' ? req.query.next : null;
    res.redirect(rawNext ? buildLoginUrl(rawNext) : '/login');
  });

  app.get('/registration', (req, res) => {
    res.send(renderDocument('registration', {}, { req }));
  });

  app.get('/registration/success', (req, res) => {
    res.send(renderDocument('registrationSuccess', {}, { req }));
  });

  app.get('/registration/success-observer', (req, res) => {
    res.send(renderDocument('registrationSuccessObserver', {}, { req }));
  });

  app.get('/contact', (req, res) => {
    res.send(renderDocument('contact', {}, { req }));
  });

  app.get('/contactpage', (req, res) => {
    res.send(renderDocument('contact', {}, { req }));
  });

  // ── Member-only (paywalled) routes ──────────────────────────────────────────

  app.get('/marketplace', requireMemberAuth, (req, res) => {
    res.send(renderDocument('marketplace', { listings: mockListings }, { req }));
  });

  app.get('/product/:id', requireMemberAuth, (req, res) => {
    const productId = String(req.params.id);
    const listing = mockListings.find((item) => String(item.id) === productId);
    if (!listing) {
      res.status(404).send(renderDocument('notFound', {}, { req }));
      return;
    }
    res.send(
      renderDocument(
        'product',
        { productId, listing },
        {
          req,
          titleOverride: `${listing.name} — MicroMarket Exchange`,
        },
      ),
    );
  });

  app.get('/product', requireMemberAuth, (_req, res) => {
    res.redirect('/marketplace');
  });

  app.get('/sell/list', requireMemberAuth, (req, res) => {
    res.send(renderDocument('listProduct', {}, { req }));
  });

  app.get('/list-product', requireMemberAuth, (req, res) => {
    res.send(renderDocument('listProduct', {}, { req }));
  });

  app.get('/listProduct', (req, res) => {
    if (!hasAuthCookie(req.headers.cookie)) {
      res.redirect(buildLoginUrl('/list-product'));
      return;
    }
    res.redirect('/list-product');
  });

  app.get('/account', requireMemberAuth, (req, res) => {
    res.send(renderDocument('account', {}, { req }));
  });

  app.get('/account/listings', requireMemberAuth, (_req, res) => {
    res.redirect('/account#listings');
  });

  app.get('/account/*', requireMemberAuth, (req, res) => {
    const rawSub = req.path.replace(/^\/account\/+/, '').split('/')[0]?.toLowerCase() ?? '';
    const validPanels = new Set([
      'messages',
      'orders',
      'transactions',
      'details',
      'listings',
      'subscription',
    ]);
    if (validPanels.has(rawSub)) {
      res.redirect(`/account#${rawSub}`);
      return;
    }
    res.redirect('/account');
  });

  app.get('/cart', requireMemberAuth, (req, res) => {
    res.send(renderDocument('cart', {}, { req }));
  });

  app.use((req, res) => {
    res.status(404).send(renderDocument('notFound', {}, { req }));
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
