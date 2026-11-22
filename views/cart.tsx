import { type FormEvent, useEffect, useState } from 'react';
import { mockListings } from './data/mockListings';
import { Footer } from './partials/footer';
import { Header } from './partials/header';
import type { Listing } from './types';

// ── Types ─────────────────────────────────────────────────────────────────────

type CartEntry = { listingId: number; qty: number; sold?: boolean };
type WatchlistEntry = { listingId: number; qty: number; sold: boolean };

type FulfillmentMethod = 'freight' | 'pickup';

export type StoredOrderItem = {
  listingId: number;
  name: string;
  seller: string;
  qty: number;
  unitPrice: number;
  priceUnit: string;
  lotVolume: string;
};

export type StoredOrder = {
  orderId: string;
  createdAt: string;
  status: string;
  fulfillment: FulfillmentMethod;
  contactName: string;
  contactEmail: string;
  deliveryAddress: string;
  poNumber?: string;
  total: number;
  items: StoredOrderItem[];
};

// ── localStorage helpers ───────────────────────────────────────────────────────

function safeParseJSON<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

function persistCart(items: CartEntry[]) {
  localStorage.setItem('mme_cart', JSON.stringify(items));
}
function persistWatchlist(items: WatchlistEntry[]) {
  localStorage.setItem('mme_watchlist', JSON.stringify(items));
}

function getListing(id: number): Listing | undefined {
  return mockListings.find((l) => l.id === id);
}

