import type { ComponentType } from 'react';
import { Account } from './account';
import { Cart } from './cart';
import { ContactPage } from './contactpage';
import { Homepage } from './homepage';
import { InfoPage } from './infoPage';
import { ListProduct } from './listProduct';
import { Marketplace } from './marketplace';
import { ProductPage } from './product-page';
import { Registration } from './registration';
import type { PageName, PagePropsMap } from './types';

export const pages: { [K in PageName]: ComponentType<PagePropsMap[K]> } = {
  homepage: Homepage,
  marketplace: Marketplace,
  product: ProductPage,
  listProduct: ListProduct,
  account: Account,
  cart: Cart,
  registration: Registration,
  contact: ContactPage,
  infopage: InfoPage,
};

export const pageMeta: Record<PageName, { title: string; styles: string[] }> = {
  homepage: { title: 'MicroMarket Exchange', styles: ['/css/marketplace.css'] },
  marketplace: { title: 'MicroMarket Exchange — Browse Listings', styles: ['/css/marketplace.css'] },
  product: { title: 'Product Detail — MicroMarket Exchange', styles: ['/css/marketplace.css', '/css/PDP.css'] },
  listProduct: { title: 'Submit a New Listing — MicroMarket Exchange', styles: ['/css/product-listing.css'] },
  account: { title: 'My Account — MicroMarket Exchange', styles: ['/css/account.css'] },
  cart: { title: 'Cart & Watchlist — MicroMarket Exchange', styles: ['/css/cart.css'] },
  registration: { title: 'Sign Up', styles: ['/css/registration.css'] },
  contact: { title: 'Sign Up', styles: ['/css/contactpage.css'] },
  infopage: { title: 'Sign Up', styles: [] },
};