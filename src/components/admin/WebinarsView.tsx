import { useState } from 'react';
import { Plus, Calendar, History, Trash2, MoreVertical, X } from 'lucide-react';
import { api } from '../../lib/api';
import { FormInput } from './AdminShared';

export function WebinarsView({ webinars, onUpdate }: any) {
    const [showForm, setShowForm] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState<any>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading">Webinar Management</h2>
                <button
                    onClick={() => { setEditingWebinar(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all"
                >
                    <Plus size={16} /> New Webinar
                </button>
            </div>

            <div className="grid grid-cols-1 md:hidden gap-4">
                {webinars.map((web: any) => (
                    <div key={web.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest ${web.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            {web.status}
                        </div>
                        <div>
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold uppercase tracking-widest">{web.event_type}</span>
                            <h3 className="text-lg font-bold text-slate-900 mt-2">{web.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(web.date).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1"><History size={14} /> {web.time}</div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex gap-2">
                            <button onClick={() => { setEditingWebinar(web); setShowForm(true); }} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest">Edit</button>
                            <button onClick={() => { if (window.confirm('Delete?')) api.webinar.delete(web.id).then(onUpdate); }} className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic / Title</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {webinars.map((web: any) => (
                            <tr key={web.id} className="hover:bg-slate-50/50 group transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-slate-900">{web.title}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs font-bold text-slate-600">{new Date(web.date).toLocaleDateString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{web.time}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">{web.event_type}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${web.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {web.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingWebinar(web); setShowForm(true); }}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        <button
                                            onClick={() => { if (window.confirm('Delete webinar?')) api.webinar.delete(web.id).then(onUpdate); }}
                                            className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <WebinarForm
                    webinar={editingWebinar}
                    onClose={() => setShowForm(false)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
}

function WebinarForm({ webinar, onClose, onUpdate }: any) {
    const [form, setForm] = useState(webinar || { title: '', date: '', time: '', link: '', whatsapp_group_link: '', event_type: 'Webinar', status: 'active' });
    const [loading, setLoading] = useState(false);

    const submit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (webinar?.id) await api.webinar.update(webinar.id, form);
            else await api.webinar.create(form);
            onUpdate();
            onClose();
        } catch (err) { alert('Failed to save event'); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold font-heading">{webinar ? 'Edit Event' : 'New Webinar Plan'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
                </div>
                <form onSubmit={submit} className="space-y-5">
                    <FormInput label="Webinar Topic / Title" value={form.title} onChange={(v: string) => setForm({ ...form, title: v })} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Event Date" type="date" value={form.date} onChange={(v: string) => setForm({ ...form, date: v })} />
                        <FormInput label="Event Time" placeholder="e.g. 7:00 PM" value={form.time} onChange={(v: string) => setForm({ ...form, time: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event Type</label>
                            <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none cursor-pointer">
                                <option value="Webinar">Webinar</option>
                                <option value="Demo Session">Demo Session</option>
                                <option value="Seminar">Seminar</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none cursor-pointer">
                                <option value="active">Active</option>
                                <option value="completed">Past / Closed</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                    <FormInput label="WhatsApp Group Link" value={form.whatsapp_group_link} onChange={(v: string) => setForm({ ...form, whatsapp_group_link: v })} />
                    <FormInput label="Meeting Link" value={form.link} onChange={(v: string) => setForm({ ...form, link: v })} />
                    <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest mt-6 shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all">{loading ? 'Processing...' : (webinar ? 'Update Details' : 'Finalize & Launch Event')}</button>
                </form>
            </div>
        </div>
    );
}
