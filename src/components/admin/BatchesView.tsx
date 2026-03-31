import { useState, useEffect } from 'react';
import { Plus, Users, X, Calendar, UserPlus, CheckCircle2, Trash2, Search, Briefcase } from 'lucide-react';
import { api, supabase } from '../../lib/api';
import { FormInput } from './AdminShared';

export function BatchesView({ batches, courses, onUpdate }: any) {
    const [showAdd, setShowAdd] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [newBatch, setNewBatch] = useState({ name: '', course_id: courses[0]?.id || '', start_date: '', mentor_name: '', status: 'upcoming' });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await api.batches.create(newBatch);
            setNewBatch({ name: '', course_id: courses[0]?.id || '', start_date: '', mentor_name: '', status: 'upcoming' });
            setShowAdd(false);
            onUpdate();
        } catch (err) { alert('Failed to create batch'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black font-heading text-slate-900 uppercase">Academic Batches</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Manage Course Cohorts & Enrollments</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-emerald-500/20"
                >
                    <Plus size={16} /> Create Cohort
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.length > 0 ? batches.map((batch: any) => (
                    <BatchCard key={batch.id} batch={batch} onClick={() => setSelectedBatch(batch)} onUpdate={onUpdate} />
                )) : (
                    <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <Briefcase size={40} className="mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-wider text-[10px]">No active cohorts found</p>
                    </div>
                )}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
                        <button onClick={() => setShowAdd(false)} className="absolute right-8 top-8 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400"><X size={20} /></button>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg"><UserPlus size={24} /></div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Batch</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan your next coaching cycle</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <FormInput label="Batch Name (e.g. Feb Platinum 2024)" value={newBatch.name} onChange={(v: string) => setNewBatch({ ...newBatch, name: v })} />

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1">Parent Course</label>
                                <select
                                    value={newBatch.course_id}
                                    onChange={(e) => setNewBatch({ ...newBatch, course_id: e.target.value })}
                                    className="w-full px-6 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none cursor-pointer focus:bg-white focus:border-emerald-500/20 transition-all transition-all shadow-inner"
                                >
                                    {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Launch Date" type="date" value={newBatch.start_date} onChange={(v: string) => setNewBatch({ ...newBatch, start_date: v })} />
                                <FormInput label="Mentor Name" value={newBatch.mentor_name} onChange={(v: string) => setNewBatch({ ...newBatch, mentor_name: v })} />
                            </div>

                            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-wider text-[11px] shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 transition-all mt-6">Initialize Batch</button>
                        </form>
                    </div>
                </div>
            )}

            {selectedBatch && (
                <BatchManagementModal batch={selectedBatch} onClose={() => setSelectedBatch(null)} onUpdate={onUpdate} />
            )}
        </div>
    );
}

function BatchCard({ batch, onClick, onUpdate }: any) {
    const [stats, setStats] = useState({ count: 0 });

    useEffect(() => {
        supabase.from('webinar_registrations').select('*', { count: 'exact', head: true }).eq('batch_id', batch.id)
            .then(res => setStats({ count: res.count || 0 }));
    }, [batch.id]);

    const handleDelete = async (e: any) => {
        e.stopPropagation();
        if (confirm('Delete this batch? Students will be unassigned.')) {
            await api.batches.delete(batch.id);
            onUpdate();
        }
    }

    return (
        <div onClick={onClick} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                <Users size={60} />
            </div>

            <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                    <Users size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase leading-tight">{batch.name}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mt-0.5">{batch.courses?.name || 'No Course'}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Strength</p>
                    <p className="text-lg font-black text-slate-800">{stats.count} Members</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mentor</p>
                    <p className="text-lg font-black text-slate-800">{batch.mentor_name || 'Ajay'}</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <Calendar size={14} className="text-emerald-500" />
                    {batch.start_date ? new Date(batch.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                </div>
                <button onClick={handleDelete} className="p-3 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16} /></button>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
    );
}

function BatchManagementModal({ batch, onClose, onUpdate }: any) {
    const [students, setStudents] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        const { data: current } = await supabase.from('webinar_registrations').select('*').eq('batch_id', batch.id);
        const { data: potential } = await supabase.from('webinar_registrations').select('*').eq('lead_status', 'enrolled').is('batch_id', null);

        setStudents(current || []);
        setAllStudents(potential || []);
    };

    useEffect(() => {
        fetchData();
    }, [batch.id]);

    const addStudent = async (id: string) => {
        await api.webinar.updateLead(id, { batch_id: batch.id });
        fetchData();
        onUpdate();
    };

    const removeStudent = async (id: string) => {
        await api.webinar.updateLead(id, { batch_id: null });
        fetchData();
        onUpdate();
    };

    const filteredPotential = allStudents.filter(s =>
        (s.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (s.whatsapp || '').includes(search)
    );

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] p-8 md:p-12 shadow-2xl flex flex-col relative overflow-hidden border border-slate-100">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                <button onClick={onClose} className="absolute right-10 top-10 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400"><X size={24} /></button>

                <div className="flex items-center gap-5 mb-10">
                    <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[2rem]"><Users size={32} /></div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{batch.name} Registry</h3>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mt-1">Manage Class Roster & Cohort Strength</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 overflow-hidden">
                    {/* Active Roster */}
                    <div className="flex flex-col gap-6 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-emerald-500" />
                                Active Batch Roster ({students.length})
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
                            {students.length > 0 ? students.map(s => (
                                <div key={s.id} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:bg-white transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">{s.name?.[0]}</div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm uppercase">{s.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{s.whatsapp}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeStudent(s.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 italic py-20">
                                    <Users size={48} className="mb-4" />
                                    <p className="text-xs uppercase font-black tracking-wider">No students assigned yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Available Pool */}
                    <div className="flex flex-col gap-6 overflow-hidden">
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <UserPlus size={18} className="text-indigo-500" />
                                Assign Unallocated Enrolled Students
                            </h4>
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search registry by name/phone..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:border-indigo-500/20 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
                            {filteredPotential.map(s => (
                                <div key={s.id} className="p-5 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/50 flex items-center justify-between hover:bg-white transition-all group">
                                    <div>
                                        <p className="font-black text-slate-900 text-sm uppercase">{s.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{s.whatsapp}</p>
                                    </div>
                                    <button
                                        onClick={() => addStudent(s.id)}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                    >
                                        Assign to Cohort
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
