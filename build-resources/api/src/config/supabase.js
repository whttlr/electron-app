import { createClient } from '@supabase/supabase-js'
// Using console for now since logger service path is not available
const info = (msg) => console.log(`[INFO] ${msg}`)
const warn = (msg) => console.warn(`[WARN] ${msg}`)

const supabaseUrl = process.env.SUPABASE_URL || 'https://osbwbvbswubqjyeqrxee.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zYndidmJzd3VicWp5ZXFyeGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTkzNTMsImV4cCI6MjA2NzA3NTM1M30.qT1YatxADWcer300ZpFmseYwW7P0lhdy-NgckV-m8lc'

if (!supabaseUrl || !supabaseKey) {
  warn('Supabase configuration missing. Some features may be unavailable.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test connection on startup
export async function testSupabaseConnection() {
  try {
    // Test with a simple query instead of system table
    const { data, error } = await supabase.from('machine_configs').select('id').limit(1)
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist - database needs initialization
      warn('⚠️  Supabase database tables not found. Please run schema setup.')
      return false
    }
    
    if (error) {
      throw error
    }
    
    info('✅ Supabase connection established')
    return true
  } catch (error) {
    warn(`⚠️  Supabase connection failed: ${error.message}`)
    return false
  }
}