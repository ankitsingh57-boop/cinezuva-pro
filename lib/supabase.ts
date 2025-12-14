import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ihkfqwbvicfnusqbkvmw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloa2Zxd2J2aWNmbnVzcWJrdm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDc4NTgsImV4cCI6MjA2OTc4Mzg1OH0.P8j2PXXj32ybbE-kia6dDsQbBS8BT0sbVy37skR1djA';

export const supabase = createClient(supabaseUrl, supabaseKey);