import { useEffect, useState } from 'react';
import { mockListings } from './data/mockListings';
import { Footer } from './partials/footer';
import { Header } from './partials/header';
import type { Listing } from './types';

// ── Types ─────────────────────────────────────────────────────────────────────

type CartEntry = { listingId: number; qty: number; sold?: boolean };
type WatchlistEntry = { listingId: number; qty: number; sold: boolean };

// ── localStorage helpers ───────────────────────────────────────────────────────

function safeParseJSON<T>(str: string | null, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

function loadCart(): CartEntry[] {
  return safeParseJSON(localStorage.getItem('mme_cart'), []);
}
function loadWatchlist(): WatchlistEntry[] {
  return safeParseJSON(localStorage.getItem('mme_watchlist'), []);
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

function ColumnHeaders() {
  return (
    <div className="cart-col-headers">
      <div className="cart-col-headers-spacer" />
      <div className="cart-col-headers-inner">
        <span className="cart-col-h-product">product</span>
        <div className="cart-col-h-qty-total">
          <span className="cart-col-h-qty">quantity</span>
          <span className="cart-col-h-total">total</span>
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
  /** Demo button: fire the sold event for this listing */
  onMarkSold?: () => void;
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
  onMarkSold,
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
            <img
              className="cart-row-image"
              src={listing.images[0] || '/images/IMG_9097.jpeg'}
              alt={listing.name}
            />
            <div className="cart-row-info">
              <div className="cart-row-name-row">
                <span className="cart-row-name">{listing.name}</span>
                {isSold && <span className="cart-sold-badge">Sold</span>}
              </div>
              <span className="cart-row-price">${listing.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Quantity + total + actions */}
          <div className="cart-row-qty-total">
            <div className="cart-row-qty-control">
              <button
                className="cart-row-qty-btn"
                onClick={onIncrement}
                disabled={isSold}
                aria-label="Increase quantity"
              >
                +
              </button>
              <span className="cart-row-qty-value">{entry.qty}</span>
              <button
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

            <div className="cart-row-actions">
              {onMoveToCart && (
                <button
                  className="cart-row-move-btn"
                  onClick={onMoveToCart}
                  disabled={isSold}
                  title={isSold ? 'Item is no longer available' : 'Move to cart'}
                >
                  Move to Cart
                </button>
              )}
              <button
                className="cart-row-remove-btn"
                onClick={onRemove}
                aria-label={onMoveToCart ? 'Remove from watchlist' : 'Remove from cart'}
              >
                Remove
              </button>
              {/* Demo control — fires the sold CustomEvent so both cart & watchlist respond */}
              {onMarkSold && !isSold && (
                <button
                  className="cart-demo-sold-btn"
                  onClick={onMarkSold}
                  title="Demo: dispatch mme:listing-sold event for this item"
                >
                  Mark&nbsp;Sold
                </button>
              )}
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
  const [checkedWatchlist, setCheckedWatchlist] = useState<Set<number>>(new Set());

  // ── Hydrate from localStorage (or seed) after mount ──────────────────────────
  useEffect(() => {
    const storedCart = localStorage.getItem('mme_cart');
    const storedWatchlist = localStorage.getItem('mme_watchlist');

    const cart: CartEntry[] = storedCart
      ? safeParseJSON<CartEntry[]>(storedCart, SEED_CART)
      : SEED_CART;
    const watchlist: WatchlistEntry[] = storedWatchlist
      ? safeParseJSON<WatchlistEntry[]>(storedWatchlist, SEED_WATCHLIST)
      : SEED_WATCHLIST;

    if (!storedCart) persistCart(cart);
    if (!storedWatchlist) persistWatchlist(watchlist);

    setCartItems(cart);
    setWatchlistItems(watchlist);
    setMounted(true);
  }, []);

  // ── Sold-item event listener ──────────────────────────────────────────────────
  // The app (or any external system) can fire:
  //   window.dispatchEvent(new CustomEvent('mme:listing-sold', { detail: { listingId: N } }))
  // The cart page listens and immediately marks the matching item in both
  // cart and watchlist as sold, disabling the move-to-cart button and showing
  // a "Sold" badge.
  useEffect(() => {
    function handleListingSold(e: Event) {
      const { listingId } = (e as CustomEvent<{ listingId: number }>).detail;

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
      return updated;
    });
  }

  function removeFromCart(listingId: number) {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.listingId !== listingId);
      persistCart(updated);
      return updated;
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
      if (checkedWatchlist.size === 0) return true; // move all when nothing checked
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
      return updated;
    });

    const movedIds = new Set(toMove.map((item) => item.listingId));
    setWatchlistItems((prev) => {
      const updated = prev.filter((item) => !movedIds.has(item.listingId));
      persistWatchlist(updated);
      return updated;
    });
    setCheckedWatchlist(new Set());
  }

  /** Fire the sold CustomEvent so the event listener above picks it up */
  function fireSoldEvent(listingId: number) {
    window.dispatchEvent(
      new CustomEvent('mme:listing-sold', { detail: { listingId } }),
    );
  }

  // ── Totals ────────────────────────────────────────────────────────────────────

  const cartTotal = cartItems.reduce((sum, item) => {
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

  // ── Render ────────────────────────────────────────────────────────────────────

  // Before hydration the page renders empty to match the server HTML exactly.
  if (!mounted) {
    return (
      <>
        <Header />
        <div className="cart-page" style={{ minHeight: '60vh' }} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cart-page">

        {/* ══ YOUR CART ══════════════════════════════════════════════════════════ */}
        <div className="cart-section">
          <div className="cart-section-header">
            <div className="cart-section-rule" />
            <div className="cart-section-header-content">
              <div className="cart-section-title-row">
                <p className="cart-section-title">Your Cart</p>
                <a href="/marketplace" className="cart-continue-link">Continue shopping</a>
              </div>
              <ColumnHeaders />
            </div>
          </div>

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
                  onIncrement={() => updateCartQty(item.listingId, 1)}
                  onDecrement={() => updateCartQty(item.listingId, -1)}
                  onRemove={() => removeFromCart(item.listingId)}
                  onMarkSold={() => fireSoldEvent(item.listingId)}
                />
              );
            })
          )}

          <div className="cart-section-footer">
            <div className="cart-section-footer-rule" />
            <div className="cart-section-totals">
              <div className="cart-estimated-total">
                <span className="cart-estimated-label">Estimated total</span>
                <span className="cart-estimated-value">${cartTotal.toFixed(2)} USD</span>
              </div>
              <p className="cart-taxes-note">
                Taxes, discounts and shipping calculated at checkout.
              </p>
              <button
                className="cart-action-btn"
                disabled={cartItems.length === 0 || cartItems.every((i) => i.sold)}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* ══ WATCHLIST ══════════════════════════════════════════════════════════ */}
        <div className="cart-section">
          <div className="cart-section-header">
            <div className="cart-section-rule" />
            <div className="cart-section-header-content">
              <div className="cart-section-title-row">
                <p className="cart-section-title">Watchlist</p>
                <a href="/marketplace" className="cart-continue-link">Continue shopping</a>
              </div>
              <ColumnHeaders />
            </div>
          </div>

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
                  onMarkSold={() => fireSoldEvent(item.listingId)}
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

          <div className="cart-return-top-section">
            <div className="cart-section-footer-rule" />
            <button
              className="cart-return-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Return to Top ↑
            </button>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
