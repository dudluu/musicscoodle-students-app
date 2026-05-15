import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://grvqawjtobuqyuggaouj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydnFhd2p0b2J1cXl1Z2dhb3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjA0OTIsImV4cCI6MjA2ODEzNjQ5Mn0.WqbdusXpvlQyB5L5DZRnL6rJkUwD5Q4Q_Izjs6NIsew';

// Create Supabase client with realtime disabled to avoid metro bundler issues
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    disabled: true
  }
});

export { supabase };
