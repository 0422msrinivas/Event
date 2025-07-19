import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vblgjhpvbwcccqtfqsww.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibGdqaHB2YndjY2NxdGZxc3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzMyMzksImV4cCI6MjA2ODQwOTIzOX0.agNuW3E8o81iJPYXPKojdM1f4vYNArohvaSHY5bUIew'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
