import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, X, CheckCircle2, PhoneCall, Trash2, CalendarDays, Edit3, Save, RefreshCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', notes: '', date: '' });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await api.webinar.getCalendarEvents();
            setEvents(data || []);
        } catch (err) {
            console.error('Calendar Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'reschedule' | 'complete' | 'remark' | 'delete' | 'update', payload: any = {}) => {
        if (!selectedEvent) return;
        setActionLoading(true);
        try {
            const { type, raw } = selectedEvent;

            if (type === 'task') {
                if (action === 'complete') await api.tasks.update(raw.id, { status: 'completed' });
                if (action === 'delete') await api.tasks.delete(raw.id);
                if (action === 'reschedule') await api.tasks.update(raw.id, { due_date: payload.date });
                if (action === 'update') await api.tasks.update(raw.id, { title: payload.title, notes: payload.notes, due_date: payload.date });
            } else if (type === 'followup') {
                if (action === 'complete') await api.webinar.updateLead(raw.id, { lead_status: 'converted', next_follow_up_date: null });
                if (action === 'remark') await api.webinar.updateLead(raw.id, { last_feedback: payload.feedback });
                if (action === 'reschedule') await api.webinar.updateLead(raw.id, { next_follow_up_date: payload.date });
                if (action === 'update') await api.webinar.updateLead(raw.id, { name: payload.title, last_feedback: payload.notes, next_follow_up_date: payload.date });
            }

            await fetchEvents();
            setSelectedEvent(null);
            setIsEditing(false);
        } catch (err) {
            alert('Operation failed');
        } finally {
            setActionLoading(false);
        }
    };

    const startEditing = () => {
        setEditForm({
            title: selectedEvent.title,
            notes: selectedEvent.type === 'task' ? (selectedEvent.raw.notes || '') : (selectedEvent.raw.last_feedback || ''),
            date: selectedEvent.date
        });
        setIsEditing(true);
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 md:h-40 bg-slate-50/30 border border-slate-100/50" />);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <div key={day} className={cn(
                    "h-32 md:h-40 p-2 md:p-3 border border-slate-100 flex flex-col gap-1 transition-all hover:bg-slate-50 relative group cursor-pointer",
                    isToday ? "bg-emerald-50/40" : "bg-white"
                )}>
                    <span className={cn(
                        "text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1",
                        isToday ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "text-slate-400"
                    )}>{day}</span>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                        {dayEvents.map((e, idx) => (
                            <button
                                key={idx}
                                onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); setIsEditing(false); }}
                                className={cn(
                                    "w-full text-left px-2 py-1.5 rounded text-[9px] font-bold text-white truncate shadow-sm transition-all hover:brightness-110 active:scale-95",
                                    e.color || 'bg-slate-500'
                                )}
                            >
                                {e.title}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
                <div>
                    <h2 className="text-3xl font-black font-heading text-slate-900 uppercase tracking-tight">Timeline Engine</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Live Operational Synchronization</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <button onClick={prevMonth} className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-emerald-600"><ChevronLeft size={18} /></button>
                    <div className="px-6 py-2 bg-slate-50 rounded-xl">
                        <h3 className="text-xs font-black text-slate-800 text-center uppercase tracking-wider min-w-[140px]">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    </div>
                    <button onClick={nextMonth} className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-emerald-600"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden relative">
                <div className="grid grid-cols-7 bg-slate-900 border-b border-slate-800">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <div key={day} className="py-4 text-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-400/80">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 border-l border-t border-slate-100 bg-slate-50/20">
                    {loading ? (
                        <div className="col-span-7 h-[600px] flex flex-col items-center justify-center space-y-4">
                            <RefreshCcw className="animate-spin text-emerald-500" size={32} />
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Optimizing Viewports...</p>
                        </div>
                    ) : renderCalendar()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Strategic Events', desc: 'Webinars & Campus Seminars', icon: <CheckCircle2 size={22} />, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Follow Up Leads', desc: 'Active lead conversations', icon: <PhoneCall size={22} />, color: 'bg-orange-500', bg: 'bg-orange-50' },
                    { label: 'Tactical Tasks', desc: 'Internal administrative milestones', icon: <CheckCircle2 size={22} />, color: 'bg-indigo-500', bg: 'bg-indigo-50' }
                ].map((item, i) => (
                    <div key={i} className={cn("p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 transition-all hover:scale-[1.02]", item.bg)}>
                        <div className={cn("w-14 h-14 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-current/20", item.color)}>{item.icon}</div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{item.label}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1 opacity-70">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-slate-100 text-left">
                        <div className={cn("absolute top-0 left-0 w-full h-2", selectedEvent.color)} />

                        <div className="flex justify-between items-start mb-8">
                            <div className="space-y-2">
                                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-md", selectedEvent.color)}>
                                    {selectedEvent.type} Management
                                </span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full text-2xl font-black text-slate-900 border-b-2 border-emerald-500 outline-none bg-transparent"
                                    />
                                ) : (
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedEvent.title}</h3>
                                )}
                                <div className="flex items-center gap-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Clock size={12} /> {selectedEvent.date}
                                    </p>
                                    {!isEditing && selectedEvent.type !== 'event' && (
                                        <button onClick={startEditing} className="p-2 hover:bg-slate-50 rounded-lg text-emerald-600 transition-all flex items-center gap-1.5">
                                            <Edit3 size={14} /> <span className="text-[9px] font-black uppercase">Edit</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X size={20} /></button>
                        </div>

                        {isEditing ? (
                            <div className="space-y-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">Notes / Feedback</label>
                                    <textarea
                                        value={editForm.notes}
                                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold italic outline-none h-32 no-scrollbar"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">Adjust Date</label>
                                    <input
                                        type="date"
                                        value={editForm.date}
                                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => handleAction('update', editForm)}
                                    disabled={actionLoading}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-wider shadow-xl flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        ) : (
                            <>
                                {selectedEvent.type === 'followup' && (
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Client Intelligence</p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                            "{selectedEvent.raw.last_feedback || 'No previous call logs recorded. Use the action panel below to update status.'}"
                                        </p>
                                    </div>
                                )}
                                {selectedEvent.type === 'task' && selectedEvent.raw.notes && (
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Task Specifications</p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                            {selectedEvent.raw.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {selectedEvent.type !== 'event' && (
                                        <>
                                            <button
                                                onClick={() => handleAction('complete')}
                                                disabled={actionLoading}
                                                className="flex flex-col items-center justify-center gap-3 p-6 bg-emerald-50 text-emerald-700 rounded-[2rem] border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all group"
                                            >
                                                <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Mark Done</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newDate = prompt('Enter new date (YYYY-MM-DD):', selectedEvent.date);
                                                    if (newDate) handleAction('reschedule', { date: newDate });
                                                }}
                                                disabled={actionLoading}
                                                className="flex flex-col items-center justify-center gap-3 p-6 bg-indigo-50 text-indigo-700 rounded-[2rem] border border-indigo-100 hover:bg-indigo-500 hover:text-white transition-all group"
                                            >
                                                <CalendarDays size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Reschedule</span>
                                            </button>
                                        </>
                                    )}

                                    {selectedEvent.type === 'followup' && (
                                        <button
                                            onClick={() => {
                                                const feed = prompt('Enter call feedback:', selectedEvent.raw.last_feedback || '');
                                                if (feed) handleAction('remark', { feedback: feed });
                                            }}
                                            disabled={actionLoading}
                                            className="col-span-2 flex items-center justify-center gap-3 p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl"
                                        >
                                            <PhoneCall size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Update Call Log / Remark</span>
                                        </button>
                                    )}

                                    {selectedEvent.type === 'task' && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this task?')) handleAction('delete');
                                            }}
                                            disabled={actionLoading}
                                            className="col-span-2 flex items-center justify-center gap-3 p-6 bg-rose-50 text-rose-600 rounded-[2rem] border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"
                                        >
                                            <Trash2 size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Archive Task</span>
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
