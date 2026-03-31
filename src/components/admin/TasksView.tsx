import { useState } from 'react';
import { Clock, Users, Trash2, CheckCircle, ClipboardList } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export function TasksView({ tasks, onUpdate }: any) {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [assignee, setAssignee] = useState<'Ajay' | 'Gaurav'>('Ajay');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('Follow-up');

    const addTask = async (e: any) => {
        e.preventDefault();
        if (!title) return;
        await api.tasks.create({
            title,
            notes,
            assigned_to: assignee,
            status: 'pending',
            priority,
            due_date: dueDate || null,
            category
        });
        setTitle('');
        setNotes('');
        setDueDate('');
        onUpdate();
    };

    const updateStatus = async (task: any, newStatus: string) => {
        await api.tasks.update(task.id, { status: newStatus });
        onUpdate();
    };

    const deleteCompleted = async () => {
        if (!window.confirm('Delete all completed tasks?')) return;
        const completed = tasks.filter((t: any) => t.status === 'completed');
        for (const t of completed) {
            await api.tasks.delete(t.id);
        }
        onUpdate();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Creation Sidebar */}
            <div className="w-full lg:w-80 shrink-0">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ClipboardList size={18} /></div>
                        <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">Add Task</h3>
                    </div>

                    <form onSubmit={addTask} className="space-y-4 text-left">
                        <input
                            type="text" placeholder="Task title..."
                            value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl text-sm font-bold outline-none transition-all"
                        />

                        <textarea
                            placeholder="Add notes or details..."
                            value={notes} onChange={e => setNotes(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent focus:border-emerald-500/20 rounded-2xl text-xs font-semibold outline-none transition-all h-24 no-scrollbar"
                        />

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Type</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none cursor-pointer">
                                <option value="Follow-up">Follow-up</option>
                                <option value="Webinar Prep">Webinar Prep</option>
                                <option value="Fee Collection">Fee Collection</option>
                                <option value="Content">Content Creation</option>
                                <option value="General">General Admin</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assignee</label>
                                <select value={assignee} onChange={(e: any) => setAssignee(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-[10px] font-bold outline-none">
                                    <option value="Ajay">Ajay</option>
                                    <option value="Gaurav">Gaurav</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Priority</label>
                                <select value={priority} onChange={(e: any) => setPriority(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-[10px] font-bold outline-none">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Deadline</label>
                            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-xl text-[10px] font-bold outline-none" />
                        </div>

                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">Create Task</button>
                    </form>
                </div>
            </div>

            {/* Task Lists */}
            <div className="flex-1 space-y-8">
                {/* Active Tasks */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-heading flex items-center gap-3">
                            Active Queue
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] uppercase font-bold tracking-wider">{tasks.filter((t: any) => t.status === 'pending').length}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {tasks.filter((t: any) => t.status === 'pending').length > 0 ? tasks.filter((t: any) => t.status === 'pending').map((task: any) => (
                            <div key={task.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex items-start gap-4">
                                <button onClick={() => updateStatus(task, 'completed')} className="mt-1 shrink-0 w-6 h-6 rounded-lg border-2 border-slate-200 hover:border-emerald-500 transition-all flex items-center justify-center text-transparent hover:text-emerald-500">
                                    <CheckCircle size={14} />
                                </button>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[7px] font-bold uppercase tracking-wider">{task.category || 'General'}</span>
                                                <span className={cn("px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider", task.priority === 'High' ? "bg-rose-50 text-rose-500" : task.priority === 'Medium' ? "bg-orange-50 text-orange-500" : "bg-slate-50 text-slate-400")}>{task.priority}</span>
                                            </div>
                                            <h4 className="text-base font-bold text-slate-900">{task.title}</h4>
                                        </div>
                                    </div>
                                    {task.notes && <p className="mt-2 text-xs text-slate-400 font-medium leading-relaxed">{task.notes}</p>}
                                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5"><Users size={12} className="text-slate-300" /> {task.assigned_to}</div>
                                        {task.due_date && (
                                            <div className={cn(
                                                "flex items-center gap-1.5",
                                                new Date(task.due_date) < new Date() ? "text-rose-500" : ""
                                            )}>
                                                <Clock size={12} /> {new Date(task.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={async () => { if (window.confirm('Delete task?')) { await api.tasks.delete(task.id); onUpdate(); } }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No pending tasks</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Tasks */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold font-heading text-slate-400 uppercase tracking-wider">Completed</h2>
                        {tasks.filter((t: any) => t.status === 'completed').length > 0 && (
                            <button onClick={deleteCompleted} className="text-[9px] font-bold text-rose-400 uppercase tracking-wider hover:text-rose-600">Clear All</button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 opacity-60">
                        {tasks.filter((t: any) => t.status === 'completed').map((task: any) => (
                            <div key={task.id} className="bg-slate-50 p-4 rounded-2xl border border-transparent flex items-center gap-4">
                                <button onClick={() => updateStatus(task, 'pending')} className="shrink-0 w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                    <CheckCircle size={14} />
                                </button>
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-slate-500 line-through">{task.title}</h4>
                                </div>
                                <button onClick={async () => { await api.tasks.delete(task.id); onUpdate(); }} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
