import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); // wait, anon key might not have update permissions. We should use SERVICE_ROLE_KEY if available.
// Let's check what's in .env first!
