export const SELLER_LISTINGS_STORAGE_KEY = 'mme_seller_listings';

export type SellerListingFormat = 'auction' | 'fixed';
export type SellerUnitKey = 'lbs' | 'kg' | 'g' | 'MT';

export type SoldAuditRecord = {
  soldAt: string;
  finalUnitPrice: number;
  finalTotalPrice: number;
  buyerName: string;
  orderRef: string;
  settlementStatus: string;
};

export type SellerListing = {
  id: string;
  referenceId: string;
  title: string;
  category: string;
  lotNumber: string;
  listingType: SellerListingFormat;
  price: number;
  quantity: number;
  unit: SellerUnitKey;
  packaging: string;
  location: string;
  expires: string; // YYYY-MM-DD
  approvalStatus: 'Live on Marketplace' | 'Pending Compliance Review' | 'Completed Sale';
  notes: string;
  status: 'active' | 'sold';
  catalogProductId?: number;
  submittedAt?: string;
  updatedAt?: string;
  soldDetails?: SoldAuditRecord;
};

export const SELLER_UNIT_META: Record<
  SellerUnitKey,
  { short: string; perUnit: string; formLabel: string }
> = {
  lbs: { short: 'lbs', perUnit: 'per lb', formLabel: 'Pounds (lbs)' },
  kg: { short: 'kg', perUnit: 'per kg', formLabel: 'Kilograms (kg)' },
  g: { short: 'g', perUnit: 'per g', formLabel: 'Grams (g)' },
  MT: { short: 'MT', perUnit: 'per MT', formLabel: 'Metric Tons (MT)' },
};

export const SELLER_CATEGORY_OPTIONS = [
  'Amino Acids',
  'Protein Supplements',
  'Energy Feeds',
  'Roughage & Silage',
  'Vitamins & Premixes',
  'Minerals & Trace Elements',
  'Specialty / Other',
] as const;

export const SELLER_PACKAGING_OPTIONS = [
  'Bulk',
  '50 lb Multi-Wall Bags',
  'FIBC Super Sacks / Totes',
  'Bales',
  'Drums / Pails',
  'Pneumatic Tanker',
] as const;

export function mapFormUnitToSellerUnit(formUnit: string): SellerUnitKey {
  const normalized = formUnit.toLowerCase();
  if (normalized.includes('kg') || normalized.includes('kilo')) return 'kg';
  if (normalized.includes('mt') || normalized.includes('metric')) return 'MT';
  if (normalized.includes('(g)') || normalized === 'g' || normalized.includes('gram')) return 'g';
  return 'lbs';
}

