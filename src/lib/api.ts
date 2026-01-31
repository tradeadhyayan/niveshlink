import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzvffgmzmsfbnyycctna.supabase.co';
const supabaseAnonKey = 'sb_publishable__UvKR7kEGGMoIW7BCYJfDg_jVzlUAuS';

console.log('Nivesh Link API Version: 1.0.7');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
    webinar: {
        getActive: async () => {
            const { data, error } = await supabase
                .from('webinars')
                .select('*')
                .eq('status', 'active')
                .single();
            if (error) console.error('Error fetching active webinar:', error);
            return data;
        },
        getAll: async () => {
            const { data, error } = await supabase
                .from('webinars')
                .select('*')
                .order('date', { ascending: false });
            if (error) throw error;
            return data;
        },
        create: async (webinar: any) => {
            const { data, error } = await supabase.from('webinars').insert(webinar).select().single();
            if (error) {
                console.error('Failed to create webinar:', error);
                throw error;
            }
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('webinars').update(updates).eq('id', id);
            if (error) {
                console.error('Failed to update webinar:', error);
                throw error;
            }
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('webinars').delete().eq('id', id);
            if (error) {
                console.error('Failed to delete webinar:', error);
                throw error;
            }
        },
        register: async (registration: any) => {
            const { data, error } = await supabase
                .from('webinar_registrations')
                .upsert(registration, { onConflict: 'whatsapp' }); // Use upsert for sync safety

            if (error) {
                console.error('Registration/Sync Error:', error);
                throw error;
            }
            return data;
        },
        getAllRegistrations: async () => {
            const { data, error } = await supabase
                .from('webinar_registrations')
                .select('*, courses:course_id(name, price), webinars(title, event_type)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        updateLead: async (id: string, updates: any) => {
            const { data, error } = await supabase
                .from('webinar_registrations')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            return data;
        },
        syncBulk: async (leads: any[]) => {
            const { data, error } = await supabase
                .from('webinar_registrations')
                .upsert(leads, { onConflict: 'whatsapp' });
            if (error) throw error;
            return data;
        },
        deleteRegistration: async (id: string) => {
            const { error } = await supabase.from('webinar_registrations').delete().eq('id', id);
            if (error) throw error;
        }
    },
    settings: {
        get: async (id: string) => {
            const { data, error } = await supabase
                .from('admin_settings')
                .select('value')
                .eq('id', id)
                .single();
            if (error) return null;
            return data.value;
        },
        update: async (id: string, value: any) => {
            const { data, error } = await supabase
                .from('admin_settings')
                .upsert({ id, value, updated_at: new Date().toISOString() });
            if (error) throw error;
            return data;
        }
    },
    courses: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('price', { ascending: true });
            if (error) throw error;
            return data;
        },
        create: async (course: any) => {
            const { data, error } = await supabase.from('courses').insert(course).select().single();
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('courses').update(updates).eq('id', id);
            if (error) throw error;
            return data;
        }
    },
    batches: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('batches')
                .select('*, courses(name)')
                .order('start_date', { ascending: false });
            if (error) throw error;
            return data;
        },
        create: async (batch: any) => {
            const { data, error } = await supabase.from('batches').insert(batch).select().single();
            if (error) throw error;
            return data;
        }
    },
    content: {
        getModules: async (courseId: string) => {
            const { data, error } = await supabase
                .from('modules')
                .select('*, lessons(*)')
                .eq('course_id', courseId)
                .order('order_index', { ascending: true });
            if (error) throw error;
            return data;
        },
        addModule: async (module: any) => {
            const { data, error } = await supabase.from('modules').insert(module).select().single();
            if (error) throw error;
            return data;
        },
        addLesson: async (lesson: any) => {
            const { data, error } = await supabase.from('lessons').insert(lesson).select().single();
            if (error) throw error;
            return data;
        }
    },
    profiles: {
        get: async (id: string) => {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (error) return null;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('profiles').update(updates).eq('id', id);
            if (error) throw error;
            return data;
        }
    },
    fees: {
        getInstallments: async (registrationId: string) => {
            const { data, error } = await supabase
                .from('fee_installments')
                .select('*')
                .eq('registration_id', registrationId)
                .order('payment_date', { ascending: false });
            if (error) throw error;
            return data;
        },
        addInstallment: async (installment: any) => {
            const { data, error } = await supabase
                .from('fee_installments')
                .insert(installment);
            if (error) throw error;

            const { data: allInstallments } = await supabase
                .from('fee_installments')
                .select('amount')
                .eq('registration_id', installment.registration_id);

            const total = allInstallments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

            await supabase
                .from('webinar_registrations')
                .update({ fees_paid: total })
                .eq('id', installment.registration_id);

            return data;
        }
    },
    tasks: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('admin_tasks')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        create: async (task: any) => {
            const { data, error } = await supabase
                .from('admin_tasks')
                .insert(task);
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase
                .from('admin_tasks')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase
                .from('admin_tasks')
                .delete()
                .eq('id', id);
            if (error) throw error;
        }
    },
    users: {
        list: async () => {
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        create: async (user: any) => {
            // Note: This creates a profile record. For login access, Supabase Auth signUp is needed.
            // This assumes we are just adding a record to the public.users table for CRM/tracking.
            const { data, error } = await supabase.from('users').insert(user).select().single();
            if (error) throw error;
            return data;
        },
        updateProfile: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('users').update(updates).eq('id', id);
            if (error) throw error;
            return data;
        }
    },
    admin: {
        listUsers: async () => {
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    }
};
