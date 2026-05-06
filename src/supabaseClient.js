import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cosuxwoxdylzmpwufsyj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvc3V4d294ZHlsem1wd3Vmc3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzc3NDEsImV4cCI6MjA5MzYxMzc0MX0.MBl436o0ozUeWkKpWznURs3EJKAnHSW7lQdXn6LaLdg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