export function formatDisplayDate(isoOrLabel: string): string {
  if (!isoOrLabel) return '—';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoOrLabel)) return isoOrLabel;
  const [y, m, d] = isoOrLabel.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return isoOrLabel;
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatCurrencyUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const SEEDED_SELLER_LISTINGS: SellerListing[] = [
  {
    id: 'lst-active-101',
    referenceId: 'MME-LST-2026-0294',
    title: 'Soybean Meal 44% — Feed Grade',
    category: 'Protein Supplements',
    lotNumber: 'LOT-2026-1104',
    listingType: 'auction',
    price: 0.22,
    quantity: 8500,
    unit: 'lbs',
    packaging: '50 lb Multi-Wall Bags',
    location: 'Wichita, KS',
    expires: '2026-12-18',
    approvalStatus: 'Live on Marketplace',
    notes:
      'Solvent-extracted 44% crude protein soybean meal on shrink-wrapped pallets. Guaranteed min 44.0% CP, max 7.0% crude fiber. COA verified through Apr. 2027; dock loading Mon–Fri 7 AM–4 PM CST.',
    status: 'active',
    catalogProductId: 3,
  },
  {
    id: 'lst-active-102',
    referenceId: 'MME-LST-2026-0301',
    title: 'L-Threonine 98.5% — Crystalline Feed Grade',
    category: 'Amino Acids',
    lotNumber: 'LOT-2026-1385',
    listingType: 'fixed',
    price: 0.64,
    quantity: 4000,
    unit: 'lbs',
    packaging: 'FIBC Super Sacks / Totes',
    location: 'Wichita, KS',
    expires: '2027-01-15',
    approvalStatus: 'Live on Marketplace',
    notes:
      'Two sealed 2,000 lb FIBC super sacks stored in climate-controlled dry warehouse (<22°C). Heavy metals <10 ppm; full amino acid COA and OSHA SDS attached.',
    status: 'active',
  },
  {
    id: 'lst-active-103',
    referenceId: 'MME-LST-2026-0304',
    title: 'Dicalcium Phosphate 18.5% P — Granular',
    category: 'Minerals & Trace Elements',
    lotNumber: 'LOT-2026-1450',
    listingType: 'auction',
    price: 0.29,
    quantity: 6000,
    unit: 'lbs',
    packaging: 'Bulk',
    location: 'Salina, KS',
    expires: '2026-12-28',
    approvalStatus: 'Pending Compliance Review',
    notes:
      'Low-fluorine feed-grade dicalcium phosphate (min 18.5% P, 21.0% Ca). Hopper-bottom or pneumatic transfer available; lab retest date Sep. 2027.',
    status: 'active',
  },
  {
    id: 'lst-sold-089',
    referenceId: 'MME-LST-2026-0218',
    title: 'Soybean Meal 44% — Solvent Extracted',
    category: 'Protein Supplements',
    lotNumber: 'LOT-2026-1019',
    listingType: 'auction',
    price: 0.22,
    quantity: 8500,
    unit: 'lbs',
    packaging: '50 lb Multi-Wall Bags',
    location: 'Wichita, KS',
    expires: '2026-11-14',
    approvalStatus: 'Completed Sale',
    notes:
      'Delivered with verified lot COA and certified scale ticket. Net seller payout settled via Verified Business ACH.',
    status: 'sold',
    soldDetails: {
      soldAt: 'Nov 14, 2026',
      finalUnitPrice: 0.22,
      finalTotalPrice: 1870.0,
      buyerName: 'Heartland Dairy Cooperative',
      orderRef: 'MME-ORD-2026-4088',
      settlementStatus: 'Settled ACH',
    },
  },
  {
    id: 'lst-sold-074',
    referenceId: 'MME-LST-2026-0192',
    title: 'DL-Methionine 99% — Feed Grade Powder',
    category: 'Amino Acids',
    lotNumber: 'LOT-2026-0883',
    listingType: 'fixed',
    price: 1.15,
    quantity: 2500,
    unit: 'lbs',
    packaging: '50 lb Multi-Wall Bags',
    location: 'Wichita, KS',
    expires: '2026-10-29',
    approvalStatus: 'Completed Sale',
    notes:
      '50 moisture-barrier multi-wall bags on heat-treated pallets. Buyer carrier pickup completed with signed BOL.',
    status: 'sold',
    soldDetails: {
      soldAt: 'Oct 29, 2026',
      finalUnitPrice: 1.15,
      finalTotalPrice: 2875.0,
      buyerName: 'High Plains Poultry Nutrition LLC',
      orderRef: 'MME-ORD-2026-3994',
      settlementStatus: 'Settled ACH',
    },
  },
  {
    id: 'lst-sold-061',
    referenceId: 'MME-LST-2026-0165',
    title: 'Corn Gluten Meal 60% Protein',
    category: 'Protein Supplements',
    lotNumber: 'LOT-2026-0710',
    listingType: 'auction',
    price: 0.31,
    quantity: 10000,
    unit: 'lbs',
    packaging: 'Bulk',
    location: 'Hutchinson, KS',
    expires: '2026-10-12',
    approvalStatus: 'Completed Sale',
    notes:
      'High-xanthophyll 60% CP corn gluten meal lot screened <10 ppb aflatoxin. Bulk hopper load completed.',
    status: 'sold',
    soldDetails: {
      soldAt: 'Oct 12, 2026',
      finalUnitPrice: 0.31,
      finalTotalPrice: 3100.0,
      buyerName: 'Midwest Swine & Feed Co.',
      orderRef: 'MME-ORD-2026-3912',
      settlementStatus: 'Settled Escrow Wire',
    },
  },
];

