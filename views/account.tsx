import { type FormEvent, useEffect, useRef, useState } from 'react';
import type { StoredOrder } from './cart';
import { Footer } from './partials/footer';
import { Header } from './partials/header';

type AccountPanelKey =
  | 'messages'
  | 'orders'
  | 'transactions'
  | 'details'
  | 'subscription';

type AccountCardDef =
  | {
      title: string;
      description: string;
      kind: 'link';
      href: string;
    }
  | {
      title: string;
      description: string;
      kind: 'panel';
      panel: AccountPanelKey;
    };

const accountCards: readonly AccountCardDef[] = [
  {
    title: 'My Cart',
    description: 'Manage bids and view auction status. View items in cart.',
    kind: 'link',
    href: '/cart#cart',
  },
  {
    title: 'Watchlist',
    description: 'View items added to watchlist, see current auction status.',
    kind: 'link',
    href: '/cart#watchlist',
  },
  {
    title: 'Messages',
    description: 'View, respond to messages from sellers, buyers & MicroMarket.',
    kind: 'panel',
    panel: 'messages',
  },
  {
    title: 'My Orders',
    description: 'Track, return, or cancel orders. Invoices, documents & receipts.',
    kind: 'panel',
    panel: 'orders',
  },
  {
    title: 'Manage Transactions',
    description: 'View transactions, manage payment methods & settings.',
    kind: 'panel',
    panel: 'transactions',
  },
  {
    title: 'Account Details',
    description: 'Edit name, business information, address, email & phone number.',
    kind: 'panel',
    panel: 'details',
  },
  {
    title: 'My Listings',
    description: 'View approval status, re-list and manage your listed products.',
    kind: 'link',
    href: '/list-product',
  },
  {
    title: 'Manage Subscription',
    description: 'Current plan information. Change or cancel your current plan.',
    kind: 'panel',
    panel: 'subscription',
  },
  {
    title: 'Account Support',
    description: 'Get help with verification, listings, orders, or platform questions.',
    kind: 'link',
    href: '/contactpage',
  },
] as const;

type MessageEntry = {
  sender: string;
  timestamp: string;
  body: string;
};

type MessageThread = {
  id: string;
  counterparty: string;
  topic: string;
  unread?: boolean;
  messages: MessageEntry[];
};

const INITIAL_THREADS: MessageThread[] = [
  {
    id: 'msg-1',
    counterparty: 'Lone Star Grain Co.',
    topic: 'Lysine-L 98.5% — Freight loading & COA lot match',
    unread: true,
    messages: [
      {
        sender: 'Lone Star Grain Co.',
        timestamp: 'Nov 21, 2026 · 2:15 PM',
        body: 'Confirming LOT-2026-0441 is staged at our Amarillo dock. Pneumatic or palletized tote transfer is available Monday–Friday 7 AM–4 PM CST.',
      },
    ],
  },
  {
    id: 'msg-2',
    counterparty: 'MicroMarket Compliance Team',
    topic: 'Trading Account Verification Approved',
    messages: [
      {
        sender: 'MicroMarket Compliance',
        timestamp: 'Nov 18, 2026 · 10:05 AM',
        body: 'Your FDA Food Facility Registration and State Feed License have been verified. Full bidding and listing privileges are active on your account.',
      },
    ],
  },
  {
    id: 'msg-3',
    counterparty: 'North Star Feed Mills',
    topic: 'DDG 20,000 lb Lot — Mycotoxin Screen & Pickup',
    messages: [
      {
        sender: 'North Star Feed Mills',
        timestamp: 'Nov 16, 2026 · 4:40 PM',
        body: 'Attached lab report confirms DON < 2 ppm and aflatoxin < 10 ppb on LOT-2026-1290. Let us know your preferred carrier window.',
      },
    ],
  },
];

