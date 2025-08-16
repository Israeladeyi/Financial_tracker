import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cprlbxraxyzsrqpkuwbi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcmxieHJheHl6c3JxcGt1d2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDE0MDIsImV4cCI6MjA3MDg3NzQwMn0.Ub2mcOmIB-ZNoVmHruoBB9OQ09Kr3QgULS9iXRAQ3e8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
