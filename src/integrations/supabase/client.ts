// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://savtykmcstmzfcbslvhp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdnR5a21jc3RtemZjYnNsdmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMTM3NzEsImV4cCI6MjA2MjY4OTc3MX0.q8WUc7O0fqAzPwHjIuTVs4Runxki2UaNPkuo7hp1usM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);