type StoredOrderLookup = {
  orderId: string;
  createdAt: string;
  contactName: string;
  items: Array<{ listingId: number; unitPrice: number }>;
};

type SoldFlagEntry = {
  listingId: number;
  sold?: boolean;
};

function reconcileCatalogSales(listings: SellerListing[]): SellerListing[] {
  if (typeof window === 'undefined') return listings;
  try {
    const ordersRaw = localStorage.getItem('mme_orders');
    const orders: StoredOrderLookup[] = ordersRaw ? JSON.parse(ordersRaw) : [];

    const wlRaw = localStorage.getItem('mme_watchlist');
    const wl: SoldFlagEntry[] = wlRaw ? JSON.parse(wlRaw) : [];

    const cartRaw = localStorage.getItem('mme_cart');
    const cart: SoldFlagEntry[] = cartRaw ? JSON.parse(cartRaw) : [];

    const soldCatalogIds = new Set<number>();
    for (const entry of [...wl, ...cart]) {
      if (entry && typeof entry.listingId === 'number' && entry.sold) {
        soldCatalogIds.add(entry.listingId);
      }
    }

    return listings.map((item) => {
      if (item.status === 'sold' || !item.catalogProductId) return item;

      const matchingOrder = Array.isArray(orders)
        ? orders.find(
            (o) =>
              Array.isArray(o.items) &&
              o.items.some((line) => line.listingId === item.catalogProductId),
          )
        : undefined;

      if (!matchingOrder && !soldCatalogIds.has(item.catalogProductId)) {
        return item;
      }

      const unitPrice = item.price > 0 ? item.price : 0.22;
      const totalPrice = Number((unitPrice * item.quantity).toFixed(2));

      return {
        ...item,
        status: 'sold',
        approvalStatus: 'Completed Sale',
        soldDetails: {
          soldAt: matchingOrder?.createdAt || 'Nov 22, 2026',
          finalUnitPrice: unitPrice,
          finalTotalPrice: totalPrice,
          buyerName: matchingOrder?.contactName || 'Verified Exchange Buyer',
          orderRef: matchingOrder?.orderId || 'MME-ORD-2026-4100',
          settlementStatus: 'Pending Escrow Settlement',
        },
      };
    });
  } catch {
    return listings;
  }
}

export function loadSellerListings(): SellerListing[] {
  if (typeof window === 'undefined') return SEEDED_SELLER_LISTINGS;
  try {
    const raw = localStorage.getItem(SELLER_LISTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SellerListing[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return reconcileCatalogSales(parsed);
      }
    }
  } catch {
    // Fall back to seeded seller listings
  }
  return reconcileCatalogSales(SEEDED_SELLER_LISTINGS);
}

export function saveSellerListings(listings: SellerListing[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELLER_LISTINGS_STORAGE_KEY, JSON.stringify(listings));
  window.dispatchEvent(new Event('mme:storage-sync'));
}

export function resolveDefaultSellerLocation(): string {
  if (typeof window === 'undefined') return 'Wichita, KS';
  try {
    const profileRaw = localStorage.getItem('mme_account_profile');
    if (profileRaw) {
      const prof = JSON.parse(profileRaw) as { address?: string };
      if (prof.address) {
        const parts = prof.address.split(',').map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const city = parts[parts.length - 2];
          const stateZip = parts[parts.length - 1].replace(/\s+\d{5}(-\d{4})?$/, '');
          if (city && stateZip) return `${city}, ${stateZip}`;
        }
        return prof.address;
      }
    }
  } catch {
    // Ignore malformed profile
  }
  return 'Wichita, KS';
}
