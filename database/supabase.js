import { createClient } from '@supabase/supabase-js';

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseURL || !supabaseKEY) {
  console.error('Missing Supabase configuration. Please check your .env file.');
}

console.log(supabaseURL);
console.log(supabaseKEY);

// Inisialisasi Client Supabase
const supabase = createClient(supabaseURL, supabaseKEY);

export default supabase;
