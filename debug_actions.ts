
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzvffgmzmsfbnyycctna.supabase.co';
const supabaseAnonKey = 'sb_publishable__UvKR7kEGGMoIW7BCYJfDg_jVzlUAuS';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWebinarCreation() {
    console.log('Testing Webinar Creation...');
    const webinarPayload = {
        title: "Debug Webinar " + Date.now(),
        date: new Date().toISOString(),
        time: "10:00 AM",
        event_type: "Demo Session",
        status: "active", // based on previous fix
        link: "https://zoom.us/test", // mapped to 'link' column
        description: "Debug description",
        whatsapp_group_link: "https://chat.whatsapp.com/test"
    };

    const { data, error } = await supabase.from('webinars').insert(webinarPayload).select().single();
    if (error) {
        console.error('FAILED to create webinar:', error);
    } else {
        console.log('SUCCESS: Created webinar:', data.id);
        // Clean up
        await supabase.from('webinars').delete().eq('id', data.id);
    }
}

async function testLeadImport() {
    console.log('\nTesting Lead Import...');
    const leadPayload = {
        name: "Debug Lead",
        whatsapp: "9999999999",
        lead_status: "cold",
        campaign_source: "Debug Script",
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('webinar_registrations').upsert(leadPayload, { onConflict: 'whatsapp' }).select().single();
    if (error) {
        console.error('FAILED to import lead:', error);
    } else {
        console.log('SUCCESS: Imported lead:', data);
        // Clean up
        await supabase.from('webinar_registrations').delete().eq('whatsapp', '9999999999');
    }
}

async function run() {
    await testWebinarCreation();
    await testLeadImport();
}

run();
