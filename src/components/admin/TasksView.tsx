import { useState } from 'react';
import { Clock, Users, Trash2, CheckCircle, ClipboardList } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export function TasksView({ tasks, onUpdate }: any) {
    const [title, setTitle] = useState('');
    const [assignee, setAssignee] = useState<'Ajay' | 'Gaurav'>('Ajay');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('Follow-up');

    const addTask = async (e: any) => {
        e.preventDefault();
        if (!title) return;
        await api.tasks.create({
            title,
            assigned_to: assignee,
            status: 'pending',
            priority,
            due_date: dueDate || null,
            category
        });
        setTitle('');
        setDueDate('');
        onUpdate();
    };

    const toggleTask = async (task: any) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        await api.tasks.update(task.id, { status: newStatus });
        onUpdate();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
                    <h3 className="text-sm font-bold font-heading text-slate-400 uppercase tracking-widest mb-6">New Task</h3>
                    <form onSubmit={addTask} className="space-y-4 text-left">
                        <input
                            type="text" placeholder="What needs to be done?"
                            value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl text-sm font-bold outline-none transition-all"
                        />
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none cursor-pointer">
                                <option value="Follow-up">Follow-up</option>
                                <option value="Webinar Prep">Webinar Prep</option>
                                <option value="Fee Collection">Fee Collection</option>
                                <option value="General">General Admin</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assignee</label>
                                <div className="flex gap-1">
                                    <button type="button" onClick={() => setAssignee('Ajay')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${assignee === 'Ajay' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>Ajay</button>
                                    <button type="button" onClick={() => setAssignee('Gaurav')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${assignee === 'Gaurav' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>Gaurav</button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                <select value={priority} onChange={(e: any) => setPriority(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none" />
                        </div>
                        <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">Create Task</button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl font-bold font-heading">Tasks Queue</h1>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{tasks.filter((t: any) => t.status === 'pending').length} Pending</span>
                    </div>
                </div>
                {tasks.length > 0 ? tasks.map((task: any) => (
                    <div key={task.id} className={cn(
                        "group bg-white p-5 rounded-[2rem] border transition-all flex items-start gap-4",
                        task.status === 'completed' ? "opacity-60 grayscale border-slate-100" : "border-slate-200 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
                    )}>
                        <button onClick={() => toggleTask(task)} className={cn("mt-1 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", task.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 hover:border-emerald-500")}>
                            {task.status === 'completed' && <CheckCircle size={14} />}
                        </button>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[8px] font-bold uppercase tracking-widest mb-1 inline-block">{task.category || 'General'}</span>
                                    <h4 className={cn("text-base font-bold text-slate-800", task.status === 'completed' && "line-through")}>{task.title}</h4>
                                </div>
                                <span className={cn("px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest", task.priority === 'High' ? "bg-rose-50 text-rose-500" : task.priority === 'Medium' ? "bg-orange-50 text-orange-500" : "bg-slate-50 text-slate-400")}>
                                    {task.priority}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><Users size={12} /> {task.assigned_to}</div>
                                {task.due_date && <div className="flex items-center gap-1.5"><Clock size={12} /> {new Date(task.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>}
                            </div>
                        </div>
                        <button onClick={async () => { if (window.confirm('Delete task?')) { await api.tasks.delete(task.id); onUpdate(); } }} className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <ClipboardList size={48} className="text-slate-100 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-400">All caught up!</h3>
                        <p className="text-xs text-slate-300">New tasks will appear here once created.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
