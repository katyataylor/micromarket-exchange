import { createElement, type ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { pages } from './registry';
import type { PageName, PagePropsMap } from './types';

const root = document.getElementById('root');
const propsEl = document.getElementById('page-props');

if (root && propsEl) {
  const page = root.dataset.page as PageName | undefined;
  const props = JSON.parse(propsEl.textContent || '{}') as PagePropsMap[PageName];
  const Page = page ? pages[page] as ComponentType<PagePropsMap[PageName]> : undefined;
  if (Page) {
    hydrateRoot(root, createElement(Page, props));
  }
}