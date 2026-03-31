import { useState, useEffect } from 'react';
import {
    Users, TrendingUp, CheckCircle2, IndianRupee, Target,
    PlusCircle, ClipboardPaste, UserPlus, Calendar as CalendarIcon, Zap,
    Clock, CheckCircle, Trash2, ClipboardList, Search, Phone, MessageCircle, Calendar, ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { StatCard } from './AdminShared';

const QUICK_FEEDBACK = [
    "Interested - Call Tomorrow",
    "Not Picking Up - Try Evening",
    "Asked for Demo Link",
    "Fee Discussion Pending",
    "Wrong Number",
    "Disconnected",
    "Busy - Call Back Later"
];

export const DashboardView = ({ setActiveTab, setCrmSubTab }: { setActiveTab: (tab: any) => void, setCrmSubTab: (tab: any) => void }) => {
    const [stats, setStats] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [pendingFollowUps, setPendingFollowUps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [taskTitle, setTaskTitle] = useState('');

    // Follow Up Card State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [engineTab, setEngineTab] = useState<'priority' | 'database'>('priority');
    const [coldLeads, setColdLeads] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, tasksData, followUpData, coldData] = await Promise.all([
                api.webinar.getDashboardStats(),
                api.tasks.getAll(),
                api.webinar.getRegistrationsPaginated({
                    type: 'follow_up',
                    limit: 10,
                    pending: true
                } as any),
                api.webinar.getRegistrationsPaginated({
                    type: 'all',
                    limit: 10
                } as any)
            ]);
            setStats(statsData);
            setTasks(tasksData || []);
            setPendingFollowUps(followUpData?.data || []);
            setColdLeads(coldData?.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }
        try {
            const result = await api.webinar.getRegistrationsPaginated({ query, limit: 10 });
            setSearchResults(result.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateLead = async () => {
        if (!selectedLead) return;
        setUpdating(true);
        try {
            await api.webinar.updateLead(selectedLead.id, {
                last_feedback: selectedLead.last_feedback,
                follow_up_notes: selectedLead.follow_up_notes,
                next_follow_up_date: selectedLead.next_follow_up_date
            });
            setSelectedLead(null);
            fetchData();
        } catch (err) {
            alert('Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;
        await api.tasks.create({
            title: taskTitle,
            status: 'pending',
            assigned_to: 'Ajay',
            priority: 'Medium'
        });
        setTaskTitle('');
        fetchData();
    };

    const toggleTask = async (task: any) => {
        const newStatus = task.status === 'pending' ? 'completed' : 'pending';
        await api.tasks.update(task.id, { status: newStatus });
        fetchData();
    };

    if (loading || !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-emerald-500 shadow-2xl"></div>
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={16} />
                </div>
                <p className="text-sm font-black text-slate-500 uppercase tracking-wider">Initializing Analytics Engine...</p>
            </div>
        );
    }

    const conversion = stats.total > 0 ? Math.round((stats.enrolled / stats.total) * 100) : 0;
    const pendingTasks = tasks.filter(t => t.status === 'pending');

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Command Center Quick Actions */}
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-[3rem] p-4 md:p-6 flex flex-wrap gap-4 items-center justify-between border border-slate-800/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="px-6 flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="text-white text-sm font-black uppercase tracking-wider whitespace-nowrap">Rapid Operations</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Execute Executive Commands</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                    <button onClick={() => setActiveTab('crm')} className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all border border-white/10 mx-auto lg:mx-0 backdrop-blur-md shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1">
                        <ClipboardPaste size={16} className="text-blue-200" /> Bulk Import
                    </button>
                    <button onClick={() => setActiveTab('fees')} className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all border border-white/10 mx-auto lg:mx-0 backdrop-blur-md shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1">
                        <UserPlus size={16} className="text-emerald-200" /> New Student
                    </button>
                    <button onClick={() => setActiveTab('batches')} className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all border border-white/10 mx-auto lg:mx-0 backdrop-blur-md shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1">
                        <PlusCircle size={16} className="text-orange-200" /> New Batch
                    </button>
                    <button onClick={() => setActiveTab('calendar')} className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all border border-white/10 mx-auto lg:mx-0 backdrop-blur-md shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1">
                        <CalendarIcon size={16} className="text-indigo-200" /> Timeline
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                <StatCard label="Total Leads" val={stats.total} icon={<Users className="text-blue-600" />} onClick={() => { setCrmSubTab('events'); setActiveTab('crm'); }} color="bg-white" />
                <StatCard label="Demo Phase" val={stats.demo} icon={<Target className="text-rose-600" />} onClick={() => { setCrmSubTab('demo'); setActiveTab('crm'); }} color="bg-white" />
                <StatCard label="Follow Up" val={stats.follow_ups} icon={<TrendingUp className="text-orange-600" />} onClick={() => { setCrmSubTab('follow_up'); setActiveTab('crm'); }} color="bg-white" />
                <StatCard label="Enrolled" val={stats.enrolled} icon={<CheckCircle2 className="text-emerald-600" />} onClick={() => setActiveTab('enrolled')} color="bg-white" />
                <StatCard label="Revenue" val={`₹${stats.revenue.toLocaleString()}`} icon={<IndianRupee className="text-purple-600" />} onClick={() => setActiveTab('fees')} color="bg-white" />
                <StatCard label="Enrollment Rate" val={`${conversion}%`} icon={<Zap className="text-indigo-600" />} onClick={() => setActiveTab('analytics')} color="bg-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tactical To-Do List */}
                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Daily Operations</h3>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-1">To-Do List</h4>
                        </div>
                        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl"><ClipboardList size={22} /></div>
                    </div>

                    <form onSubmit={handleAddTask} className="mb-8 flex gap-2">
                        <input
                            type="text"
                            placeholder="Add a priority objective..."
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                            className="flex-1 px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider outline-none focus:bg-white focus:border-slate-300 transition-all"
                        />
                        <button type="submit" className="p-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                            <PlusCircle size={24} />
                        </button>
                    </form>

                    <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-[400px]">
                        {pendingTasks.length > 0 ? pendingTasks.map((task: any) => (
                            <div key={task.id} className="flex items-center gap-4 p-6 bg-slate-50/50 border border-slate-100/50 rounded-2xl group hover:bg-white hover:border-emerald-500/20 transition-all">
                                <button onClick={() => toggleTask(task)} className="w-7 h-7 rounded-lg border-2 border-slate-200 flex items-center justify-center text-transparent hover:text-emerald-500 hover:border-emerald-500 transition-all">
                                    <CheckCircle size={16} />
                                </button>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{task.title}</p>
                                    <div className="flex gap-4 mt-1.5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{task.assigned_to}</span>
                                        {task.due_date && <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Due Soon</span>}
                                    </div>
                                </div>
                                <button onClick={async () => { await api.tasks.delete(task.id); fetchData(); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-20">
                                <ClipboardList size={48} className="mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-wider">No pending objectives</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Follow Up Card */}
                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-slate-900 flex flex-col relative overflow-hidden group min-h-[500px] border border-slate-100 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Engagement Engine</h3>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Lead Follow-Up</h4>
                        </div>
                        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl"><TrendingUp size={22} /></div>
                    </div>

                    <div className="relative mb-8 z-10">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find lead by name, phone..."
                            value={searchQuery}
                            onChange={e => handleSearch(e.target.value)}
                            className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-sm"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl z-[50]">
                                {searchResults.map(res => (
                                    <button
                                        key={res.id}
                                        onClick={() => { setSelectedLead(res); setSearchResults([]); setSearchQuery(''); }}
                                        className="w-full px-6 py-4 hover:bg-slate-50 text-left flex justify-between items-center border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                        <span className="text-xs font-black uppercase text-slate-800">{res.name}</span>
                                        <span className="text-[11px] text-slate-500 font-bold tracking-wider">{res.whatsapp}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedLead ? (
                        <div className="flex-1 flex flex-col gap-8 relative z-10 animate-in fade-in slide-in-from-right-4 overflow-y-auto no-scrollbar pb-6">
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h5 className="text-3xl font-black text-slate-900 leading-none">{selectedLead.name}</h5>
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mt-3">{selectedLead.whatsapp}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <a href={`tel:${selectedLead.whatsapp}`} className="p-4 bg-emerald-600 text-white rounded-xl hover:scale-110 transition-all shadow-lg"><Phone size={18} /></a>
                                        <a href={`https://wa.me/${selectedLead.whatsapp}`} target="_blank" className="p-4 bg-green-600 text-white rounded-xl hover:scale-110 transition-all shadow-lg"><MessageCircle size={18} /></a>
                                    </div>
                                </div>

                                {/* Quick Feedback Pills */}
                                <div className="flex flex-wrap gap-2.5 mb-6">
                                    {QUICK_FEEDBACK.map((fb, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedLead({ ...selectedLead, last_feedback: fb })}
                                            className="px-4 py-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-slate-600 hover:text-emerald-700 hover:border-emerald-200"
                                        >
                                            {fb}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">First Remark (Origins)</label>
                                        <textarea
                                            value={selectedLead.follow_up_notes || ''}
                                            onChange={e => setSelectedLead({ ...selectedLead, follow_up_notes: e.target.value })}
                                            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500/50 h-20 no-scrollbar resize-none leading-relaxed text-slate-800"
                                            placeholder="Initial notes when lead captured..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Recent Update (Pulse)</label>
                                        <textarea
                                            value={selectedLead.last_feedback || ''}
                                            onChange={e => setSelectedLead({ ...selectedLead, last_feedback: e.target.value })}
                                            className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold italic outline-none focus:border-emerald-500/50 h-28 no-scrollbar resize-none leading-relaxed text-slate-800"
                                            placeholder="Update conversation notes..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Next Follow Up</label>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="date"
                                                    value={selectedLead.next_follow_up_date || ''}
                                                    onChange={e => setSelectedLead({ ...selectedLead, next_follow_up_date: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase outline-none focus:border-emerald-500/50 font-mono tracking-wider text-slate-800"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUpdateLead}
                                            disabled={updating}
                                            className="h-full py-3.5 flex items-center justify-center gap-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl transition-all shadow-xl active:scale-95"
                                        >
                                            <CheckCircle2 size={18} />
                                            <span className="text-xs font-black uppercase tracking-wider">Update & Close</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="mt-auto text-xs font-black text-slate-400 uppercase tracking-[0.4em] hover:text-slate-900 transition-all text-center py-4">Clear Active Selection</button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-6 relative z-10 overflow-hidden">
                            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                                <button
                                    onClick={() => setEngineTab('priority')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                        engineTab === 'priority' ? "bg-slate-900 text-white shadow-xl" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <Target size={14} /> Priority List
                                </button>
                                <button
                                    onClick={() => setEngineTab('database')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                        engineTab === 'database' ? "bg-slate-900 text-white shadow-xl" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <Search size={14} /> Database Scan
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                        {engineTab === 'priority' ? 'Upcoming Engagement Lineup' : 'Unprocessed Cold Prospects'}
                                    </h5>
                                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-wider">
                                        {engineTab === 'priority' ? pendingFollowUps.length : coldLeads.length} Targets
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {(engineTab === 'priority' ? pendingFollowUps : coldLeads).length > 0 ? (engineTab === 'priority' ? pendingFollowUps : coldLeads).map(lead => (
                                        <div
                                            key={lead.id}
                                            className="relative group bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-emerald-500/30 transition-all text-left shadow-sm hover:shadow-xl hover:-translate-y-1 duration-500"
                                        >
                                            <div className="p-6 pb-4" onClick={() => setSelectedLead(lead)}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="max-w-[70%]">
                                                        <span className="text-lg font-black tracking-tight text-slate-900 uppercase block truncate group-hover:text-emerald-700 transition-colors">{lead.name}</span>
                                                        <span className="text-[11px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider block font-body">{lead.whatsapp}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 w-fit mt-3">
                                                    <Calendar size={12} className="text-emerald-500" />
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">{lead.next_follow_up_date || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Action Icons */}
                                            <div
                                                className="absolute top-4 right-4 flex gap-1.5 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all duration-300 z-20"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <a href={`tel:${lead.whatsapp}`} className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                                    <Phone size={14} />
                                                </a>
                                                <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" className="p-2.5 bg-green-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                                    <MessageCircle size={14} />
                                                </a>
                                            </div>

                                            <button
                                                onClick={() => setSelectedLead(lead)}
                                                className="w-full p-4 pt-0 text-left"
                                            >
                                                {lead.last_feedback && (
                                                    <p className="text-[11px] text-slate-600 font-medium italic border-l-2 border-emerald-500/40 pl-3 py-2 bg-slate-100/50 rounded-r-xl line-clamp-1 leading-relaxed mb-2 group-hover:bg-white transition-all">
                                                        "{lead.last_feedback}"
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-end gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 transition-all">
                                                    <span>Open Record</span>
                                                    <ArrowRight size={12} />
                                                </div>
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center opacity-20">
                                            <CheckCircle2 size={56} className="mx-auto mb-6 text-slate-300" />
                                            <p className="text-sm font-black uppercase tracking-wider text-slate-400">No Priority Targets</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-100 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Search lead to initiate tracking</p>
                            </div>
                        </div>
                    )}

                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

