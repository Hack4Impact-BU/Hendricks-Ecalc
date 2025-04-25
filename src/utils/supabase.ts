import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Ensure both the supabaseUrl and supabaseServiceRoleKey have their keys in the .env file. 
// If not the application will not run.
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

// Then create a supabase client to call the database and auth for our handlers.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;