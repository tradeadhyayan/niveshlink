import { createClient } from '@supabase/supabase-js';

const projects = [
  {
    id: 'kdrvqtptpymaoekiwirf',
    url: 'https://kdrvqtptpymaoekiwirf.supabase.co',
    keys: [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcnZxdHB0cHltYW9la2l3aXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMDk4MDYsImV4cCI6MjA4NDY4NTgwNn0.JxLadWkV1W-i1sB63AhZfQ883Uz3GVTutPw8jImMWmo'
    ]
  },
  {
    id: 'rzvffgmzmsfbnyycctna',
    url: 'https://rzvffgmzmsfbnyycctna.supabase.co',
    keys: [
      'sb_publishable__UvKR7kEGGMoIW7BCYJfDg_jVzlUAuS',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dmZmZ216bXNmYm55eWNjdG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODMxOTcsImV4cCI6MjA4NTI1OTE5N30.fkLg5uJS029mhvBh41qkx6_t1eRW6u1HGB-wvrmIq9s'
    ]
  }
];

async function runTests() {
  for (const p of projects) {
    for (const key of p.keys) {
      console.log(`\n=== Project: ${p.id} | Key: ${key.slice(0, 20)}... ===`);
      const supabase = createClient(p.url, key);

      // Test 1: Health check / Function existence
      try {
        console.log(`[TEST] Checking Function existence...`);
        const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
          body: { amount: 1 }
        });
        if (error) {
          console.log(`[!] Function call error:`, error.name, error.message);
          if (error.context) console.log(`[!] Context:`, await error.context.text());
        } else {
          console.log(`[✓] SUCCESS: Function found and responded:`, data);
        }
      } catch (e) {
        console.log(`[!] Function CRASH:`, e.message);
      }

      // Test 2: Table existence
      try {
        console.log(`[TEST] Checking 'webinar_registrations' table...`);
        const { data, error } = await supabase.from('webinar_registrations').select('count').limit(1);
        if (error) {
          console.log(`[!] Table error:`, error.message);
        } else {
          console.log(`[✓] SUCCESS: Table found.`);
        }
      } catch (e) {
        console.log(`[!] Table CRASH:`, e.message);
      }
    }
  }
}

runTests();
