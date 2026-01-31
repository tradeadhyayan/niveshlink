import { useState } from 'react';
import { Plus, Zap, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { FormInput } from './AdminShared';

export function CoursesView({ courses, onUpdate }: any) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [newCourse, setNewCourse] = useState({ name: '', price: '', duration: '', description: '', curriculum: '', other_details: '' });

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            await api.courses.create({ ...newCourse, price: Number(newCourse.price) });
            setNewCourse({ name: '', price: '', duration: '', description: '', curriculum: '', other_details: '' });
            setShowAdd(false);
            onUpdate();
        } catch (err) { alert('Failed to add course'); }
    };

    const handleUpdate = async (e: any) => {
        e.preventDefault();
        try {
            await api.courses.update(editingCourse.id, { ...editingCourse, price: Number(editingCourse.price) });
            setEditingCourse(null);
            onUpdate();
        } catch (err) { alert('Failed to update course'); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.courses.delete(id);
            onUpdate();
        } catch (err) { alert('Failed to delete course'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold font-heading">Course Directory</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage curriculum and pricing</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all">
                    <Plus size={16} /> New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                    <div key={course.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <Zap size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingCourse(course)} className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><Plus className="rotate-45" size={16} /></button>
                                    <button onClick={() => handleDelete(course.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{course.name}</h3>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-4 inline-block bg-emerald-50 px-2 py-0.5 rounded-lg">{course.duration || 'Flexible'}</p>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-6 leading-relaxed">{course.description || 'Professional coaching module.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Tuition Fee</p>
                                <span className="text-xl font-bold text-slate-900">₹{course.price.toLocaleString()}</span>
                            </div>
                            <button onClick={() => setEditingCourse(course)} className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all">Edit</button>
                        </div>
                    </div>
                ))}
            </div>

            {(showAdd || editingCourse) && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold font-heading">{editingCourse ? 'Update Course' : 'Launch New Course'}</h3>
                            <button onClick={() => { setShowAdd(false); setEditingCourse(null); }} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={editingCourse ? handleUpdate : handleAdd} className="space-y-5 text-left">
                            <FormInput
                                label="Course Name"
                                value={editingCourse ? editingCourse.name : newCourse.name}
                                onChange={(v: string) => editingCourse ? setEditingCourse({ ...editingCourse, name: v }) : setNewCourse({ ...newCourse, name: v })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    label="Price (₹)"
                                    type="number"
                                    value={editingCourse ? editingCourse.price : newCourse.price}
                                    onChange={(v: string) => editingCourse ? setEditingCourse({ ...editingCourse, price: v }) : setNewCourse({ ...newCourse, price: v })}
                                />
                                <FormInput
                                    label="Duration"
                                    value={editingCourse ? editingCourse.duration : newCourse.duration}
                                    onChange={(v: string) => editingCourse ? setEditingCourse({ ...editingCourse, duration: v }) : setNewCourse({ ...newCourse, duration: v })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                                <textarea
                                    value={editingCourse ? editingCourse.description : newCourse.description}
                                    onChange={e => editingCourse ? setEditingCourse({ ...editingCourse, description: e.target.value }) : setNewCourse({ ...newCourse, description: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none h-20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Course Curriculum</label>
                                <textarea
                                    value={editingCourse ? editingCourse.curriculum : newCourse.curriculum}
                                    onChange={e => editingCourse ? setEditingCourse({ ...editingCourse, curriculum: e.target.value }) : setNewCourse({ ...newCourse, curriculum: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none h-32"
                                    placeholder="List modules, topics etc..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Other Details</label>
                                <textarea
                                    value={editingCourse ? editingCourse.other_details : newCourse.other_details}
                                    onChange={e => editingCourse ? setEditingCourse({ ...editingCourse, other_details: e.target.value }) : setNewCourse({ ...newCourse, other_details: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold outline-none h-20"
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-[10px] uppercase mt-6">{editingCourse ? 'Save Changes' : 'Create Course'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