function resolveTargetCartSection(): 'cart' | 'watchlist' | null {
  const hash = window.location.hash.replace(/^#/, '').toLowerCase();
  if (hash === 'watchlist' || hash === 'watch-list') return 'watchlist';
  if (hash === 'cart' || hash === 'your-cart' || hash === 'cartentry') return 'cart';
  const sectionParam = new URLSearchParams(window.location.search).get('section')?.toLowerCase();
  if (sectionParam === 'watchlist') return 'watchlist';
  if (sectionParam === 'cart') return 'cart';
  return null;
}

function scrollToCartSection(section: 'cart' | 'watchlist', behavior: ScrollBehavior) {
  const target = document.getElementById(section);
  if (target) {
    target.scrollIntoView({ behavior, block: 'start' });
  }
}

// ── Seed data shown when localStorage is empty ────────────────────────────────

const SEED_CART: CartEntry[] = [
  { listingId: 1, qty: 1 },
  { listingId: 2, qty: 2 },
];

const SEED_WATCHLIST: WatchlistEntry[] = [
  { listingId: 3, qty: 1, sold: false },
  { listingId: 5, qty: 1, sold: false },
  { listingId: 7, qty: 1, sold: false },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function CartHero() {
  return (
    <section className="hero-page-body">
      <div className="store-hero-bg">
        <div className="store-hero-text">
          <h6 className="gold">cart &amp; watchlist</h6>
          <div className="display">Cart &amp; Watchlist</div>
          <div className="p2">
            Review selected microingredient lots, track watched listings, and submit
            verified B2B order requests.
          </div>
        </div>
      </div>
    </section>
  );
}

function ColumnHeaders({ hasMoveAction = false }: { hasMoveAction?: boolean }) {
  return (
    <div className={`cart-col-headers${hasMoveAction ? ' cart-col-headers--watchlist' : ''}`}>
      <div className="cart-col-headers-spacer" />
      <div className="cart-col-headers-inner">
        <span className="cart-col-h-product">product</span>
        <div className="cart-col-h-qty-total">
          <span className="cart-col-h-qty">quantity</span>
          <span className="cart-col-h-total">total</span>
          <span className="cart-col-h-actions-spacer" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

type CartRowProps = {
  entry: CartEntry | WatchlistEntry;
  listing: Listing;
  checked?: boolean;
  onCheckChange?: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  /** Watchlist-only: move a single item to cart */
  onMoveToCart?: () => void;
};

function ProductRow({
  entry,
  listing,
  checked,
  onCheckChange,
  onIncrement,
  onDecrement,
  onRemove,
  onMoveToCart,
}: CartRowProps) {
  const isSold = Boolean(entry.sold);
  const rowTotal = listing.price * entry.qty;

  return (
    <div className={`cart-row${isSold ? ' cart-row--sold' : ''}`}>
      <div className="cart-row-rule" />
      <div className="cart-row-inner">
        <input
          type="checkbox"
          className="cart-checkbox"
          checked={checked ?? false}
          onChange={onCheckChange}
          disabled={isSold}
          aria-label={`Select ${listing.name}`}
        />

        <div className="cart-row-middle">
          {/* Product image + info */}
          <div className="cart-row-product">
            <a href={`/product/${listing.id}`} className="cart-row-image-link">
              <img
                className="cart-row-image"
                src={listing.images[0] || '/images/IMG_9097.jpeg'}
                alt={listing.name}
              />
            </a>
            <div className="cart-row-info">
              <div className="cart-row-name-row">
                <a href={`/product/${listing.id}`} className="cart-row-name">{listing.name}</a>
                {isSold && <span className="cart-sold-badge">Sold</span>}
              </div>
              <span className="cart-row-price">${listing.price.toFixed(2)} {listing.priceUnit}</span>
            </div>
          </div>

          {/* Quantity + total + actions */}
          <div className="cart-row-qty-total">
            <div className="cart-row-qty-control">
              <button
                type="button"
                className="cart-row-qty-btn"
                onClick={onIncrement}
                disabled={isSold}
                aria-label="Increase quantity"
              >
                +
              </button>
              <span className="cart-row-qty-value">{entry.qty}</span>
              <button
                type="button"
                className="cart-row-qty-btn"
                onClick={onDecrement}
                disabled={isSold}
                aria-label="Decrease quantity"
              >
                −
              </button>
            </div>

            <span className={`cart-row-total${isSold ? ' cart-row-total--sold' : ''}`}>
              ${rowTotal.toFixed(2)}
            </span>

            <div className={`cart-row-actions${onMoveToCart ? ' cart-row-actions--watchlist' : ''}`}>
              {onMoveToCart && (
                <button
                  type="button"
                  className="cart-row-move-btn"
                  onClick={onMoveToCart}
                  disabled={isSold}
                  title={isSold ? 'Item is no longer available' : 'Move to cart'}
                >
                  Move to Cart
                </button>
              )}
              <button
                type="button"
                className="cart-row-remove-btn"
                onClick={onRemove}
                aria-label={onMoveToCart ? 'Remove from watchlist' : 'Remove from cart'}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page component ────────────────────────────────────────────────────────

export function Cart() {
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistEntry[]>([]);
  const [checkedCart, setCheckedCart] = useState<Set<number>>(new Set());
  const [checkedWatchlist, setCheckedWatchlist] = useState<Set<number>>(new Set());

  // Checkout modal & confirmation state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>('freight');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<StoredOrder | null>(null);
  const [recentOrderBanner, setRecentOrderBanner] = useState<StoredOrder | null>(null);

  // ── Hydrate from localStorage (or seed) after mount ──────────────────────────
  useEffect(() => {
    const storedCart = localStorage.getItem('mme_cart');
    const storedWatchlist = localStorage.getItem('mme_watchlist');

    const rawCart: CartEntry[] = storedCart
      ? safeParseJSON<CartEntry[]>(storedCart, SEED_CART)
      : SEED_CART;
    const rawWatchlist: WatchlistEntry[] = storedWatchlist
      ? safeParseJSON<WatchlistEntry[]>(storedWatchlist, SEED_WATCHLIST)
      : SEED_WATCHLIST;

    const cart = rawCart.filter((item) => Boolean(getListing(item.listingId)));
    const watchlist = rawWatchlist.filter((item) => Boolean(getListing(item.listingId)));

    if (!storedCart || cart.length !== rawCart.length) persistCart(cart);
    if (!storedWatchlist || watchlist.length !== rawWatchlist.length) persistWatchlist(watchlist);

    const profile = safeParseJSON<{
      contactName?: string;
      email?: string;
      address?: string;
    } | null>(localStorage.getItem('mme_account_profile'), null);
    const session = safeParseJSON<{ email?: string; name?: string } | null>(
      localStorage.getItem('mme_session'),
      null,
    );

    if (profile?.contactName || session?.name) {
      setContactName(profile?.contactName ?? session?.name ?? '');
    }
    if (profile?.email || session?.email) {
      setContactEmail(profile?.email ?? session?.email ?? '');
    }
    if (profile?.address) {
      setDeliveryAddress(profile.address);
    }

    setCartItems(cart);
    setWatchlistItems(watchlist);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const initialTarget = resolveTargetCartSection();
    if (initialTarget) {
      requestAnimationFrame(() => {
        scrollToCartSection(initialTarget, 'auto');
      });
    }

    const onHashChange = () => {
      const target = resolveTargetCartSection();
      if (target) scrollToCartSection(target, 'smooth');
    };

    const onCartNavigate = (event: Event) => {
      const section = (event as CustomEvent<{ section?: 'cart' | 'watchlist' }>).detail?.section;
      if (section === 'cart' || section === 'watchlist') {
        scrollToCartSection(section, 'smooth');
      }
    };

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('mme:cart-navigate', onCartNavigate);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('mme:cart-navigate', onCartNavigate);
    };
  }, [mounted]);

  useEffect(() => {
    if (!checkoutOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCheckoutOpen(false);
        setConfirmedOrder(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [checkoutOpen]);

  // ── Sold-item event listener ──────────────────────────────────────────────────
  useEffect(() => {
    function handleListingSold(e: Event) {
      const detail = (e as CustomEvent<{ listingId?: number }>).detail;
      const listingId = detail?.listingId;
      if (typeof listingId !== 'number') return;

      setWatchlistItems((prev) => {
        const updated = prev.map((item) =>
          item.listingId === listingId ? { ...item, sold: true } : item,
        );
        persistWatchlist(updated);
        return updated;
      });

      setCartItems((prev) => {
        const updated = prev.map((item) =>
          item.listingId === listingId ? { ...item, sold: true } : item,
        );
        persistCart(updated);
        return updated;
      });
    }

    window.addEventListener('mme:listing-sold', handleListingSold);
    return () => window.removeEventListener('mme:listing-sold', handleListingSold);
  }, []);

  // ── Cart actions ──────────────────────────────────────────────────────────────

  function updateCartQty(listingId: number, delta: number) {
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.listingId === listingId
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item,
      );
      persistCart(updated);
      window.dispatchEvent(new Event('mme:storage-sync'));
      return updated;
    });
  }

  function removeFromCart(listingId: number) {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.listingId !== listingId);
      persistCart(updated);
      window.dispatchEvent(new Event('mme:storage-sync'));
      return updated;
    });
    setCheckedCart((prev) => {
      const next = new Set(prev);
      next.delete(listingId);
      return next;
    });
  }

  function toggleCartCheck(listingId: number) {
    setCheckedCart((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });
  }

  // ── Watchlist actions ─────────────────────────────────────────────────────────

  function updateWatchlistQty(listingId: number, delta: number) {
    setWatchlistItems((prev) => {
      const updated = prev.map((item) =>
        item.listingId === listingId
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item,
      );
      persistWatchlist(updated);
      return updated;
    });
  }

  function removeFromWatchlist(listingId: number) {
    setWatchlistItems((prev) => {
      const updated = prev.filter((item) => item.listingId !== listingId);
      persistWatchlist(updated);
      window.dispatchEvent(new Event('mme:storage-sync'));
      return updated;
    });
    setCheckedWatchlist((prev) => {
      const next = new Set(prev);
      next.delete(listingId);
      return next;
    });
  }

  function toggleWatchlistCheck(listingId: number) {
    setCheckedWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });
  }

  /** Move a single watchlist item to cart */
  function moveOneToCart(listingId: number, qty: number) {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.listingId === listingId);
      let updated: CartEntry[];
      if (existing) {
        updated = prev.map((c) =>
          c.listingId === listingId ? { ...c, qty: c.qty + qty } : c,
        );
      } else {
        updated = [...prev, { listingId, qty }];
      }
      persistCart(updated);
      window.dispatchEvent(new Event('mme:storage-sync'));
      return updated;
    });
    removeFromWatchlist(listingId);
  }

  /**
   * Move all checked watchlist items to cart (or all non-sold items if none
   * are explicitly checked).
   */
  function moveCheckedToCart() {
    const toMove = watchlistItems.filter((item) => {
      if (item.sold) return false;
      if (checkedWatchlist.size === 0) return true;
      return checkedWatchlist.has(item.listingId);
    });

    if (toMove.length === 0) return;

    setCartItems((prev) => {
      let updated = [...prev];
      for (const wItem of toMove) {
        const existing = updated.find((c) => c.listingId === wItem.listingId);
        if (existing) {
          updated = updated.map((c) =>
            c.listingId === wItem.listingId ? { ...c, qty: c.qty + wItem.qty } : c,
          );
        } else {
          updated = [...updated, { listingId: wItem.listingId, qty: wItem.qty }];
        }
      }
      persistCart(updated);
      window.dispatchEvent(new Event('mme:storage-sync'));
      return updated;
    });

    const movedIds = new Set(toMove.map((item) => item.listingId));
    setWatchlistItems((prev) => {
      const updated = prev.filter((item) => !movedIds.has(item.listingId));
      persistWatchlist(updated);
      window.dispatchEvent(new Event('mme:storage-sync'));
      return updated;
    });
    setCheckedWatchlist(new Set());
  }

  // ── Totals & Checkout selection ───────────────────────────────────────────────

  const availableCartItems = cartItems.filter(
    (item) => !item.sold && Boolean(getListing(item.listingId)),
  );
  const checkedAvailableCart = availableCartItems.filter((item) =>
    checkedCart.has(item.listingId),
  );
  const itemsToCheckout =
    checkedCart.size > 0 ? checkedAvailableCart : availableCartItems;

  const cartTotal = cartItems
    .filter((item) => !item.sold)
    .reduce((sum, item) => {
      const listing = getListing(item.listingId);
      return sum + (listing ? listing.price * item.qty : 0);
    }, 0);

  const checkoutTotal = itemsToCheckout.reduce((sum, item) => {
    const listing = getListing(item.listingId);
    return sum + (listing ? listing.price * item.qty : 0);
  }, 0);

  const watchlistTotal = watchlistItems
    .filter((item) => !item.sold)
    .reduce((sum, item) => {
      const listing = getListing(item.listingId);
      return sum + (listing ? listing.price * item.qty : 0);
    }, 0);

  const allWatchlistSold = watchlistItems.length > 0 && watchlistItems.every((i) => i.sold);

  function openCheckoutModal() {
    if (itemsToCheckout.length === 0) return;
    setCheckoutError(null);
    setConfirmedOrder(null);
    setCheckoutOpen(true);
  }

  function closeCheckoutModal() {
    setCheckoutOpen(false);
    setConfirmedOrder(null);
    setCheckoutError(null);
  }

  function handleCheckoutSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    const trimmedAddress = deliveryAddress.trim();

    if (!trimmedName) {
      setCheckoutError('Please enter the primary buyer contact name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setCheckoutError('Please enter a valid business email address.');
      return;
    }
    if (fulfillment === 'freight' && !trimmedAddress) {
      setCheckoutError('Please enter the licensed receiving facility address for freight delivery.');
      return;
    }

    const existingOrders = safeParseJSON<StoredOrder[]>(
      localStorage.getItem('mme_orders'),
      [],
    );
    const nextNum = 4102 + existingOrders.length;
    const orderItems: StoredOrderItem[] = itemsToCheckout.flatMap((entry) => {
      const listing = getListing(entry.listingId);
      if (!listing) return [];
      return [
        {
          listingId: listing.id,
          name: listing.name,
          seller: listing.seller,
          qty: entry.qty,
          unitPrice: listing.price,
          priceUnit: listing.priceUnit,
          lotVolume: listing.qty,
        },
      ];
    });

    const newOrder: StoredOrder = {
      orderId: `MME-ORD-2026-${nextNum}`,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Pending Seller Confirmation',
      fulfillment,
      contactName: trimmedName,
      contactEmail: trimmedEmail,
      deliveryAddress:
        fulfillment === 'freight' ? trimmedAddress : 'Buyer-arranged facility pickup',
      poNumber: poNumber.trim() || undefined,
      total: checkoutTotal,
      items: orderItems,
    };

    localStorage.setItem('mme_orders', JSON.stringify([newOrder, ...existingOrders]));

    const purchasedIds = new Set(itemsToCheckout.map((i) => i.listingId));
    setCartItems((prev) => {
      const remaining = prev.filter((item) => !purchasedIds.has(item.listingId));
      persistCart(remaining);
      return remaining;
    });
    setCheckedCart(new Set());
    window.dispatchEvent(new Event('mme:storage-sync'));

    setCheckoutError(null);
    setConfirmedOrder(newOrder);
    setRecentOrderBanner(newOrder);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  // Before hydration the page renders matching shell elements to match SSR HTML cleanly.
  if (!mounted) {
    return (
      <>
        <Header />
        <CartHero />
        <main className="page-body cart-page" style={{ minHeight: '60vh' }} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <CartHero />

      <main className="page-body cart-page">

        {/* ══ YOUR CART ══════════════════════════════════════════════════════════ */}
        <section id="cart" className="w-bubble-container cart-section">
          <div className="cart-bubble-inner">
            <div className="cart-header-row">
              <div>
                <h3>Your Cart</h3>
                <p className="subp1">
                  Select available lots to submit a verified B2B order request.
                </p>
              </div>
              <a href="/marketplace" className="cart-continue-link">Continue shopping</a>
            </div>

            <hr className="cart-header-divider" />

            {recentOrderBanner && (
              <div className="cart-order-banner" role="status">
                <div className="cart-order-banner-text">
                  <strong>Order request {recentOrderBanner.orderId} submitted.</strong>{' '}
                  Confirmation sent to {recentOrderBanner.contactEmail} (${recentOrderBanner.total.toFixed(2)} USD).{' '}
                  <a href="/account#orders">View in My Orders →</a>
                </div>
                <button
                  type="button"
                  className="cart-order-banner-dismiss"
                  onClick={() => setRecentOrderBanner(null)}
                  aria-label="Dismiss order confirmation"
                >
                  ✕
                </button>
              </div>
            )}

            {cartItems.length > 0 && <ColumnHeaders />}

            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <p>
                  Your cart is empty.{' '}
                  <a href="/marketplace">Browse listings →</a>
                </p>
              </div>
            ) : (
              cartItems.map((item) => {
                const listing = getListing(item.listingId);
                if (!listing) return null;
                return (
                  <ProductRow
                    key={item.listingId}
                    entry={item}
                    listing={listing}
                    checked={checkedCart.has(item.listingId)}
                    onCheckChange={() => toggleCartCheck(item.listingId)}
                    onIncrement={() => updateCartQty(item.listingId, 1)}
                    onDecrement={() => updateCartQty(item.listingId, -1)}
                    onRemove={() => removeFromCart(item.listingId)}
                  />
                );
              })
            )}

            <div className="cart-section-footer">
              <div className="cart-section-footer-rule" />
              <div className="cart-section-totals">
                <div className="cart-estimated-total">
                  <span className="cart-estimated-label">
                    {checkedCart.size > 0
                      ? `Selected total (${itemsToCheckout.length})`
                      : 'Estimated total'}
                  </span>
                  <span className="cart-estimated-value">
                    ${(checkedCart.size > 0 ? checkoutTotal : cartTotal).toFixed(2)} USD
                  </span>
                </div>
                <p className="cart-taxes-note">
                  Taxes, discounts and shipping calculated at checkout.
                </p>
                <button
                  type="button"
                  className="cart-action-btn"
                  onClick={openCheckoutModal}
                  disabled={itemsToCheckout.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ WATCHLIST ══════════════════════════════════════════════════════════ */}
        <section id="watchlist" className="w-bubble-container cart-section">
          <div className="cart-bubble-inner">
            <div className="cart-header-row">
              <div>
                <h3>Watchlist</h3>
                <p className="subp1">
                  Track saved ingredient lots and move available items to your cart when ready.
                </p>
              </div>
              <a href="/marketplace" className="cart-continue-link">Continue shopping</a>
            </div>

            <hr className="cart-header-divider" />

            {watchlistItems.length > 0 && <ColumnHeaders hasMoveAction />}

            {watchlistItems.length === 0 ? (
              <div className="cart-empty">
                <p>
                  Your watchlist is empty.{' '}
                  <a href="/marketplace">Browse listings →</a>
                </p>
              </div>
            ) : (
              watchlistItems.map((item) => {
                const listing = getListing(item.listingId);
                if (!listing) return null;
                return (
                  <ProductRow
                    key={item.listingId}
                    entry={item}
                    listing={listing}
                    checked={checkedWatchlist.has(item.listingId)}
                    onCheckChange={() => toggleWatchlistCheck(item.listingId)}
                    onIncrement={() => updateWatchlistQty(item.listingId, 1)}
                    onDecrement={() => updateWatchlistQty(item.listingId, -1)}
                    onRemove={() => removeFromWatchlist(item.listingId)}
                    onMoveToCart={() => moveOneToCart(item.listingId, item.qty)}
                  />
                );
              })
            )}

            <div className="cart-section-footer">
              <div className="cart-section-footer-rule" />
              <div className="cart-section-totals">
                <div className="cart-estimated-total">
                  <span className="cart-estimated-label">Estimated total</span>
                  <span className="cart-estimated-value">${watchlistTotal.toFixed(2)} USD</span>
                </div>
                <p className="cart-taxes-note">
                  Taxes, discounts and shipping calculated at checkout.
                </p>
                <button
                  type="button"
                  className="cart-action-btn"
                  onClick={moveCheckedToCart}
                  disabled={watchlistItems.length === 0 || allWatchlistSold}
                  title={
                    checkedWatchlist.size > 0
                      ? `Move ${checkedWatchlist.size} selected item(s) to cart`
                      : 'Move all watchlist items to cart'
                  }
                >
                  Move to Cart
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="cart-return-top-section">
          <button
            type="button"
            className="cart-return-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Return to Top ↑
          </button>
        </div>

      </main>

      {/* ══ CHECKOUT / ORDER REQUEST MODAL ═════════════════════════════════════ */}
      {checkoutOpen && (
        <div
          className="cart-checkout-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCheckoutModal();
          }}
        >
          <div
            className="cart-checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-modal-title"
          >
            {confirmedOrder ? (
              <div className="cart-checkout-confirmed">
                <div className="cart-checkout-header">
                  <div>
                    <p className="cart-checkout-eyebrow">Order request submitted</p>
                    <h2 id="checkout-modal-title" className="cart-checkout-title">
                      Thank you — your order is in review
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="cart-checkout-close"
                    onClick={closeCheckoutModal}
                    aria-label="Close checkout dialog"
                  >
                    ✕
                  </button>
                </div>

                <div className="cart-checkout-notice">
                  <p>
                    <strong>Reference ID:</strong> {confirmedOrder.orderId}
                  </p>
                  <p>
                    Each verified seller has been notified to confirm lot availability,
                    applicable tax, and{' '}
                    {confirmedOrder.fulfillment === 'freight'
                      ? 'freight quote details'
                      : 'dock pickup scheduling'}{' '}
                    within 1 business day.
                  </p>
                </div>

                <div className="cart-checkout-summary">
                  <p className="cart-checkout-section-label">Items requested</p>
                  {confirmedOrder.items.map((item) => (
                    <div className="cart-checkout-line" key={item.listingId}>
                      <div>
                        <p className="cart-checkout-item-name">{item.name}</p>
                        <p className="cart-checkout-item-meta">
                          {item.seller} · {item.lotVolume} × {item.qty}
                        </p>
                      </div>
                      <span className="cart-checkout-item-price">
                        ${(item.unitPrice * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="cart-checkout-total-row">
                    <span>Estimated subtotal</span>
                    <strong>${confirmedOrder.total.toFixed(2)} USD</strong>
                  </div>
                </div>

                <div className="cart-checkout-actions">
                  <a href="/account#orders" className="cart-checkout-primary-link">
                    View in My Orders
                  </a>
                  <a href="/marketplace" className="cart-checkout-secondary-link">
                    Continue Shopping
                  </a>
                  <button
                    type="button"
                    className="cart-checkout-tertiary-btn"
                    onClick={closeCheckoutModal}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form className="cart-checkout-form" onSubmit={handleCheckoutSubmit} noValidate>
                <div className="cart-checkout-header">
                  <div>
                    <p className="cart-checkout-eyebrow">Verified B2B Checkout</p>
                    <h2 id="checkout-modal-title" className="cart-checkout-title">
                      Submit Order Request
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="cart-checkout-close"
                    onClick={closeCheckoutModal}
                    aria-label="Close checkout dialog"
                  >
                    ✕
                  </button>
                </div>

                <div className="cart-checkout-summary">
                  <p className="cart-checkout-section-label">Order summary</p>
                  {itemsToCheckout.map((entry) => {
                    const listing = getListing(entry.listingId);
                    if (!listing) return null;
                    return (
                      <div className="cart-checkout-line" key={listing.id}>
                        <div>
                          <p className="cart-checkout-item-name">{listing.name}</p>
                          <p className="cart-checkout-item-meta">
                            {listing.seller} ({listing.location}) · {listing.qty} · Qty {entry.qty}
                          </p>
                        </div>
                        <span className="cart-checkout-item-price">
                          ${(listing.price * entry.qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="cart-checkout-total-row">
                    <span>Estimated subtotal (excl. freight &amp; tax)</span>
                    <strong>${checkoutTotal.toFixed(2)} USD</strong>
                  </div>
                </div>

                <div className="cart-checkout-fields">
                  <div className="cart-checkout-row">
                    <label className="cart-checkout-field">
                      <span>Primary contact name *</span>
                      <input
                        type="text"
                        placeholder="e.g. Jordan Miller"
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value);
                          if (checkoutError) setCheckoutError(null);
                        }}
                      />
                    </label>
                    <label className="cart-checkout-field">
                      <span>Business email *</span>
                      <input
                        type="email"
                        placeholder="purchasing@yourmill.com"
                        value={contactEmail}
                        onChange={(e) => {
                          setContactEmail(e.target.value);
                          if (checkoutError) setCheckoutError(null);
                        }}
                      />
                    </label>
                  </div>

                  <div className="cart-checkout-field">
                    <span>Fulfillment preference *</span>
                    <div className="cart-checkout-fulfillment">
                      <button
                        type="button"
                        className={`cart-fulfillment-pill${fulfillment === 'freight' ? ' is-selected' : ''}`}
                        onClick={() => {
                          setFulfillment('freight');
                          if (checkoutError) setCheckoutError(null);
                        }}
                      >
                        Seller-Arranged Freight
                      </button>
                      <button
                        type="button"
                        className={`cart-fulfillment-pill${fulfillment === 'pickup' ? ' is-selected' : ''}`}
                        onClick={() => {
                          setFulfillment('pickup');
                          if (checkoutError) setCheckoutError(null);
                        }}
                      >
                        Buyer Facility Pickup
                      </button>
                    </div>
                  </div>

                  {fulfillment === 'freight' && (
                    <label className="cart-checkout-field">
                      <span>Licensed receiving facility address *</span>
                      <input
                        type="text"
                        placeholder="Street address, City, State, ZIP (no P.O. boxes)"
                        value={deliveryAddress}
                        onChange={(e) => {
                          setDeliveryAddress(e.target.value);
                          if (checkoutError) setCheckoutError(null);
                        }}
                      />
                    </label>
                  )}

                  <label className="cart-checkout-field">
                    <span>PO / internal reference (optional)</span>
                    <input
                      type="text"
                      placeholder="e.g. PO-2026-1184"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                    />
                  </label>
                </div>

                {checkoutError && (
                  <p className="cart-checkout-error" role="alert">
                    {checkoutError}
                  </p>
                )}

                <p className="cart-checkout-footnote">
                  Buyers pay only the listed price plus applicable sales tax and agreed freight.
                  COA, SDS, and spec sheets accompany every shipment.
                </p>

                <div className="cart-checkout-actions">
                  <button type="submit" className="cart-checkout-submit-btn">
                    Submit Order Request
                  </button>
                  <button
                    type="button"
                    className="cart-checkout-tertiary-btn"
                    onClick={closeCheckoutModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
