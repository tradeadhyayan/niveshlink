import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kdrvqtptpymaoekiwirf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcnZxdHB0cHltYW9la2l3aXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMDk4MDYsImV4cCI6MjA4NDY4NTgwNn0.JxLadWkV1W-i1sB63AhZfQ883Uz3GVTutPw8jImMWmo';

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
            const clean = { ...registration };
            // Clear empty strings and UI fields
            Object.keys(clean).forEach(k => {
                if (clean[k] === '' || clean[k] === undefined) delete clean[k];
            });
            delete clean.initial_payment;

            const { error } = await supabase
                .from('webinar_registrations')
                .insert(clean);

            if (error) {
                console.error('Registration/Sync Error:', error);
                throw new Error(error.message);
            }
            return true;
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
        getRegistrationsPaginated: async ({ page = 1, limit = 50, query = '', status = '', source = '', webinar_id = '', type = 'all', pending = false }: any) => {
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

            if (type === 'events') {
                dbQuery = dbQuery.not('webinar_id', 'is', null);
            } else if (type === 'demo') {
                dbQuery = dbQuery.eq('lead_status', 'demo');
            } else if (type === 'follow_up') {
                dbQuery = dbQuery.not('next_follow_up_date', 'is', null)
                    .order('next_follow_up_date', { ascending: true });
                if (pending) {
                    // Still filter by date if specifically requested for a "pending" list
                    dbQuery = dbQuery.lte('next_follow_up_date', new Date().toISOString().split('T')[0]);
                }
            }

            const { data, count, error } = await dbQuery;
            if (error) throw error;
            return { data, count };
        },
        removeFromWebinar: async (id: string) => {
            const { error } = await supabase.from('webinar_registrations').update({ webinar_id: null }).eq('id', id);
            if (error) throw error;
        },
        updateLead: async (id: string, updates: any) => {
            const { data, error } = await supabase
                .from('webinar_registrations')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            return data;
        },
        syncBulk: async (leads: any[], metadata: { source: string, type: string, webinar_id?: string } = { source: 'Manual', type: 'leads' }) => {
            // 1. Create Import Record
            const { data: importRec, error: impErr } = await supabase
                .from('lead_imports')
                .insert({
                    source: metadata.source,
                    import_type: metadata.type,
                    webinar_id: metadata.webinar_id,
                    record_count: leads.length
                })
                .select()
                .single();

            if (impErr) console.error('Import Record Error:', impErr);

            // 2. Deduplicate leads by whatsapp
            const seen = new Set();
            const deduplicated = leads.filter(l => {
                if (!l.whatsapp) return false;
                if (seen.has(l.whatsapp)) return false;
                seen.add(l.whatsapp);
                return true;
            });

            const cleanedLeads = deduplicated.map(l => {
                const clean = { ...l, import_id: importRec?.id };
                Object.keys(clean).forEach(k => {
                    if (clean[k] === '' || clean[k] === undefined) delete clean[k];
                });
                return clean;
            });

            // 3. Upsert
            const { data, error } = await supabase
                .from('webinar_registrations')
                .upsert(cleanedLeads, { onConflict: 'whatsapp,webinar_id' })
                .select();

            if (error) {
                console.error('Bulk Sync Error:', error);
                throw new Error(error.message);
            }
            return { data, importId: importRec?.id };
        },
        deleteAllRegistrations: async () => {
            const { error } = await supabase.from('webinar_registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) throw error;
            return true;
        },
        bulkUpdateLeads: async (ids: string[], updates: any) => {
            const { data, error } = await supabase
                .from('webinar_registrations')
                .update(updates)
                .in('id', ids);
            if (error) throw error;
            return data;
        },
        syncToSheets: async (leads: any[], webhookUrl: string) => {
            // If the user provides a Google Apps Script Webhook
            await fetch(webhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads, timestamp: new Date().toISOString() })
            });
            return true;
        },
        getDashboardStats: async () => {
            const today = new Date().toISOString().split('T')[0];

            // Fetch relevant columns for all registrations to compute metrics
            const { data: allRegs, error } = await supabase
                .from('webinar_registrations')
                .select('campaign_source, lead_status, fees_paid, next_follow_up_date');

            if (error) throw error;

            const stats = {
                total: allRegs.length,
                hot: 0,
                demo: 0,
                enrolled: 0,
                revenue: 0,
                follow_ups: 0,
                campaigns: {} as any
            };

            allRegs.forEach(r => {
                if (r.lead_status === 'hot') stats.hot++;
                if (r.lead_status === 'demo') stats.demo++;
                if (r.lead_status === 'enrolled') {
                    stats.enrolled++;
                    stats.revenue += (Number(r.fees_paid) || 0);
                }

                // Track follow-ups due today or overdue
                if (r.next_follow_up_date && r.next_follow_up_date <= today && r.lead_status !== 'enrolled') {
                    stats.follow_ups++;
                }

                const s = r.campaign_source || 'Organic';
                if (!stats.campaigns[s]) stats.campaigns[s] = { total: 0, enrolled: 0 };
                stats.campaigns[s].total++;
                if (r.lead_status === 'enrolled') stats.campaigns[s].enrolled++;
            });

            return stats;
        },
        getCalendarEvents: async () => {
            // Fetch: 1. Webinars, 2. Tasks with due dates, 3. Leads with follow up dates
            const [webs, tsks, folls] = await Promise.all([
                supabase.from('webinars').select('*').eq('status', 'active'),
                supabase.from('admin_tasks').select('*').not('due_date', 'is', null),
                supabase.from('webinar_registrations').select('id, name, whatsapp, next_follow_up_date, lead_status, last_feedback').not('next_follow_up_date', 'is', null)
            ]);

            const events: any[] = [];

            webs.data?.forEach(w => events.push({
                id: `web-${w.id}`,
                title: `[${w.event_type}] ${w.title}`,
                date: w.date,
                type: 'event',
                color: 'bg-emerald-500',
                raw: w
            }));
            tsks.data?.forEach(t => events.push({
                id: `tsk-${t.id}`,
                title: `[Task] ${t.title}`,
                date: t.due_date,
                type: 'task',
                color: t.status === 'completed' ? 'bg-slate-400' : 'bg-indigo-500',
                raw: t
            }));
            folls.data?.forEach(f => events.push({
                id: `fol-${f.id}`,
                title: `[FollowUp] ${f.name}`,
                date: f.next_follow_up_date,
                type: 'followup',
                color: 'bg-orange-500',
                raw: f
            }));

            return events;
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
        },
        importBulk: async (records: any[]) => {
            for (const record of records) {
                let regId = null;
                const { data: reg } = await supabase
                    .from('webinar_registrations')
                    .select('id')
                    .eq('whatsapp', record.whatsapp)
                    .maybeSingle();

                if (reg?.id) {
                    regId = reg.id;
                } else {
                    const { data: newReg, error: regErr } = await supabase
                        .from('webinar_registrations')
                        .insert({
                            whatsapp: record.whatsapp,
                            name: record.name || 'Bulk Client',
                            lead_status: 'enrolled',
                            campaign_source: 'Manual Import',
                            created_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();
                    if (regErr) {
                        console.error('Error creating student in bulk:', regErr);
                        continue; // Skip this one if failed
                    }
                    if (newReg) regId = newReg.id;
                }

                if (regId) {
                    const { error: insErr } = await supabase.from('fee_installments').insert({
                        registration_id: regId,
                        amount: record.amount,
                        method: record.method || 'Bulk Import',
                        payment_date: record.date || new Date().toISOString()
                    });
                    if (insErr) console.error('Error adding installment in bulk:', insErr);
                    await api.fees._recalculateFees(regId);
                }
            }
            return true;
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
    batches: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('batches')
                .select('*, courses:course_id(name, price)')
                .order('start_date', { ascending: false });
            if (error) throw error;
            return data;
        },
        create: async (batch: any) => {
            const { data, error } = await supabase.from('batches').insert(batch).select().single();
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('batches').update(updates).eq('id', id);
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('batches').delete().eq('id', id);
            if (error) throw error;
        }
    },
    admin: {
        listUsers: async () => {
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        getImports: async () => {
            const { data, error } = await supabase
                .from('lead_imports')
                .select('*, webinars(title)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        deleteImport: async (id: string, removeLeads: boolean = false) => {
            if (removeLeads) {
                // Delete registrations associated with this import
                await supabase.from('webinar_registrations').delete().eq('import_id', id);
            }
            const { error } = await supabase.from('lead_imports').delete().eq('id', id);
            if (error) throw error;
            return true;
        },
        getAnalyticsData: async () => {
            // Fetch comprehensive data for conversion and ROI analysis
            const [regs, exps] = await Promise.all([
                supabase.from('webinar_registrations').select('id, created_at, campaign_source, lead_status, fees_paid, fees_pending'),
                supabase.from('expenses').select('*')
            ]);
            return { registrations: regs.data || [], expenses: exps.data || [] };
        }
    },
    expenses: {
        list: async () => {
            const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
            if (error) throw error;
            return data;
        },
        create: async (expense: any) => {
            const { data, error } = await supabase.from('expenses').insert(expense).select().single();
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            return true;
        }
    }
};
