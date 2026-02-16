import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Prefer the public anon key for client usage; fall back to the service role key only if needed.
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL environment variable");
if (!supabaseAnonKey) throw new Error("Missing EXPO_PUBLIC_SUPABASE_ANON_KEY (or EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) environment variable");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
