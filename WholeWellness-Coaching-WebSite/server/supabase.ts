import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY environment variable is required')
}

export const supabase = createClient(supabaseUrl, supabaseKey)