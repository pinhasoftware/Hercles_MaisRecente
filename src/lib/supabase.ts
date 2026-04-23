import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tynoqcelrnqofmdzhxgd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fMjiElgVwdF8vvlv0n2z-A_5xmDmONj";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
  },
});
