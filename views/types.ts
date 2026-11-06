export type Listing = {
  id: number;
  name: string;
  qty: string;
  price: number;
  expires: string;
};


export type PageName =
  | 'homepage'
  | 'marketplace'
  | 'product'
  | 'listProduct'
  | 'account'
  | 'cart'
  | 'registration'
  | 'contact'
  | 'infopage';


export type PagePropsMap = {
  homepage: Record<string, never>;
  marketplace: { listings: Listing[] };
  product: { productId: string };
  listProduct: Record<string, never>;
  account: Record<string, never>;
  cart: Record<string, never>;
  registration: Record<string, never>;
  contact: Record<string, never>;
  infopage: Record<string, never>;
};