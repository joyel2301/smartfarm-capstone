import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

let client = null;
if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env missing: set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
} else {
  client = createClient(url, key);
}

export const supabase = client;

// Optional: ease debugging in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('Supabase client ready:', Boolean(client));
  window.supabase = client;
}
