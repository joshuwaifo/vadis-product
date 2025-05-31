import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tloxhbxgwqyabqirlslv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsb3hoYnhnd3F5YWJxaXJsc2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NzA4OTAsImV4cCI6MjA2NDI0Njg5MH0.eEZ-5rdse7muDpUtys1UDVHECFTAG0QhMDYbILyfEiM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)