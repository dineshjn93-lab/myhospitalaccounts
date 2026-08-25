import { createClient } from "@supabase/supabase-js";

// =======================================================
// 1. YOUR SUPABASE PROJECT URL
// (URL is automatically normalized to remove any trailing /rest/v1)
// =======================================================
const RAW_SUPABASE_URL = "https://emgxigvnveeyuzcgeczf.supabase.co/rest/v1/";

// =======================================================
// 2. YOUR SUPABASE ANON / PUBLIC API KEY
// =======================================================
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ3hpZ3ZudmVleXV6Y2dlY3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDE1ODgsImV4cCI6MjEwMzIxNzU4OH0.Lb0G1wVG775xiTSWUWnSHr1WoIUV8w07YBMzMSqHv_o";

// Normalize URL: Supabase client expects the root origin (e.g. https://xxx.supabase.co)
export const SUPABASE_URL = RAW_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

// Export the initialized Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
