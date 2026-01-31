import { useState, useEffect } from 'react';
import {
    Search, Download, Sheet, ClipboardPaste, RefreshCcw, ShieldCheck,
    Trash2, Phone, MessageCircle, Users
} from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { StatusBadge, FormInput } from './AdminShared';

export function CRMView() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [showSync, setShowSync] = useState(false);
    const [showPaste, setShowPaste] = useState(false);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterSource] = useState('All');
    const [filterWebinar] = useState('All');
    const [crmTab, setCrmTab] = useState<'webinar' | 'demo' | 'seminar' | 'all'>('webinar');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 50;

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const result = await api.webinar.getRegistrationsPaginated({
                page,
                limit: LIMIT,
                query: debouncedSearch,
                source: filterSource,
                webinar_id: filterWebinar,
            });
            if (result?.data) {
                setRegistrations(result.data);
                if (result.count !== null) setTotal(result.count);
            }
        } catch (err) {
            console.error('CRM Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [page, debouncedSearch, filterSource, filterWebinar, crmTab]);

    const totalPages = Math.ceil(total / LIMIT);

    const exportToCSV = () => {
        const headers = ["Name", "Phone", "Email", "City", "Experience", "Source", "Status", "Webinar", "Assignee"];
        const rows = registrations.map((r: any) => [
            `"${r.name || ''}"`,
            `"${r.whatsapp || ''}"`,
            `"${r.email || ''}"`,
            `"${r.city || ''}"`,
            `"${r.experience_level || ''}"`,
            `"${r.campaign_source || 'Organic'}"`,
            `"${r.lead_status || ''}"`,
            `"${r.webinars?.title || ''}"`,
            `"${r.assigned_to || ''}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `nivesh_leads_page${page}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="flex p-1 bg-white rounded-2xl border border-slate-200 w-full xl:w-auto overflow-x-auto no-scrollbar">
                    <button onClick={() => { setCrmTab('webinar'); setPage(1); }} className={`whitespace-nowrap flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${crmTab === 'webinar' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Webinar Joinees</button>
                    <button onClick={() => { setCrmTab('demo'); setPage(1); }} className={`whitespace-nowrap flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${crmTab === 'demo' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Demo Attendees</button>
                    <button onClick={() => { setCrmTab('seminar'); setPage(1); }} className={`whitespace-nowrap flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${crmTab === 'seminar' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Seminars</button>
                    <button onClick={() => { setCrmTab('all'); setPage(1); }} className={`whitespace-nowrap flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${crmTab === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Leads Database</button>
                </div>

                <div className="flex gap-2 w-full xl:w-auto">
                    <button onClick={exportToCSV} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                        <Download size={14} /> Export Page CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, phone, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500/30 transition-all text-sm font-semibold"
                    />
                </div>
                <div className="flex gap-2 text-white">
                    <button
                        onClick={() => setShowSync(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                    >
                        <Sheet size={16} /> Sync
                    </button>
                    <button
                        onClick={() => setShowPaste(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                    >
                        <ClipboardPaste size={16} /> Paste
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <RefreshCcw className="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm">Loading Leads...</p>
                </div>
            ) : (
                <>
                    {/* Mobile Grid */}
                    <div className="grid grid-cols-1 md:hidden gap-4">
                        {registrations.length > 0 ? registrations.map((reg: any) => (
                            <div key={reg.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{reg.name}</h3>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                                            <ShieldCheck size={10} /> {reg.city || 'No Location'}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setSelectedLead(reg)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Sheet size={16} /></button>
                                        <button onClick={async () => { if (confirm('Delete lead?')) { await api.webinar.deleteRegistration(reg.id); fetchLeads(); } }} className="p-2 bg-rose-50 text-rose-500 rounded-xl"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contact</span>
                                        <span className="font-bold text-slate-600">{reg.whatsapp}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                                        <div className="flex items-center gap-2 pb-2">
                                            <StatusBadge status={reg.lead_status} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-2">
                                        <a href={`tel:${reg.whatsapp}`} className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Phone size={14} /></a>
                                        <a href={`https://wa.me/${reg.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><MessageCircle size={14} /></a>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-xl">
                                        {reg.campaign_source || 'Organic'}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center bg-white rounded-[2rem] border border-slate-100">
                                <Users size={32} className="text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-400">No leads found</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignee</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Follow Up</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {registrations.length > 0 ? registrations.map((reg: any) => (
                                        <tr key={reg.id} className="hover:bg-slate-50/50 group transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-slate-900">{reg.name}</p>
                                                <p className="text-[10px] font-semibold text-slate-400">{reg.city || 'No Location'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-600">{reg.whatsapp}</p>
                                                <p className="text-[10px] font-semibold text-slate-400 truncate max-w-[100px]">{reg.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${reg.campaign_source === 'Justdial' ? 'bg-orange-100 text-orange-600' :
                                                    reg.campaign_source === 'Data Vendor' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {reg.campaign_source || 'Organic'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-600">{reg.webinars?.title || 'N/A'}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{reg.webinars?.event_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-600">
                                                {reg.assigned_to || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={reg.lead_status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                {reg.next_follow_up_date ? (
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-1 rounded-lg",
                                                        new Date(reg.next_follow_up_date) < new Date() ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {new Date(reg.next_follow_up_date).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 items-center">
                                                    <button onClick={() => setSelectedLead(reg)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900"><Sheet size={16} /></button>
                                                    <button onClick={async () => { if (confirm('Delete lead?')) { await api.webinar.deleteRegistration(reg.id); fetchLeads(); } }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-bold">No leads found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase disabled:opacity-50">Previous</button>
                <div className="text-xs font-bold text-slate-500">Page {page} of {totalPages || 1}</div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase disabled:opacity-50">Next</button>
            </div>

            {selectedLead && (
                <EditLeadModal
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={fetchLeads}
                />
            )}

            {showSync && <SyncModal onClose={() => setShowSync(false)} onUpdate={fetchLeads} />}
            {showPaste && <PasteImportModal onClose={() => setShowPaste(false)} onUpdate={fetchLeads} />}
        </div>
    );
}

function SyncModal({ onClose, onUpdate }: any) {
    const [sheetUrl, setSheetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.settings.get('googlesheets_link').then(val => {
            if (val?.url) setSheetUrl(val.url);
        });
    }, []);

    const performSync = async () => {
        if (!sheetUrl.includes('/pub?')) {
            setError('Please use a "Published as CSV" link.');
            return;
        }

        setLoading(true);
        try {
            await api.settings.update('googlesheets_link', { url: sheetUrl });
            const response = await fetch(sheetUrl);
            const csvText = await response.text();
            const lines = csvText.split('\n');
            const leads = lines.slice(1).map(line => {
                const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (!cols[1] || !cols[2]) return null;
                return { name: cols[1], whatsapp: cols[2].toString(), lead_status: 'cold', created_at: new Date().toISOString() };
            }).filter(Boolean);

            if (leads.length > 0) {
                await api.webinar.syncBulk(leads);
                onUpdate();
                onClose();
            }
        } catch (err) {
            setError('Sync failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-xl font-bold font-heading mb-4">Google Sheets Sync</h3>
                <FormInput label="Published CSV Link" value={sheetUrl} onChange={setSheetUrl} />
                {error && <p className="text-red-500 text-[10px] mt-2 font-bold">{error}</p>}
                <button disabled={loading} onClick={performSync} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase mt-6">{loading ? 'Syncing...' : 'Sync Now'}</button>
                <button onClick={onClose} className="w-full py-3 text-xs font-bold text-slate-400">Cancel</button>
            </div>
        </div>
    );
}

function PasteImportModal({ onClose, onUpdate }: any) {
    const [pasteRaw, setPasteRaw] = useState('');
    const [preview, setPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [defaultSource, setDefaultSource] = useState('Data Vendor');
    const [targetWebinar] = useState('');

    useEffect(() => {
        if (!pasteRaw.trim()) { setPreview([]); return; }
        const lines = pasteRaw.trim().split('\n');
        const parsed = lines.map(line => {
            const cols = line.split(/[\t,]/).map(p => p.trim());
            if (cols.length >= 2) return { name: cols[0], whatsapp: cols[1] };
            return null;
        }).filter(Boolean);
        setPreview(parsed);
    }, [pasteRaw]);

    const handleSync = async () => {
        setLoading(true);
        try {
            const leads = preview.map(p => ({ ...p, lead_status: 'cold', campaign_source: defaultSource, webinar_id: targetWebinar || null, created_at: new Date().toISOString() }));
            await api.webinar.syncBulk(leads);
            onUpdate();
            onClose();
        } catch (err) { alert('Import failed'); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
                <h3 className="text-xl font-bold font-heading mb-6">Direct Paste Leads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
                    <textarea value={pasteRaw} onChange={(e) => setPasteRaw(e.target.value)} placeholder="Name, Phone..." className="w-full p-4 bg-slate-50 rounded-2xl text-xs h-64" />
                    <div className="flex flex-col gap-4 overflow-hidden">
                        <select value={defaultSource} onChange={e => setDefaultSource(e.target.value)} className="p-3 bg-slate-50 rounded-xl text-xs font-bold">
                            <option value="Data Vendor">Data Vendor</option>
                            <option value="Justdial">Justdial</option>
                        </select>
                        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 rounded-xl">
                            {preview.length} leads found
                        </div>
                        <button disabled={loading || !preview.length} onClick={handleSync} className="py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold uppercase">{loading ? 'Processing...' : 'Import Leads'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditLeadModal({ lead, onClose, onUpdate }: any) {
    const [form, setForm] = useState({
        name: lead.name || '', email: lead.email || '', whatsapp: lead.whatsapp || '',
        city: lead.city || '', lead_status: lead.lead_status || 'cold',
        assigned_to: lead.assigned_to || '', course_id: lead.course_id || '',
        webinar_id: lead.webinar_id || '', follow_up_notes: lead.follow_up_notes || '',
        last_feedback: lead.last_feedback || '',
        next_follow_up_date: lead.next_follow_up_date || ''
    });

    const submit = async (e: any) => {
        e.preventDefault();
        try {
            // Automatically set feedback_date if feedback improved/changed
            const updates = {
                ...form,
                feedback_date: form.last_feedback !== lead.last_feedback ? new Date().toISOString() : lead.feedback_date
            };
            await api.webinar.updateLead(lead.id, updates);
            onUpdate();
            onClose();
        } catch (err) { alert('Update failed'); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6">Edit Lead</h3>
                <form onSubmit={submit} className="space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Name" value={form.name} onChange={(v: any) => setForm({ ...form, name: v })} />
                        <FormInput label="WhatsApp" value={form.whatsapp} onChange={(v: any) => setForm({ ...form, whatsapp: v })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select value={form.lead_status} onChange={e => setForm({ ...form, lead_status: e.target.value })} className="w-full p-4 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none border transition-all">
                                <option value="cold">Cold</option>
                                <option value="warm">Warm</option>
                                <option value="hot">Hot</option>
                                <option value="converted">Converted</option>
                            </select>
                        </div>
                        <FormInput
                            label="Next Follow Up"
                            type="date"
                            value={form.next_follow_up_date}
                            onChange={(v: any) => setForm({ ...form, next_follow_up_date: v })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Latest Feedback</label>
                        <textarea
                            className="w-full p-4 bg-slate-50 border border-transparent rounded-xl text-sm h-24 font-bold outline-none border transition-all"
                            placeholder="What was the response?"
                            value={form.last_feedback}
                            onChange={e => setForm({ ...form, last_feedback: e.target.value })}
                        />
                        {lead.feedback_date && (
                            <p className="text-[8px] font-bold text-slate-400 uppercase ml-1">
                                Last Updated: {new Date(lead.feedback_date).toLocaleString()}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
                        <textarea
                            className="w-full p-4 bg-slate-50 border border-transparent rounded-xl text-sm h-24 font-bold outline-none border transition-all"
                            placeholder="Admin notes..."
                            value={form.follow_up_notes}
                            onChange={e => setForm({ ...form, follow_up_notes: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase">Save</button>
                    <button type="button" onClick={onClose} className="w-full py-3 text-xs font-bold text-slate-400">Cancel</button>
                </form>
            </div>
        </div>
    );
}