const SEEDED_ORDERS: StoredOrder[] = [
  {
    orderId: 'MME-ORD-2026-4095',
    createdAt: 'Nov 19, 2026',
    status: 'Freight Scheduled',
    fulfillment: 'freight',
    contactName: 'Jordan Miller',
    contactEmail: 'purchasing@prairiefeedmill.com',
    deliveryAddress: '1420 Industrial Mill Rd, Wichita, KS 67214',
    poNumber: 'PO-2026-884',
    total: 2800.0,
    items: [
      {
        listingId: 5,
        name: 'Distillers Dried Grains (DDG)',
        seller: 'North Star Feed Mills',
        qty: 1,
        unitPrice: 2800.0,
        priceUnit: 'full lot (20,000 lbs)',
        lotVolume: '20,000 lbs',
      },
    ],
  },
  {
    orderId: 'MME-ORD-2026-4081',
    createdAt: 'Nov 10, 2026',
    status: 'Delivered · COA Verified',
    fulfillment: 'pickup',
    contactName: 'Jordan Miller',
    contactEmail: 'purchasing@prairiefeedmill.com',
    deliveryAddress: 'Buyer-arranged facility pickup',
    poNumber: 'PO-2026-851',
    total: 1395.0,
    items: [
      {
        listingId: 7,
        name: 'Canola Meal 36%',
        seller: 'Pacific Coast Ag',
        qty: 1,
        unitPrice: 1395.0,
        priceUnit: 'full lot (4,500 kg)',
        lotVolume: '4,500 kg',
      },
    ],
  },
];

type StoredBidSummary = {
  listingId: number;
  listingName: string;
  seller: string;
  bidPerUnit: number;
  priceUnit: string;
  lotVolume: string;
  lotTotal: number;
  placedAt: string;
};

const VALID_PANELS: AccountPanelKey[] = [
  'messages',
  'orders',
  'transactions',
  'details',
  'subscription',
];

