import React, { useState } from 'react';
import {
    Calendar, Clock, Video, CheckCircle2,
    ArrowRight, Sparkles, Zap,
    Users, ShieldCheck,
    PlayCircle, BarChart3,
    Target, History, PieChart, Database,
    ChevronDown, TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useCashfree } from '../hooks/useCashfree';

export default function WebinarLanding() {
    const [registered, setRegistered] = useState(false);
    const [formData, setFormData] = useState({ name: '', whatsapp: '', email: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const { openMockCheckout } = useCashfree();

    // Configuration
    const BRAND_NAME = "Nivesh Link";
    const WEBINAR_TITLE = "Smart Trading Blueprint";
    const WEBINAR_PRICE = 499;
    const WEBINAR_DATE = "Sunday, April 6";
    const WEBINAR_TIME = "11:00 AM IST";
    const WEBINAR_DURATION = "90 Mins";
    const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/Fr5ieLzdLICI85SLwVCKQI";

    const handleRegister = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!formData.name || !formData.whatsapp) {
            document.getElementById('booking-card')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        setIsProcessing(true);

        try {
            await openMockCheckout(WEBINAR_TITLE, WEBINAR_PRICE, async () => {
                try {
                    await api.webinar.register({
                        name: formData.name,
                        whatsapp: formData.whatsapp,
                        email: formData.email,
                        webinar_date: WEBINAR_DATE,
                        status: 'PAID'
                    });
                    setRegistered(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch (err) {
                    console.error('Registration failed:', err);
                    alert('Payment successful, but we couldn\'t save your details. Please contact support.');
                }
            });
        } catch (err) {
            console.error('Payment failed:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const faqs = [
        { q: "Will I get the recording?", a: "Yes, all registered participants will receive the full HD recording of the session along with the blueprint PDF and notes." },
        { q: "Is this for beginners?", a: "Absolutely. We start from the absolute basics of market ecosystem before moving into clinical strategies." },
        { q: "What tools do I need?", a: "No paid tools are required. We teach using free charting platforms like TradingView." },
        { q: "Are bonuses included in this price?", a: "Yes, all bonuses (worth ₹4,999) are included for no extra cost when you register today." }
    ];

    return (
        <div className="min-h-screen bg-[#000000] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
            
            {/* Header Mirroring Topmate */}
            <header className="fixed top-0 left-0 right-0 z-[100] bg-black/60 backdrop-blur-xl border-b border-[#27272a]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight leading-none text-white">{BRAND_NAME}</h3>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 ml-0.5 italic">Wealth Academy</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/[0.04] blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-600/[0.03] blur-[180px] rounded-full" />
            </div>

            <main className="pt-32 pb-32 px-6 lg:px-12">
                <div className="max-w-[1240px] mx-auto">
                    
                    {registered ? (
                        /* SUCCESS STATE */
                        <div className="max-w-xl mx-auto py-20 animate-in fade-in zoom-in duration-1000">
                             <div className="bg-[#111114] border border-[#27272a] rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/50 blur-[1px]" />
                                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                                    <CheckCircle2 size={40} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-black text-white mb-4 tracking-tight uppercase italic">Booking Confirmed!</h1>
                                <p className="text-slate-400 mb-10 font-bold uppercase tracking-[0.2em] text-[10px]">Your Blueprint awaits you</p>
                                <a 
                                    href={WHATSAPP_GROUP_LINK}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-xl"
                                >
                                    Join WhatsApp Group <ArrowRight size={18} />
                                </a>
                             </div>
                        </div>
                    ) : (
                        /* TOTAL DESIGN MIRRORING LAYOUT */
                        <div className="flex flex-col lg:flex-row gap-16 items-start">
                            
                            {/* LEFT COLUMN: MAIN CONTENT */}
                            <div className="flex-1 space-y-16 lg:pr-12">
                                
                                {/* Hero Content */}
                                <div className="space-y-8 text-center lg:text-left">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#27272a]">
                                        <Sparkles size={14} className="text-emerald-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Nivesh Link Masterclass</span>
                                    </div>
                                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] lg:-ml-1 uppercase italic">
                                        Smart <br className="hidden md:block"/>
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-sky-400 to-emerald-500 italic">Trading.</span>
                                    </h1>
                                    <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                                        The 90-minute roadmap to financial independence through clinical stock market strategies.
                                    </p>
                                    
                                    {/* Social Proof Bar */}
                                    <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#000] bg-slate-800 shadow-xl ring-1 ring-white/10 overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?u=nivesh${i}`} alt="Trader" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            <div className="w-10 h-10 rounded-full border-2 border-[#000] bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-xl ring-1 ring-white/10">340+</div>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Smart Traders Joined</span>
                                    </div>
                                </div>

                                {/* What You'll Learn (8 Pillars) */}
                                <div className="space-y-12 pt-8">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic flex items-center gap-4">
                                        <Target className="text-emerald-500" /> The 8 Pillars of Wealth Creation
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <CompactPillar icon={<History className="text-emerald-400"/>} title="Market Reality" desc="Why 90% lose money and how you can join the 10% elite." />
                                        <MiniPillar icon={<Users className="text-emerald-400"/>} title="Ecosystem" desc="How institutional giants move the markets in their favor." />
                                        <MiniPillar icon={<PieChart className="text-emerald-400"/>} title="Vehicles" desc="Selecting the right assets for your capital size and goals." />
                                        <MiniPillar icon={<BarChart3 className="text-emerald-400"/>} title="Technical 5" desc="Internal checklist for identifying high-quality stock setups." />
                                        <MiniPillar icon={<PlayCircle className="text-emerald-400"/>} title="Price Action" desc="Mastering clinical price movement without indicators." />
                                        <MiniPillar icon={<Zap className="text-emerald-400"/>} title="Precision" desc="Execution framework for high-probability breakouts." />
                                        <MiniPillar icon={<ShieldCheck className="text-emerald-400"/>} title="Risk Matrix" desc="Professional risk-management protocols for wealth safety." />
                                        <MiniPillar icon={<Database className="text-emerald-400"/>} title="Journaling" desc="Using data to treat trading as a professional business." />
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="pt-20">
                                    <div className="p-10 md:p-12 bg-[#111114] border border-[#27272a] rounded-[3.5rem] flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 blur-3xl rounded-full" />
                                        <div className="w-40 h-40 rounded-[2.5rem] bg-emerald-600 flex items-center justify-center shrink-0 border-2 border-white/5 shadow-2xl transition-all duration-700">
                                            <TrendingUp size={80} className="text-white" />
                                        </div>
                                        <div className="flex-1 space-y-6 text-center md:text-left">
                                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">About Nivesh Link</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed max-w-lg font-medium">
                                                We demystify the stock market to provide jargon-free education that empowers you. Transform from a confused beginner into a confident, disciplined trader with our expert guidance.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* FAQ Accordion */}
                                <div className="space-y-10 pb-40">
                                     <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Frequently Asked</h3>
                                     <div className="bg-[#111114] border border-[#27272a] rounded-[2.5rem] overflow-hidden divide-y divide-[#27272a]">
                                        {faqs.map((faq, i) => (
                                            <div key={i} className="group">
                                                <button 
                                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                                    className="w-full px-8 py-8 flex items-center justify-between hover:bg-white/[0.02] transition-all text-left"
                                                >
                                                    <span className={cn("text-sm font-bold transition-colors", activeFaq === i ? "text-emerald-400" : "text-slate-300 group-hover:text-white")}>{faq.q}</span>
                                                    <ChevronDown size={18} className={cn("text-slate-600 transition-transform duration-300", activeFaq === i && "rotate-180 text-emerald-400")} />
                                                </button>
                                                {activeFaq === i && (
                                                    <div className="px-8 pb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: STICKY BOOKING CARD */}
                            <div className="w-full lg:w-[410px] lg:sticky lg:top-32 group">
                                <div id="booking-card" className="bg-[#111114] border border-[#27272a] rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-700 hover:border-emerald-500/50">
                                    {/* Accent Decoration */}
                                    <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-600/10 rounded-full blur-[80px] opacity-50 transition-all duration-700 group-hover:scale-150" />
                                    
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Workshop Registration Fee</p>
                                                <h4 className="text-4xl font-black text-white tracking-tight italic">₹{WEBINAR_PRICE}</h4>
                                            </div>
                                            <div className="p-4 bg-emerald-600/15 rounded-2xl flex items-center justify-center">
                                                <Zap className="text-emerald-500 fill-emerald-500" size={24} />
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-5">
                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                <Calendar size={18} className="text-emerald-400" />
                                                <span>{WEBINAR_DATE}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                <Clock size={18} className="text-emerald-400" />
                                                <span>{WEBINAR_TIME} • {WEBINAR_DURATION}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                <Video size={18} className="text-emerald-400" />
                                                <span>Secure Session Link</span>
                                            </div>
                                        </div>

                                        <form className="space-y-5">
                                            <div className="space-y-2.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-2">Name</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="Enter your name"
                                                    className="w-full px-6 py-5 bg-[#000] border border-[#27272a] rounded-2xl text-white font-bold placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-2">WhatsApp Number</label>
                                                <input 
                                                    required
                                                    type="tel" 
                                                    placeholder="+91 ...."
                                                    className="w-full px-6 py-5 bg-[#000] border border-[#27272a] rounded-2xl text-white font-bold placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                    value={formData.whatsapp}
                                                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                                                />
                                            </div>

                                            <button 
                                                type="button"
                                                onClick={() => handleRegister()}
                                                disabled={isProcessing}
                                                className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-xl disabled:opacity-50 mt-4 active:scale-95 flex items-center justify-center gap-3 italic"
                                            >
                                                {isProcessing ? 'Connecting...' : 'Secure My Seat Now'}
                                                {!isProcessing && <ArrowRight size={14} />}
                                            </button>
                                        </form>

                                        <div className="flex items-center justify-center gap-6 opacity-30 pt-4">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={14} />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-white">Verified Secure Access</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* MOBILE STICKY CTA BAR */}
            {!registered && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-2xl border-t border-white/5 z-50 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between gap-4">
                        <div className="pl-2">
                             <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest mb-0.5">Live Webinar</p>
                             <p className="text-xl font-black text-white">₹{WEBINAR_PRICE}</p>
                        </div>
                        <button 
                            onClick={() => handleRegister()}
                            className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl italic"
                        >
                            Book Seat
                        </button>
                    </div>
                </div>
            )}

            {/* Final Footer */}
            <footer className="py-24 border-t border-[#27272a] bg-black text-center relative overflow-hidden">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-950/20 blur-[100px] rounded-full pointer-events-none" />
                 <p className="text-[10px] font-bold text-slate-800 uppercase tracking-[1em] ml-[1em]">{BRAND_NAME}</p>
            </footer>
        </div>
    );
}

function CompactPillar({ icon, title, desc }: any) {
    return (
        <div className="flex gap-5 p-7 bg-[#111114] border border-[#27272a] rounded-[2rem] group hover:border-emerald-500/40 transition-all duration-500">
            <div className="shrink-0 w-14 h-14 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600/10 transition-all duration-500">
                {icon}
            </div>
            <div className="space-y-1.5 pt-1">
                <h5 className="font-black text-white uppercase tracking-tight text-sm italic leading-none">{title}</h5>
                <p className="text-[13px] text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{desc}</p>
            </div>
        </div>
    );
}

function MiniPillar({ icon, title, desc }: any) {
    return <CompactPillar icon={icon} title={title} desc={desc} />;
}
