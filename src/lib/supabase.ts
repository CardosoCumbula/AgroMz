import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are valid (not placeholder values)
const isValidUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');
const isValidKey = (key: string) => key.length > 20 && !key.includes('xxxxx');

const hasValidCredentials = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

let supabase: SupabaseClient;

if (hasValidCredentials) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('[Supabase] Connected with real credentials');
} else {
  // Create a mock supabase client that fails gracefully on all operations
  // This allows the app to work fully offline using local data
  const mockResponse = <T>(data: T) => ({
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  });

  const mockErrorResponse = (message: string) => ({
    data: null,
    error: { message, details: '', hint: '', code: 'OFFLINE_MODE' },
    count: null,
    status: 503,
    statusText: 'Service Unavailable',
  });

  supabase = {
    // Auth mock
    auth: {
      getSession: async () => {
        const stored = localStorage.getItem('agromoz_session');
        if (stored) {
          try {
            const sessionData = JSON.parse(stored);
            return { data: { session: sessionData }, error: null };
          } catch { /* fall through */ }
        }
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: () => {
        return {
          data: { subscription: { unsubscribe: () => {} } },
        };
      },
      signUp: async ({ email, password, options }: any) => {
        // Store user in localStorage for offline mode
        const id = 'user_' + Date.now();
        const userData = {
          id,
          email,
          user_metadata: options?.data || {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const sessionData = {
          access_token: 'mock_token_' + Date.now(),
          refresh_token: 'mock_refresh_' + Date.now(),
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: userData,
        };
        localStorage.setItem('agromoz_session', JSON.stringify(sessionData));
        localStorage.setItem('agromoz_user_' + id, JSON.stringify(userData));
        return { data: { user: userData, session: sessionData }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        // Try to find user in localStorage
        const usersKey = Object.keys(localStorage).filter(k => k.startsWith('agromoz_user_'));
        let foundUser = null;
        for (const key of usersKey) {
          const u = JSON.parse(localStorage.getItem(key) || '{}');
          if (u.email === email) {
            foundUser = u;
            break;
          }
        }
        if (!foundUser) {
          // Create mock user on first login
          const id = 'user_' + Date.now();
          foundUser = {
            id,
            email,
            user_metadata: { full_name: email.split('@')[0], role: 'buyer' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
          localStorage.setItem('agromoz_user_' + id, JSON.stringify(foundUser));
        }
        const sessionData = {
          access_token: 'mock_token_' + Date.now(),
          refresh_token: 'mock_refresh_' + Date.now(),
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: foundUser,
        };
        localStorage.setItem('agromoz_session', JSON.stringify(sessionData));
        return { data: { user: foundUser, session: sessionData }, error: null };
      },
      signOut: async () => {
        localStorage.removeItem('agromoz_session');
        return { error: null };
      },
    } as any,

    // Database mock - returns empty/null for all queries (our app handles this gracefully)
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => mockErrorResponse(`Offline: ${table} unavailable`),
          order: () => ({
            then: (resolve: any) => resolve(mockErrorResponse(`Offline: ${table} unavailable`)),
          }),
          limit: () => ({
            then: (resolve: any) => resolve(mockErrorResponse(`Offline: ${table} unavailable`)),
          }),
        }),
        order: () => ({
          then: (resolve: any) => resolve(mockErrorResponse(`Offline: ${table} unavailable`)),
          limit: () => ({
            then: (resolve: any) => resolve(mockErrorResponse(`Offline: ${table} unavailable`)),
          }),
        }),
        limit: () => ({
          then: (resolve: any) => resolve(mockErrorResponse(`Offline: ${table} unavailable`)),
        }),
      }),
      insert: () => ({
        single: async () => mockResponse({}),
        then: (resolve: any) => resolve(mockResponse({})),
      }),
      update: () => ({
        eq: () => ({
          single: async () => mockResponse({}),
          then: (resolve: any) => resolve(mockResponse({})),
        }),
      }),
      delete: () => ({
        eq: () => ({
          then: (resolve: any) => resolve(mockResponse({})),
        }),
      }),
      eq: () => ({
        single: async () => mockErrorResponse(`Offline: ${table} unavailable`),
        then: (resolve: any) => resolve(mockErrorResponse(`Offline: ${table} unavailable`)),
      }),
      then: (resolve: any) => resolve(mockErrorResponse(`Offline: ${table} unavailable`)),
    }),
  } as any as SupabaseClient;

  console.log('[Supabase] No valid credentials found - running in OFFLINE/SIMULATED mode');
}

export { supabase };
export const isSupabaseOnline = hasValidCredentials;