function parsePanelFromLocation(): AccountPanelKey | null {
  const hash = window.location.hash.replace(/^#/, '').toLowerCase();
  if (VALID_PANELS.includes(hash as AccountPanelKey)) {
    return hash as AccountPanelKey;
  }
  const param = new URLSearchParams(window.location.search).get('panel')?.toLowerCase();
  if (param && VALID_PANELS.includes(param as AccountPanelKey)) {
    return param as AccountPanelKey;
  }
  return null;
}

export function Account() {
  const [activePanel, setActivePanel] = useState<AccountPanelKey | null>(null);
  const [signedInUser, setSignedInUser] = useState<{ name?: string; email?: string } | null>(null);

  // Messages state
  const [threads, setThreads] = useState<MessageThread[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string>(INITIAL_THREADS[0].id);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<string | null>(null);

  // Orders & bids state
  const [orders, setOrders] = useState<StoredOrder[]>(SEEDED_ORDERS);
  const [activeBids, setActiveBids] = useState<StoredBidSummary[]>([]);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  // Transactions state
  const [settlementMethod, setSettlementMethod] = useState<'ach' | 'escrow'>('ach');
  const [billingEmail, setBillingEmail] = useState('ap@prairiefeedmill.com');
  const [txSavedStatus, setTxSavedStatus] = useState<string | null>(null);

  // Account Details state
  const [contactName, setContactName] = useState('Jordan Miller');
  const [businessName, setBusinessName] = useState('Prairie Valley Feed & Milling LLC');
  const [email, setEmail] = useState('purchasing@prairiefeedmill.com');
  const [phone, setPhone] = useState('(316) 555-0194');
  const [address, setAddress] = useState('1420 Industrial Mill Rd, Wichita, KS 67214');
  const [fdaRegistration, setFdaRegistration] = useState('18492014099');
  const [stateLicense, setStateLicense] = useState('KS-FL-10488');
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSaved, setDetailsSaved] = useState<string | null>(null);

  // Subscription state
  const [planTier, setPlanTier] = useState<'trade' | 'viewonly'>('trade');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [subscriptionSaved, setSubscriptionSaved] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const sessionRaw = localStorage.getItem('mme_session');
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw) as {
          name?: string;
          email?: string;
          username?: string;
          membership?: 'trade' | 'viewonly';
        };
        setSignedInUser({
          name: parsed.name || parsed.username,
          email: parsed.email,
        });
        if (parsed.membership === 'viewonly' || parsed.membership === 'trade') {
          setPlanTier(parsed.membership);
        }
      }

      const profileRaw = localStorage.getItem('mme_account_profile');
      if (profileRaw) {
        const prof = JSON.parse(profileRaw) as Partial<{
          contactName: string;
          businessName: string;
          email: string;
          phone: string;
          address: string;
          fdaRegistration: string;
          stateLicense: string;
        }>;
        if (prof.contactName) setContactName(prof.contactName);
        if (prof.businessName) setBusinessName(prof.businessName);
        if (prof.email) {
          setEmail(prof.email);
          setBillingEmail(prof.email);
        }
        if (prof.phone) setPhone(prof.phone);
        if (prof.address) setAddress(prof.address);
        if (prof.fdaRegistration) setFdaRegistration(prof.fdaRegistration);
        if (prof.stateLicense) setStateLicense(prof.stateLicense);
      }

      const storedOrdersRaw = localStorage.getItem('mme_orders');
      if (storedOrdersRaw) {
        const storedOrders = JSON.parse(storedOrdersRaw) as StoredOrder[];
        if (Array.isArray(storedOrders) && storedOrders.length > 0) {
          setOrders([...storedOrders, ...SEEDED_ORDERS]);
        }
      }

      const bidsRaw = localStorage.getItem('mme_bids');
      if (bidsRaw) {
        const bidsMap = JSON.parse(bidsRaw) as Record<string, StoredBidSummary>;
        setActiveBids(Object.values(bidsMap));
      }
    } catch {
      // Ignore malformed storage
    }

    const initial = parsePanelFromLocation();
    if (initial) {
      setActivePanel(initial);
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const onHashChange = () => {
      const next = parsePanelFromLocation();
      setActivePanel(next);
      if (next) {
        requestAnimationFrame(() => {
          panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function openPanel(panel: AccountPanelKey) {
    setActivePanel(panel);
    window.history.replaceState(null, '', `/account#${panel}`);
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function closePanel() {
    setActivePanel(null);
    window.history.replaceState(null, '', '/account');
  }

  function handleSendReply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThreadId
          ? {
              ...t,
              unread: false,
              messages: [
                ...t.messages,
                {
                  sender: 'You',
                  timestamp: 'Just now',
                  body: trimmed,
                },
              ],
            }
          : t,
      ),
    );
    setReplyText('');
    setReplyStatus('Reply sent to verified counterparty.');
  }

  function handleCancelOrder(orderId: string) {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.orderId === orderId ? { ...o, status: 'Cancelled by Buyer' } : o,
      );
      const customOnly = next.filter(
        (o) => !SEEDED_ORDERS.some((seed) => seed.orderId === o.orderId),
      );
      localStorage.setItem('mme_orders', JSON.stringify(customOnly));
      return next;
    });
    setOrderNotice(`Order ${orderId} has been marked as cancelled.`);
  }

  function handleDownloadInvoice(order: StoredOrder) {
    const lines = [
      'MICROMARKET EXCHANGE — ORDER & INVOICE SUMMARY',
      '==============================================',
      `Order ID: ${order.orderId}`,
      `Date: ${order.createdAt}`,
      `Status: ${order.status}`,
      `Buyer Contact: ${order.contactName} (${order.contactEmail})`,
      `Fulfillment: ${order.deliveryAddress}`,
      order.poNumber ? `PO Number: ${order.poNumber}` : '',
      '',
      'Line Items:',
      ...order.items.map(
        (item) =>
          `- ${item.name} (${item.seller}) · ${item.lotVolume} × ${item.qty}: $${(item.unitPrice * item.qty).toFixed(2)}`,
      ),
      '',
      `Total: $${order.total.toFixed(2)} USD`,
    ].filter(Boolean);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.orderId}-Invoice.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setOrderNotice(`Downloaded invoice summary for ${order.orderId}.`);
  }

  function handleSaveTransactions(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!billingEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail.trim())) {
      setTxSavedStatus('Please enter a valid accounts-payable email address.');
      return;
    }
    setTxSavedStatus(
      `Settlement preferences updated (${settlementMethod === 'ach' ? 'Verified Business ACH •••• 4821' : 'Escrow Wire Transfer'} · ${billingEmail.trim()}).`,
    );
  }

  function handleSaveDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!contactName.trim() || !businessName.trim() || !address.trim() || !phone.trim()) {
      setDetailsError('Contact name, business name, physical address, and phone are required.');
      setDetailsSaved(null);
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setDetailsError('Please enter a valid business email address.');
      setDetailsSaved(null);
      return;
    }
    localStorage.setItem(
      'mme_account_profile',
      JSON.stringify({
        contactName: contactName.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        fdaRegistration: fdaRegistration.trim(),
        stateLicense: stateLicense.trim(),
      }),
    );
    setDetailsError(null);
    setDetailsSaved('Account & facility details saved ✓');
  }

  function handleSaveSubscription(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubscriptionSaved(
      `Membership settings saved (${planTier === 'trade' ? 'Licensed Trading Operation' : 'Industry Observer — View Only'}).`,
    );
  }

  const activeThread = threads.find((t) => t.id === selectedThreadId) ?? threads[0];

  return (
    <>
      <Header />

      <div className="account-page">

        {/* ── Hero header ──────────────────────────── */}
        <section className="hero-page-body">
          <div className="store-hero-bg account-hero">
            <div className="store-hero-text account-hero-text">
              <p className="account-eyebrow">my account</p>
              <h2 className="account-hero-heading">
                {signedInUser?.name
                  ? `Welcome back, ${signedInUser.name}`
                  : 'Welcome to MicroMarket Exchange'}
              </h2>
              <p className="account-hero-subtitle">
                List your overstock and bid on auctions with verified sellers. Select an option below to continue.
              </p>
              <div className="account-hero-meta">
                {signedInUser ? (
                  <>
                    <span className="account-session-badge">
                      Signed in{signedInUser.email ? ` · ${signedInUser.email}` : ''}
                    </span>
                    <button
                      type="button"
                      className="account-signout-btn"
                      onClick={() => {
                        localStorage.removeItem('mme_session');
                        setSignedInUser(null);
                        window.location.href = '/login';
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <a href="/login" className="account-signin-pill">
                    Sign in with another account →
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Main content ─────────────────────────── */}
        <div className="account-outer">
          <div className="account-inner">

            {/* Description */}
            <p className="account-subtitle">
              Access your account details, track your sales and orders, communicate with sellers
              and reach out to us with any issue. MicroMarket Exchange is committed to making
              this platform a useful tool for business owners.
            </p>

            {/* Navigation card grid */}
            <div className="account-grid">
              {accountCards.map((card) => {
                if (card.kind === 'link') {
                  return (
                    <a
                      href={card.href}
                      className="account-card account-card-link"
                      key={card.title}
                    >
                      <p className="account-card-title">{card.title}</p>
                      <p className="account-card-desc">{card.description}</p>
                    </a>
                  );
                }

                const isSelected = activePanel === card.panel;
                return (
                  <button
                    type="button"
                    className={`account-card account-card-button${isSelected ? ' account-card--active' : ''}`}
                    key={card.title}
                    aria-expanded={isSelected}
                    onClick={() => openPanel(card.panel)}
                  >
                    <p className="account-card-title">{card.title}</p>
                    <p className="account-card-desc">{card.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Interactive Workspace Panel for in-page Account Tools */}
            {activePanel && (
              <section
                id="account-tool-panel"
                ref={panelRef}
                className="account-panel-card"
                aria-live="polite"
              >
                <div className="account-panel-header">
                  <div>
                    <p className="account-panel-eyebrow">Account Workspace</p>
                    <h3 className="account-panel-title">
                      {accountCards.find((c) => c.kind === 'panel' && c.panel === activePanel)?.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="account-panel-close"
                    onClick={closePanel}
                  >
                    Close Panel ✕
                  </button>
                </div>

                {activePanel === 'messages' && (
                  <div className="account-messages-layout">
                    <div className="account-thread-list">
                      {threads.map((thread) => (
                        <button
                          type="button"
                          key={thread.id}
                          className={`account-thread-item${thread.id === activeThread.id ? ' is-active' : ''}`}
                          onClick={() => {
                            setSelectedThreadId(thread.id);
                            setReplyStatus(null);
                            setThreads((prev) =>
                              prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t)),
                            );
                          }}
                        >
                          <div className="account-thread-top">
                            <strong>{thread.counterparty}</strong>
                            {thread.unread && <span className="account-unread-dot">New</span>}
                          </div>
                          <span className="account-thread-topic">{thread.topic}</span>
                        </button>
                      ))}
                    </div>

                    <div className="account-thread-detail">
                      <p className="account-thread-subject">{activeThread.topic}</p>
                      <div className="account-message-stream">
                        {activeThread.messages.map((msg, idx) => (
                          <div
                            key={`${msg.timestamp}-${idx}`}
                            className={`account-message-bubble${msg.sender === 'You' ? ' is-self' : ''}`}
                          >
                            <div className="account-message-meta">
                              <strong>{msg.sender}</strong>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p>{msg.body}</p>
                          </div>
                        ))}
                      </div>

                      <form className="account-reply-form" onSubmit={handleSendReply}>
                        <textarea
                          placeholder={`Reply to ${activeThread.counterparty}…`}
                          value={replyText}
                          onChange={(e) => {
                            setReplyText(e.target.value);
                            if (replyStatus) setReplyStatus(null);
                          }}
                        />
                        {replyStatus && (
                          <p className="account-inline-status" role="status">
                            {replyStatus}
                          </p>
                        )}
                        <div className="account-panel-actions">
                          <button type="submit" className="account-primary-btn">
                            Send Reply
                          </button>
                          <a href="/contactpage" className="account-secondary-link">
                            Contact Compliance Support
                          </a>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {activePanel === 'orders' && (
                  <div className="account-panel-stack">
                    {orderNotice && (
                      <p className="account-inline-status" role="status">
                        {orderNotice}
                      </p>
                    )}

                    <div className="account-subblock">
                      <div className="account-subblock-header">
                        <h4>Active Auction Bids</h4>
                        <a href="/marketplace" className="account-text-link">
                          Browse Live Auctions →
                        </a>
                      </div>
                      {activeBids.length === 0 ? (
                        <p className="account-muted-note">
                          No new bids placed in this session yet. Visit any auction listing in the{' '}
                          <a href="/marketplace">Marketplace</a> to place a verified bid.
                        </p>
                      ) : (
                        <div className="account-list-rows">
                          {activeBids.map((bid) => (
                            <div className="account-list-row" key={bid.listingId}>
                              <div>
                                <a href={`/product/${bid.listingId}`} className="account-row-title">
                                  {bid.listingName}
                                </a>
                                <p className="account-row-meta">
                                  {bid.seller} · {bid.lotVolume} · Placed {bid.placedAt}
                                </p>
                              </div>
                              <div className="account-row-right">
                                <span className="account-status-pill">Highest Bidder ✓</span>
                                <strong>
                                  ${bid.bidPerUnit.toFixed(2)} ({bid.priceUnit}) · $
                                  {bid.lotTotal.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}{' '}
                                  lot
                                </strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="account-subblock">
                      <div className="account-subblock-header">
                        <h4>Orders &amp; Invoices</h4>
                        <a href="/cart#cart" className="account-text-link">
                          View Cart →
                        </a>
                      </div>
                      <div className="account-list-rows">
                        {orders.map((order) => (
                          <div className="account-list-row" key={order.orderId}>
                            <div>
                              <p className="account-row-title">
                                {order.orderId} — {order.items.map((i) => i.name).join(', ')}
                              </p>
                              <p className="account-row-meta">
                                {order.createdAt} · {order.deliveryAddress}
                                {order.poNumber ? ` · ${order.poNumber}` : ''}
                              </p>
                            </div>
                            <div className="account-row-right">
                              <span className="account-status-pill">{order.status}</span>
                              <strong>
                                $
                                {order.total.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{' '}
                                USD
                              </strong>
                              <div className="account-row-btn-group">
                                <button
                                  type="button"
                                  className="account-mini-btn"
                                  onClick={() => handleDownloadInvoice(order)}
                                >
                                  Invoice (.txt)
                                </button>
                                {order.status.startsWith('Pending') && (
                                  <button
                                    type="button"
                                    className="account-mini-btn account-mini-btn--danger"
                                    onClick={() => handleCancelOrder(order.orderId)}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activePanel === 'transactions' && (
                  <div className="account-panel-stack">
                    <div className="account-subblock">
                      <h4>Recent Ledger Activity</h4>
                      <div className="account-list-rows">
                        <div className="account-list-row">
                          <div>
                            <p className="account-row-title">
                              Seller Payout — Soybean Meal 44% (LOT-2026-1019)
                            </p>
                            <p className="account-row-meta">
                              Nov 14, 2026 · Completed sale net of platform commission
                            </p>
                          </div>
                          <div className="account-row-right">
                            <span className="account-status-pill">Settled ACH</span>
                            <strong>+$1,795.20 USD</strong>
                          </div>
                        </div>
                        <div className="account-list-row">
                          <div>
                            <p className="account-row-title">
                              Buyer Settlement — Canola Meal 36% (MME-ORD-2026-4081)
                            </p>
                            <p className="account-row-meta">
                              Nov 10, 2026 · Verified Business ACH •••• 4821
                            </p>
                          </div>
                          <div className="account-row-right">
                            <span className="account-status-pill">Paid</span>
                            <strong>-$1,395.00 USD</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form className="account-form-grid" onSubmit={handleSaveTransactions}>
                      <h4>Payment &amp; Payout Preferences</h4>
                      <div className="account-pill-choices">
                        <button
                          type="button"
                          className={`account-choice-btn${settlementMethod === 'ach' ? ' is-selected' : ''}`}
                          onClick={() => setSettlementMethod('ach')}
                        >
                          Verified Business ACH (•••• 4821)
                        </button>
                        <button
                          type="button"
                          className={`account-choice-btn${settlementMethod === 'escrow' ? ' is-selected' : ''}`}
                          onClick={() => setSettlementMethod('escrow')}
                        >
                          Escrow Wire Transfer
                        </button>
                      </div>
                      <label className="account-field">
                        <span>Accounts Payable / Remittance Email</span>
                        <input
                          type="email"
                          value={billingEmail}
                          onChange={(e) => {
                            setBillingEmail(e.target.value);
                            if (txSavedStatus) setTxSavedStatus(null);
                          }}
                        />
                      </label>
                      {txSavedStatus && (
                        <p className="account-inline-status" role="status">
                          {txSavedStatus}
                        </p>
                      )}
                      <div className="account-panel-actions">
                        <button type="submit" className="account-primary-btn">
                          Save Payment Settings
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activePanel === 'details' && (
                  <form className="account-form-grid" onSubmit={handleSaveDetails} noValidate>
                    <div className="account-two-col">
                      <label className="account-field">
                        <span>Primary Contact Name *</span>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => {
                            setContactName(e.target.value);
                            setDetailsSaved(null);
                          }}
                        />
                      </label>
                      <label className="account-field">
                        <span>Licensed Business Name *</span>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => {
                            setBusinessName(e.target.value);
                            setDetailsSaved(null);
                          }}
                        />
                      </label>
                    </div>

                    <div className="account-two-col">
                      <label className="account-field">
                        <span>Business Email *</span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setDetailsSaved(null);
                          }}
                        />
                      </label>
                      <label className="account-field">
                        <span>Phone Number *</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setDetailsSaved(null);
                          }}
                        />
                      </label>
                    </div>

                    <label className="account-field">
                      <span>Physical Facility Address *</span>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          setDetailsSaved(null);
                        }}
                      />
                    </label>

                    <div className="account-two-col">
                      <label className="account-field">
                        <span>FDA Registration Number</span>
                        <input
                          type="text"
                          value={fdaRegistration}
                          onChange={(e) => setFdaRegistration(e.target.value)}
                        />
                      </label>
                      <label className="account-field">
                        <span>State Feed License</span>
                        <input
                          type="text"
                          value={stateLicense}
                          onChange={(e) => setStateLicense(e.target.value)}
                        />
                      </label>
                    </div>

                    {detailsError && (
                      <p className="account-inline-error" role="alert">
                        {detailsError}
                      </p>
                    )}
                    {detailsSaved && (
                      <p className="account-inline-status" role="status">
                        {detailsSaved}
                      </p>
                    )}

                    <div className="account-panel-actions">
                      <button type="submit" className="account-primary-btn">
                        Save Account Details
                      </button>
                    </div>
                  </form>
                )}

                {activePanel === 'subscription' && (
                  <form className="account-form-grid" onSubmit={handleSaveSubscription}>
                    <div className="account-subblock">
                      <h4>Current Membership &amp; Fee Structure</h4>
                      <p className="account-muted-note">
                        Buyers pay only the listed price plus applicable sales tax. Approved seller
                        listings incur a per-listing activation fee when published and a percentage
                        commission deducted from completed-sale payouts.
                      </p>
                    </div>

                    <div className="account-pill-choices">
                      <button
                        type="button"
                        className={`account-choice-btn${planTier === 'trade' ? ' is-selected' : ''}`}
                        onClick={() => {
                          setPlanTier('trade');
                          setSubscriptionSaved(null);
                        }}
                      >
                        Licensed Operation (Full Buy &amp; Sell)
                      </button>
                      <button
                        type="button"
                        className={`account-choice-btn${planTier === 'viewonly' ? ' is-selected' : ''}`}
                        onClick={() => {
                          setPlanTier('viewonly');
                          setSubscriptionSaved(null);
                        }}
                      >
                        Industry Expert (View-Only Observer)
                      </button>
                    </div>

                    <label className="account-checkbox-row">
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={(e) => {
                          setEmailAlerts(e.target.checked);
                          setSubscriptionSaved(null);
                        }}
                      />
                      <span>
                        Send email notifications when watched auctions are within 24 hours of closing
                        or when listings are approved.
                      </span>
                    </label>

                    {subscriptionSaved && (
                      <p className="account-inline-status" role="status">
                        {subscriptionSaved}
                      </p>
                    )}

                    <div className="account-panel-actions">
                      <button type="submit" className="account-primary-btn">
                        Save Plan Preferences
                      </button>
                      <a href="/infopage" className="account-secondary-link">
                        View Full Fee Schedule →
                      </a>
                    </div>
                  </form>
                )}
              </section>
            )}
          </div>

          {/* HR separator */}
          <div className="account-rule-container">
            <hr className="account-rule" />
          </div>
        </div>

        {/* ── CTA section ──────────────────────────── */}
        <div className="account-cta-outer">
          <div className="account-cta-card">
            <div className="account-cta-text">
              <p className="account-cta-title">Ready to list an ingredient?</p>
              <p className="account-cta-body">
                Fill out the product listing form. Our team will review
                all submissions within 1–2 business days.
              </p>
            </div>
            <a href="/list-product" className="account-cta-btn">List Product</a>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}
