import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnmvxxeqmmechgdlrxib.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubXZ4eGVxbW1lY2hnZGxyeGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MDg3NDAsImV4cCI6MjA4NjM4NDc0MH0.NBM1H6qVWq9n2IOpXOO1v3u-KYkDh9dhQs5jrSdHOj8'

export const supabase = createClient(supabaseUrl, supabaseKey)
