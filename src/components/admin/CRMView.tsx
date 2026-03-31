import { useState, useEffect } from 'react';
import {
    Search, ClipboardPaste, RefreshCcw, Download,
    Trash2, Users, X, History, CheckSquare, Square, ArrowRightLeft, Calendar, Sheet as SheetIcon
} from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { FormInput } from './AdminShared';

export function CRMView({ webinars = [], courses = [], initialTab = 'events' }: any) {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [showSync, setShowSync] = useState(false);
    const [showPaste, setShowPaste] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Multi-Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterSource] = useState('All');
    const [filterWebinar] = useState('All');
    const [crmTab, setCrmTab] = useState<'events' | 'demo' | 'follow_up' | 'all'>(initialTab);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 50;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
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
                type: crmTab
            });
            if (result?.data) {
                setRegistrations(result.data);
                if (result.count !== null) setTotal(result.count);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchLeads();
    }, [page, debouncedSearch, filterSource, filterWebinar, crmTab]);

    const totalPages = Math.ceil(total / LIMIT);

    const toggleAll = () => {
        if (selectedIds.size === registrations.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(registrations.map(r => r.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleBulkAction = async (action: 'status' | 'webinar' | 'delete', value?: any) => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);

        if (action === 'delete') {
            if (!confirm(`Delete ${ids.length} leads permanently?`)) return;
            await Promise.all(ids.map(id => api.webinar.deleteRegistration(id)));
        } else if (action === 'status') {
            const updates: any = { lead_status: value };
            if (value === 'follow_up') {
                updates.next_follow_up_date = new Date().toISOString().split('T')[0];
                updates.lead_status = 'warm'; // Default to warm if moving to follow up
            }
            await api.webinar.bulkUpdateLeads(ids, updates);
        } else if (action === 'webinar') {
            await api.webinar.bulkUpdateLeads(ids, { webinar_id: value });
        }

        setSelectedIds(new Set());
        fetchLeads();
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200 w-full xl:w-auto overflow-x-auto no-scrollbar">
                    <button onClick={() => { setCrmTab('events'); setPage(1); }} className={`whitespace-nowrap px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${crmTab === 'events' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}>Events</button>
                    <button onClick={() => { setCrmTab('demo'); setPage(1); }} className={`whitespace-nowrap px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${crmTab === 'demo' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}>Demo</button>
                    <button onClick={() => { setCrmTab('follow_up'); setPage(1); }} className={`whitespace-nowrap px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${crmTab === 'follow_up' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}>Follow up</button>
                    <button onClick={() => { setCrmTab('all'); setPage(1); }} className={`whitespace-nowrap px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${crmTab === 'all' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}>Master DB</button>
                </div>

                <div className="flex gap-4 w-full xl:w-auto">
                    <button onClick={() => setShowHistory(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm">
                        <History size={16} /> Audit Trail
                    </button>
                    <button onClick={() => {
                        const headers = ["Name", "Phone", "Email", "Status", "Feedback", "Next FollowUp"];
                        const rows = registrations.map((r: any) => [`"${r.name}"`, `"${r.whatsapp}"`, `"${r.email}"`, `"${r.lead_status}"`, `"${r.last_feedback || ''}"`, `"${r.next_follow_up_date || ''}"`]);
                        const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                    }} className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg">
                        <Download size={16} /> Export CRM
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Search by name, phone, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:border-emerald-500 transition-all text-base font-bold shadow-sm" />
                </div>
                <div className="flex gap-4 text-white">
                    <button onClick={() => setShowSync(true)} className="flex items-center gap-3 px-8 py-5 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl"><SheetIcon size={20} /> Sheet Sync</button>
                    <button onClick={() => setShowPaste(true)} className="flex items-center gap-3 px-8 py-5 bg-emerald-600 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xl"><ClipboardPaste size={20} /> Bulk Paste</button>
                </div>
            </div>

            {loading ? (
                <div className="py-40 text-center"><RefreshCcw className="animate-spin h-12 w-12 text-emerald-500 mx-auto mb-6" /><p className="text-slate-500 font-black text-xs uppercase tracking-wider">Scanning Database...</p></div>
            ) : (
                <>
                    {/* Mobile Lead View */}
                    <div className="grid grid-cols-1 md:hidden gap-4">
                        {registrations.map((reg: any) => (
                            <div key={reg.id} className={cn("bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 relative overflow-hidden transition-all", selectedIds.has(reg.id) && "ring-2 ring-emerald-500 bg-emerald-50/20")}>
                                <div className="flex justify-between items-start">
                                    <div onClick={() => toggleSelect(reg.id)} className="shrink-0 p-1">
                                        {selectedIds.has(reg.id) ? <CheckSquare size={20} className="text-emerald-500" /> : <Square size={20} className="text-slate-300" />}
                                    </div>
                                    <div className="flex-1 px-3">
                                        <h4 className="text-base font-black text-slate-900 uppercase tracking-tight truncate">{reg.name}</h4>
                                        <p className="text-[11px] font-bold text-slate-500 tracking-wider mt-0.5">{reg.whatsapp}</p>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                                        reg.lead_status === 'hot' ? "bg-rose-50 text-rose-500" :
                                            reg.lead_status === 'warm' ? "bg-orange-50 text-orange-500" :
                                                "bg-blue-50 text-blue-500"
                                    )}>
                                        {reg.lead_status}
                                    </div>
                                </div>
                                {reg.last_feedback && (
                                    <p className="text-[11px] text-slate-600 font-medium italic bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">"{reg.last_feedback}"</p>
                                )}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{reg.next_follow_up_date || 'No Date'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedLead(reg)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition-all"><Calendar size={16} /></button>
                                        <button onClick={() => setSelectedLead(reg)} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm"><SheetIcon size={16} /></button>
                                        <button onClick={async () => { if (confirm('Delete?')) { await api.webinar.deleteRegistration(reg.id); fetchLeads(); } }} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Intel Table */}
                    <div className="hidden md:block bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-2xl relative z-10">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-6 w-10">
                                        <button onClick={toggleAll} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400">
                                            {registrations.length > 0 && selectedIds.size === registrations.length ? <CheckSquare size={22} className="text-emerald-500" /> : <Square size={22} />}
                                        </button>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">Identity Profile</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">WhatsApp</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">Traffic Source</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Priority</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">Ownership</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">Feedback Log</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">Next Call</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Utility</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {registrations.map((reg: any) => (
                                    <tr key={reg.id} className={cn("hover:bg-slate-50/80 group transition-all border-l-4 border-l-transparent", selectedIds.has(reg.id) ? "border-l-emerald-500 bg-emerald-50/10" : "hover:border-l-indigo-500")}>
                                        <td className="px-8 py-6">
                                            <button onClick={() => toggleSelect(reg.id)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400">
                                                {selectedIds.has(reg.id) ? <CheckSquare size={22} className="text-emerald-500" /> : <Square size={22} />}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{reg.name}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-600 tracking-wider">{reg.whatsapp}</span>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-wider">
                                            {reg.campaign_source || 'Organic'}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={cn(
                                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider inline-block",
                                                reg.lead_status === 'hot' ? "bg-rose-50 text-rose-500 border border-rose-100" :
                                                    reg.lead_status === 'warm' ? "bg-orange-50 text-orange-500 border border-orange-100" :
                                                        "bg-blue-50 text-blue-500 border border-blue-100"
                                            )}>
                                                {reg.lead_status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                                            {reg.assigned_to || 'Unassigned'}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-slate-600 italic">
                                                {reg.last_feedback || 'No remarks log...'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg w-fit border border-slate-200">
                                                <Calendar size={12} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{reg.next_follow_up_date || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                <button onClick={() => setSelectedLead(reg)} title="Quick Follow-up" className="p-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl text-indigo-400 transition-all shadow-sm"><Calendar size={16} /></button>
                                                <button onClick={() => setSelectedLead(reg)} className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-slate-400 transition-all shadow-sm"><SheetIcon size={16} /></button>
                                                <button onClick={async () => { if (confirm('Delete?')) { await api.webinar.deleteRegistration(reg.id); fetchLeads(); } }} className="p-3 bg-slate-50 hover:bg-rose-500 hover:text-white rounded-xl text-slate-400 transition-all shadow-sm"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <div className="flex items-center justify-between p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-6 py-4 bg-slate-100 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 transition-all shadow-sm">Previous</button>
                <div className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Intel Surface {page} of {totalPages || 1}</div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-6 py-4 bg-slate-100 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 transition-all shadow-sm">Next Page</button>
            </div>

            {selectedLead && <EditLeadModal lead={selectedLead} webinars={webinars} courses={courses} onClose={() => setSelectedLead(null)} onUpdate={fetchLeads} />}
            {showSync && <SyncModal onClose={() => setShowSync(false)} onUpdate={fetchLeads} />}
            {showPaste && <PasteImportModal onClose={() => setShowPaste(false)} onUpdate={fetchLeads} webinars={webinars} courses={courses} />}
            {showHistory && <ImportHistoryModal onClose={() => setShowHistory(false)} onUpdate={fetchLeads} />}

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-12 duration-700 backdrop-blur-2xl max-w-[90vw]">
                    <div className="flex items-center gap-4 pr-0 md:pr-8 border-r-0 md:border-r border-slate-700">
                        <div className="p-3 bg-emerald-500 rounded-xl shadow-lg"><CheckSquare size={18} /></div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-wider">{selectedIds.size} Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <select onChange={(e) => handleBulkAction('status', e.target.value)} className="bg-slate-800 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl outline-none border border-slate-700">
                            <option value="">Lifecycle stage...</option>
                            <option value="demo">Move to Demo</option>
                            <option value="follow_up">Move to Follow up</option>
                            <option value="warm">Move to Warm</option>
                            <option value="hot">Move to Hot</option>
                            <option value="dead">Archive</option>
                        </select>
                        <button onClick={() => handleBulkAction('delete')} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-500/20"><Trash2 size={18} /></button>
                        <button onClick={() => setSelectedIds(new Set())} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-all"><X size={18} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SyncModal({ onClose, onUpdate }: any) {
    const [sheetUrl, setSheetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.settings.get('googlesheets_link').then(val => { if (val?.url) setSheetUrl(val.url); });
    }, []);

    const performSync = async () => {
        if (!sheetUrl.includes('/pub?')) { setError('Please use a "Published as CSV" link.'); return; }
        setLoading(true);
        try {
            await api.settings.update('googlesheets_link', { url: sheetUrl });
            const response = await fetch(sheetUrl);
            const csvText = await response.text();
            const lines = csvText.split('\n');
            const leads = lines.slice(1).map(line => {
                const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length < 2) return null;
                return { name: cols[0] || cols[1], whatsapp: (cols[1] || cols[0]).toString(), lead_status: 'cold', created_at: new Date().toISOString() };
            }).filter(Boolean);

            if (leads.length > 0) {
                await api.webinar.syncBulk(leads, { source: 'Google Sheets', type: 'leads' });
                onUpdate();
                onClose();
            } else { setError('No valid leads found in sheet.'); }
        } catch (err) { setError('Sync failed.'); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative">
                <button onClick={onClose} className="absolute right-8 top-8 p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X size={24} /></button>
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[2rem] shadow-lg border border-emerald-100"><SheetIcon size={32} /></div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Sheet Engine</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Bulk Pipeline Sync</p>
                    </div>
                </div>
                <FormInput label="Published CSV Remote Link" value={sheetUrl} onChange={setSheetUrl} placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv" />
                {error && <p className="text-rose-500 text-[10px] mt-6 font-black bg-rose-50 p-4 rounded-xl border border-rose-100 uppercase tracking-wider">{error}</p>}
                <div className="flex flex-col gap-4 mt-10">
                    <button disabled={loading} onClick={performSync} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-2xl hover:bg-slate-800 transition-all">{loading ? 'Syncing...' : 'Sync Pipeline Data'}</button>
                </div>
            </div>
        </div>
    );
}

function PasteImportModal({ onClose, onUpdate, webinars = [] }: any) {
    const [pasteRaw, setPasteRaw] = useState('');
    const [preview, setPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [defaultSource, setDefaultSource] = useState('Data Vendor');
    const [targetWebinar, setTargetWebinar] = useState('');
    const [importMode, setImportMode] = useState<'lead' | 'student'>('lead');

    useEffect(() => {
        if (!pasteRaw.trim()) { setPreview([]); return; }
        const lines = pasteRaw.trim().split('\n');
        const parsed = lines.map(line => {
            const cols = line.split(/[\t,]/).map(p => p.trim());
            if (cols.length >= 2) {
                const phone = cols.find(c => c.replace(/\D/g, '').length >= 10);
                const name = cols.find(c => c !== phone && c.length > 2);
                return { name: name || 'Imported Lead', whatsapp: phone || cols[1] };
            }
            if (cols.length === 1 && cols[0].length >= 10) return { name: 'Direct Num', whatsapp: cols[0] };
            return null;
        }).filter(Boolean);
        setPreview(parsed);
    }, [pasteRaw]);

    const handleSync = async () => {
        setLoading(true);
        try {
            const leads = preview.map(p => ({
                ...p,
                lead_status: importMode === 'student' ? 'enrolled' : 'cold',
                campaign_source: defaultSource,
                webinar_id: targetWebinar || null,
                created_at: new Date().toISOString()
            }));
            await api.webinar.syncBulk(leads, { source: defaultSource, type: importMode, webinar_id: targetWebinar });
            onUpdate(); onClose();
        } catch (err) { alert('Import failed'); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-[3rem] p-10 md:p-12 shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden">
                <button onClick={onClose} className="absolute right-10 top-10 p-4 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all"><X size={32} /></button>
                <div className="flex items-center gap-6 mb-10">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[2rem] shadow-xl border border-emerald-100"><ClipboardPaste size={32} /></div>
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tight">Rapid Import</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Bulk Pipeline Injection</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <textarea value={pasteRaw} onChange={(e) => setPasteRaw(e.target.value)} placeholder="Paste rows from Sheet/Excel here..." className="w-full flex-1 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all resize-none shadow-inner leading-relaxed" />
                    </div>
                    <div className="lg:col-span-5 flex flex-col gap-8 overflow-hidden">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-6">
                            <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200">
                                <button onClick={() => setImportMode('lead')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", importMode === 'lead' ? "bg-slate-900 text-white shadow-xl" : "text-slate-500")}>Add Leads</button>
                                <button onClick={() => setImportMode('student')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", importMode === 'student' ? "bg-emerald-600 text-white shadow-xl" : "text-slate-500")}>Add Students</button>
                            </div>
                            <FormInput label="Traffic Source Identifier" value={defaultSource} onChange={setDefaultSource} />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Assign to Live Event</label>
                                <select value={targetWebinar} onChange={e => setTargetWebinar(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer shadow-sm">
                                    <option value="">No Active Event</option>
                                    {webinars.map((w: any) => <option key={w.id} value={w.id}>{w.title}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar bg-white border border-slate-200 p-6 rounded-[2rem] space-y-3 shadow-inner">
                            <h6 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Check ({preview.length})</h6>
                            {preview.slice(0, 50).map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-[11px] font-black text-slate-800 uppercase truncate pr-4">{p.name}</span>
                                    <span className="text-[10px] font-bold text-slate-500 tracking-wider ">{p.whatsapp}</span>
                                </div>
                            ))}
                        </div>
                        <button disabled={loading || !preview.length} onClick={handleSync} className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl hover:bg-emerald-700 transition-all">{loading ? 'Injecting...' : `Confirm ${preview.length} Records`}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditLeadModal({ lead, onClose, onUpdate }: any) {
    const [form, setForm] = useState({ ...lead });
    const deleteKeys = ['id', 'created_at', 'updated_at', 'import_id', 'webinars', 'courses'];

    const submit = async (e: any) => {
        e.preventDefault();
        try {
            const updates = { ...form };
            deleteKeys.forEach(k => delete (updates as any)[k]);
            await api.webinar.updateLead(lead.id, updates);
            onUpdate(); onClose();
        } catch (err) { alert('Update failed'); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 md:p-12 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative">
                <button onClick={onClose} className="absolute right-10 top-10 p-4 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all"><X size={28} /></button>
                <div className="flex items-center gap-6 mb-10">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[2rem] shadow-xl border border-indigo-100"><Users size={32} /></div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Record Intel</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Profile Optimization</p>
                    </div>
                </div>
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <FormInput label="Full Name" value={form.name} onChange={(v: any) => setForm({ ...form, name: v })} />
                    <FormInput label="WhatsApp Line" value={form.whatsapp} onChange={(v: any) => setForm({ ...form, whatsapp: v })} />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Lifecycle Status</label>
                        <select value={form.lead_status} onChange={e => setForm({ ...form, lead_status: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-wider outline-none cursor-pointer hover:bg-white transition-all">
                            <option value="cold">Phase: Cold</option>
                            <option value="warm">Phase: Warm</option>
                            <option value="hot">Phase: Hot</option>
                            <option value="demo">Phase: Demo</option>
                            <option value="enrolled">Status: Enrolled</option>
                            <option value="dead">Status: Junk</option>
                        </select>
                    </div>
                    <FormInput label="Next Follow Up" type="date" value={form.next_follow_up_date} onChange={(v: any) => setForm({ ...form, next_follow_up_date: v })} />

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">First Remark</label>
                        <textarea value={form.follow_up_notes} onChange={e => setForm({ ...form, follow_up_notes: e.target.value })} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl h-24 font-bold text-sm outline-none focus:bg-white transition-all shadow-inner leading-relaxed" placeholder="Initial context..." />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Recent Update</label>
                        <textarea value={form.last_feedback} onChange={e => setForm({ ...form, last_feedback: e.target.value })} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl h-24 font-bold text-sm outline-none focus:bg-white transition-all shadow-inner leading-relaxed" placeholder="Latest conversation..." />
                    </div>

                    <button type="submit" className="md:col-span-2 w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl active:scale-95 transition-all">Save Profile Updates</button>
                </form>
            </div>
        </div>
    );
}

function ImportHistoryModal({ onClose, onUpdate }: any) {
    const [imports, setImports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await api.admin.getImports();
            setImports(data || []);
        } catch (err) { } finally { setLoading(false); }
    };

    useEffect(() => { loadHistory(); }, []);

    const handleDelete = async (id: string) => {
        const delLeads = confirm('Delete leads too?');
        setLoading(true);
        try {
            await api.admin.deleteImport(id, !!delLeads);
            loadHistory(); onUpdate();
        } catch (err) { alert('Delete failed'); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/70 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 md:p-12 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
                <button onClick={onClose} className="absolute right-10 top-10 p-5 hover:bg-slate-100 rounded-2xl text-slate-400"><X size={28} /></button>
                <div className="mb-10 flex items-center gap-6">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[2rem] shadow-xl border border-indigo-100"><History size={32} /></div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Audit Operations</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Import History</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                    {loading ? <div className="py-20 text-center"><RefreshCcw className="animate-spin text-indigo-500 mx-auto w-10 h-10" /></div> : imports.map(imp => (
                        <div key={imp.id} className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md"><ArrowRightLeft size={20} /></div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-black text-slate-900 uppercase text-base">{imp.source}</h4>
                                        <span className="text-[9px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-black uppercase tracking-wider border border-indigo-100">{imp.import_type}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                        {new Date(imp.created_at).toLocaleString()} • {imp.record_count} Records
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(imp.id)} className="p-4 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={24} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
