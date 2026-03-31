import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdrvqtptpymaoekiwirf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcnZxdHB0cHltYW9la2l3aXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMDk4MDYsImV4cCI6MjA4NDY4NTgwNn0.JxLadWkV1W-i1sB63AhZfQ883Uz3GVTutPw8jImMWmo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistration() {
  const clean = {
    name: 'Test Agent',
    whatsapp: '1234567890',
    email: 'test@example.com',
    webinar_date: '7 Feb, 5 PM Onwards '
  };
  
  const { error } = await supabase
    .from('webinar_registrations')
    .insert(clean);

  if (error) {
    console.error('Registration/Sync Error:', error);
  } else {
    console.log('Success!');
  }
}

testRegistration();
