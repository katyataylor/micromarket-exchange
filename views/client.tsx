import { createElement, type ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { AuthProvider } from './auth';
import { pages } from './registry';
import type { PageName, PagePropsMap } from './types';

const root = document.getElementById('root');
const propsEl = document.getElementById('page-props');

if (root && propsEl) {
  const page = root.dataset.page as PageName | undefined;
  const initialAuthenticated = root.dataset.auth === '1';
  const props = JSON.parse(propsEl.textContent || '{}') as PagePropsMap[PageName];
  const Page = page ? (pages[page] as ComponentType<PagePropsMap[PageName]>) : undefined;
  if (Page) {
    hydrateRoot(
      root,
      createElement(AuthProvider, { initialAuthenticated }, createElement(Page, props)),
    );
  }
}