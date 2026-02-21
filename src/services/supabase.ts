import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxhdyvsiabdwvzkyhboi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4aGR5dnNpYWJkd3Z6a3loYm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4Mzk3MzksImV4cCI6MjA3MjQxNTczOX0.fsqxe4tlMU276QPPb7KY-KUTYSTFDhTsPNtFIIk7Mu0';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Environment variables not loaded from .env file. Using hardcoded fallbacks.');
  console.warn('Please check that your .env file exists and is being loaded correctly by Vite.');
}

// Create a single supabase client for the entire app
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Note: Authentication functions have been removed
// The application now operates without user authentication
