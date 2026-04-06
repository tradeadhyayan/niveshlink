import { createClient } from '@supabase/supabase-js';

const projects = [
  {
    name: 'kdrvqtptpymaoekiwirf (Reverted)',
    url: 'https://kdrvqtptpymaoekiwirf.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcnZxdHB0cHltYW9la2l3aXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMDk4MDYsImV4cCI6MjA4NDY4NTgwNn0.JxLadWkV1W-i1sB63AhZfQ883Uz3GVTutPw8jImMWmo'
  },
  {
    name: 'rzvffgmzmsfbnyycctna (Previous)',
    url: 'https://rzvffgmzmsfbnyycctna.supabase.co',
    key: 'sb_publishable__UvKR7kEGGMoIW7BCYJfDg_jVzlUAuS'
  }
];

async function diagnose() {
  for (const p of projects) {
    console.log(`\n--- Testing ${p.name} ---`);
    const supabase = createClient(p.url, p.key);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
        body: { amount: 1 }
      });
      
      if (error) {
        console.log(`[${p.name}] Function Error:`, error.name, error.message);
        if (error.context) console.log(`Context:`, await error.context.text());
      } else {
        console.log(`[${p.name}] SUCCESS! Found function.`);
      }
    } catch (err) {
      console.log(`[${p.name}] Exception:`, err.message);
    }
  }
}

diagnose();
