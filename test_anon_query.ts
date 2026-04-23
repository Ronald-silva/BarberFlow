import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('appointments').select('start_datetime, end_datetime, status').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
run();
