import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzvffgmzmsfbnyycctna.supabase.co';
const supabaseAnonKey = 'sb_publishable__UvKR7kEGGMoIW7BCYJfDg_jVzlUAuS';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    console.log('--- Starting Admin Verification ---');

    // 1. Test Webinar Creation
    console.log('\n[1] Testing Webinar Creation...');
    const webinarPayload = {
        title: 'VERIFY_TEST_WEBINAR',
        date: '2026-02-01',
        time: '10:00 AM',
        link: 'https://meet.google.com/test',
        whatsapp_group_link: 'https://chat.whatsapp.com/test',
        event_type: 'Demo Session',
        status: 'active'
    };

    try {
        const { data: wData, error: wError } = await supabase.from('webinars').insert(webinarPayload).select().single();
        if (wError) {
            console.error('FAILED: Webinar Creation', wError);
        } else {
            console.log('SUCCESS: Webinar Created:', wData.id);
            // Cleanup
            await supabase.from('webinars').delete().eq('id', wData.id);
            console.log('CLEANUP: Webinar Deleted');
        }
    } catch (e) {
        console.error('EXCEPTION: Webinar Creation', e);
    }

    // 2. Test Course Creation
    console.log('\n[2] Testing Course Creation...');
    const coursePayload = {
        name: 'VERIFY_TEST_COURSE',
        price: 999,
        status: 'draft',
        description: 'Test description'
    };

    let courseId = null;
    try {
        const { data: cData, error: cError } = await supabase.from('courses').insert(coursePayload).select().single();
        if (cError) {
            console.error('FAILED: Course Creation', cError);
        } else {
            console.log('SUCCESS: Course Created:', cData.id);
            courseId = cData.id;
        }
    } catch (e) {
        console.error('EXCEPTION: Course Creation', e);
    }

    // 3. Test Batch Creation (requires course)
    if (courseId) {
        console.log('\n[3] Testing Batch Creation...');
        const batchPayload = {
            name: 'VERIFY_TEST_BATCH',
            course_id: courseId,
            start_date: '2026-03-01',
            status: 'upcoming'
        };

        try {
            const { data: bData, error: bError } = await supabase.from('batches').insert(batchPayload).select().single();
            if (bError) {
                console.error('FAILED: Batch Creation', bError);
            } else {
                console.log('SUCCESS: Batch Created:', bData.id);
                await supabase.from('batches').delete().eq('id', bData.id);
                console.log('CLEANUP: Batch Deleted');
            }
        } catch (e) {
            console.error('EXCEPTION: Batch Creation', e);
        }

        // Cleanup Course
        await supabase.from('courses').delete().eq('id', courseId);
        console.log('CLEANUP: Course Deleted');
    } else {
        console.log('\n[3] SKIPPED: Batch Creation (Course creation failed)');
    }
}

verify();
