/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rzvffgmzmsfbnyycctna.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__UvKR7kEGGMoIW7BCYJfDg_jVzlUAuS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
    webinar: {
        register: async (registration: any) => {
            const clean = { ...registration };
            Object.keys(clean).forEach(k => {
                if (clean[k] === '' || clean[k] === undefined) delete clean[k];
            });
            const { error } = await supabase
                .from('webinar_registrations')
                .insert(clean);
            if (error) throw new Error(error.message);
            return true;
        },
        getAll: async () => {
             const { data, error } = await supabase.from('webinar_registrations').select('*').order('created_at', { ascending: false });
             if (error) throw error;
             return data;
        },
        create: async (webinar: any) => {
            const { data, error } = await supabase.from('webinars').insert(webinar).select().single();
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: any) => {
            const { data, error } = await supabase.from('webinars').update(updates).eq('id', id);
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('webinar_registrations').delete().eq('id', id);
            if (error) throw error;
        }
    },
    tasks: { getAll: async () => [] },
    courses: { getAll: async () => [] },
    batches: { getAll: async () => [] },
    users: { list: async () => [] }
};
