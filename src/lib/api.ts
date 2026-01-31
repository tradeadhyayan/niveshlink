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
                .order('created_at', { ascending: false })
                .limit(50); // Hard limit to prevent crash until migration complete
            if (error) throw error;
            return data;
        },
        getRegistrationsPaginated: async ({ page = 1, limit = 50, query = '', status = '', source = '', webinar_id = '' }: any) => {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let dbQuery = supabase
                .from('webinar_registrations')
                .select('*, courses:course_id(name, price), webinars(title, event_type)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (query) dbQuery = dbQuery.or(`name.ilike.%${query}%,whatsapp.ilike.%${query}%,email.ilike.%${query}%`);
            if (status && status !== 'All') dbQuery = dbQuery.eq('lead_status', status);
            if (source && source !== 'All') dbQuery = dbQuery.eq('campaign_source', source);
            if (webinar_id && webinar_id !== 'All') dbQuery = dbQuery.eq('webinar_id', webinar_id);
            // type filtering for webinar/demo/seminar needs join filtering, which is complex in simple query.
            // Simplified: If webinar_id is passed, we filter by that. "Type" usually maps to a set of webinar_ids in logic or requires embedded resource filtering.
            // For now, we will rely on webinar_id filtering, or client side logic if volume allows, but for 100k, we need server side.
            // Let's assume 'type' filter isn't strictly enforced on DB level yet unless we denormalize or use !inner join. 
            // We will stick to basic filters first.

            const { data, count, error } = await dbQuery;
            if (error) throw error;
            return { data, count };
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
        getDashboardStats: async () => {
            const [total, hot, enrolled] = await Promise.all([
                supabase.from('webinar_registrations').select('*', { count: 'exact', head: true }),
                supabase.from('webinar_registrations').select('*', { count: 'exact', head: true }).eq('lead_status', 'hot'),
                supabase.from('webinar_registrations').select('*', { count: 'exact', head: true }).eq('lead_status', 'enrolled'),
            ]);

            // Revenue calculation - only fetch the fees_paid column for enrolled leads
            const { data: revenueData } = await supabase
                .from('webinar_registrations')
                .select('fees_paid')
                .eq('lead_status', 'enrolled');

            const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.fees_paid) || 0), 0) || 0;

            // Campaigns - potentially many, so we fetch only the source column
            // For 100k, this is still 100k strings, but much better than 100k full objects.
            const { data: sourceData } = await supabase
                .from('webinar_registrations')
                .select('campaign_source');

            const campaigns: any = {};
            sourceData?.forEach(r => {
                const s = r.campaign_source || 'Organic';
                campaigns[s] = (campaigns[s] || 0) + 1;
            });

            return {
                total: total.count || 0,
                hot: hot.count || 0,
                enrolled: enrolled.count || 0,
                revenue: totalRevenue,
                campaigns
            };
        },
        getFeesPaginated: async ({ page = 1, limit = 50, query = '' }: any) => {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let dbQuery = supabase
                .from('webinar_registrations')
                .select('*, courses:course_id(name, price), webinars(title)', { count: 'exact' })
                .eq('lead_status', 'enrolled')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (query) dbQuery = dbQuery.or(`name.ilike.%${query}%,whatsapp.ilike.%${query}%,email.ilike.%${query}%`);

            const { data, count, error } = await dbQuery;
            if (error) throw error;
            return { data, count };
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
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('courses').delete().eq('id', id);
            if (error) throw error;
            return true;
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
                .insert(installment)
                .select()
                .single();
            if (error) throw error;

            await api.fees._recalculateFees(installment.registration_id);
            return data;
        },
        updateInstallment: async (id: string, updates: any) => {
            const { data, error } = await supabase
                .from('fee_installments')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;

            if (data?.registration_id) {
                await api.fees._recalculateFees(data.registration_id);
            }
            return data;
        },
        deleteInstallment: async (id: string, registrationId: string) => {
            const { error } = await supabase
                .from('fee_installments')
                .delete()
                .eq('id', id);
            if (error) throw error;

            await api.fees._recalculateFees(registrationId);
            return true;
        },
        _recalculateFees: async (registrationId: string) => {
            const { data: allInstallments } = await supabase
                .from('fee_installments')
                .select('amount')
                .eq('registration_id', registrationId);

            const total = allInstallments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

            await supabase
                .from('webinar_registrations')
                .update({ fees_paid: total })
                .eq('id', registrationId);
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
        list: async (limit = 1000) => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
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
