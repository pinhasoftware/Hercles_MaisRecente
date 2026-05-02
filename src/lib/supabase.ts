import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pnxdmkkokzvzzmiqhrah.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cUhh42e9cxNwU9TJxIUGwg_dX0hzj4j";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
  },
});
