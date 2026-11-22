import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const AUTH_COOKIE_NAME = 'mme_auth';
export const SESSION_STORAGE_KEY = 'mme_session';
export const PENDING_REGISTRATION_KEY = 'mme_pending_registration';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export type MemberSession = {
  username: string;
  email: string;
  name: string;
  membership?: 'trade' | 'viewonly';
  rememberMe?: boolean;
  signedInAt: string;
};

export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;

  for (const part of cookieHeader.split(';')) {
    const eqIndex = part.indexOf('=');
    if (eqIndex <= 0) continue;
    const rawKey = part.slice(0, eqIndex).trim();
    const rawVal = part.slice(eqIndex + 1).trim();
    if (!rawKey) continue;
    try {
      result[rawKey] = decodeURIComponent(rawVal);
    } catch {
      result[rawKey] = rawVal;
    }
  }
  return result;
}

export function hasAuthCookie(cookieSource: string | undefined): boolean {
  const cookies = parseCookieHeader(cookieSource);
  return cookies[AUTH_COOKIE_NAME] === '1';
}

export function hasClientAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return hasAuthCookie(document.cookie);
}

export function sanitizeNextPath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, 'http://micromarket.local');
    if (parsed.origin !== 'http://micromarket.local') return null;
    if (parsed.pathname === '/login' || parsed.pathname === '/signin') return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function buildLoginUrl(nextPath: string): string {
  const safeNext = sanitizeNextPath(nextPath);
  if (!safeNext) return '/login';
  return `/login?next=${encodeURIComponent(safeNext)}`;
}

export function readStoredSession(): MemberSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MemberSession>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.username && !parsed.email) return null;
    return {
      username: parsed.username || parsed.email || 'member',
      email: parsed.email || `${parsed.username}@verifiedmill.com`,
      name: parsed.name || parsed.username || 'Verified Member',
      membership: parsed.membership,
      rememberMe: parsed.rememberMe,
      signedInAt: parsed.signedInAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function setAuthCookieClient(rememberMe = true): void {
  if (typeof document === 'undefined') return;
  const maxAgePart = rememberMe ? `; Max-Age=${THIRTY_DAYS_SECONDS}` : '';
  document.cookie = `${AUTH_COOKIE_NAME}=1; Path=/${maxAgePart}; SameSite=Lax`;
}

export function clearAuthCookieClient(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function signInMember(session: MemberSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(PENDING_REGISTRATION_KEY);
  setAuthCookieClient(session.rememberMe !== false);
  window.dispatchEvent(new Event('mme:auth-change'));
  window.dispatchEvent(new Event('mme:storage-sync'));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  clearAuthCookieClient();
  localStorage.removeItem(SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event('mme:auth-change'));
  window.dispatchEvent(new Event('mme:storage-sync'));
}

export function signOutAndRedirect(redirectTo = '/homepage'): void {
  clearAuthSession();
  if (typeof window !== 'undefined') {
    window.location.href = redirectTo;
  }
}

type AuthContextValue = {
  isAuthenticated: boolean;
  memberHref: (path: string) => string;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  memberHref: (path: string) => buildLoginUrl(path),
});

export function AuthProvider({
  initialAuthenticated,
  children,
}: {
  initialAuthenticated: boolean;
  children?: ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuthenticated);

  useEffect(() => {
    const syncAuth = () => {
      const cookieAuth = hasClientAuthCookie();
      const storedSession = readStoredSession();

      if (cookieAuth && !storedSession) {
        const fallbackSession: MemberSession = {
          username: 'purchasing@prairiefeedmill.com',
          email: 'purchasing@prairiefeedmill.com',
          name: 'Jordan Miller',
          membership: 'trade',
          rememberMe: true,
          signedInAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fallbackSession));
      } else if (!cookieAuth && storedSession) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }

      setIsAuthenticated(cookieAuth);
    };

    syncAuth();
    window.addEventListener('mme:auth-change', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('mme:auth-change', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      memberHref: (path: string) => (isAuthenticated ? path : buildLoginUrl(path)),
    }),
    [isAuthenticated],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
