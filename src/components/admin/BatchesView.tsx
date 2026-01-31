import { useState } from 'react';
import { Plus, Users, X } from 'lucide-react';
import { api } from '../../lib/api';
import { FormInput } from './AdminShared';

export function BatchesView({ batches, courses, onUpdate }: any) {
    const [showAdd, setShowAdd] = useState(false);
    const [newBatch, setNewBatch] = useState({ name: '', course_id: courses[0]?.id || '', start_date: '', mentor_id: '', status: 'upcoming' });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        await api.batches.create(newBatch);
        setNewBatch({ name: '', course_id: courses[0]?.id || '', start_date: '', mentor_id: '', status: 'upcoming' });
        setShowAdd(false);
        onUpdate();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading">Active Batches</h2>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all">
                    <Plus size={16} /> New Batch
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch: any) => (
                    <div key={batch.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{batch.name}</h3>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{batch.courses?.name}</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold uppercase tracking-tighter">Starts</span>
                                <span className="font-bold">{batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'TBD'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold uppercase tracking-tighter">Mentor</span>
                                <span className="font-bold">Ajay</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2 rounded-full mt-4 overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[65%]" />
                            </div>
                        </div>
                        <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">Manage Batch</button>
                    </div>
                ))}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold font-heading">Plan New Cohort</h3>
                            <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4 text-left">
                            <FormInput label="Batch Name" value={newBatch.name} onChange={(v: string) => setNewBatch({ ...newBatch, name: v })} />
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Parent Course</label>
                                <select value={newBatch.course_id} onChange={(e) => setNewBatch({ ...newBatch, course_id: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none cursor-pointer">
                                    {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Start Date" type="date" value={newBatch.start_date} onChange={(v: string) => setNewBatch({ ...newBatch, start_date: v })} />
                                <FormInput label="Mentor Name" value={newBatch.mentor_id} onChange={(v: string) => setNewBatch({ ...newBatch, mentor_id: v })} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg mt-4">Launch Batch</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
