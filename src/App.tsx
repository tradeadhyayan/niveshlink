import { useState, useEffect } from 'react';
import {
  Zap,
  Calendar, Clock, Video, CheckCircle2,
  Gift, ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { api } from './lib/api';
import AdminRegistry from './pages/AdminRegistry';

function App() {
  const [view, setView] = useState('landing');
  const [activeWebinar, setActiveWebinar] = useState<any>(null);
  const [registered, setRegistered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    experience: 'Beginner'
  });
  const [loading, setLoading] = useState(false);

  // Simple Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setView('registry');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    // Fetch active webinar info
    const loadWebinar = async () => {
      const webinar = await api.webinar.getActive();
      if (webinar) {
        setActiveWebinar(webinar);
      }
    };
    loadWebinar();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Get UTMs
    const params = new URLSearchParams(window.location.search);

    try {
      await api.webinar.register({
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email,
        experience: formData.experience,
        webinar_id: activeWebinar?.id || null,
        webinar_date: activeWebinar ? `${new Date(activeWebinar.date).toLocaleDateString()}, ${activeWebinar.time}` : '1 Feb, Sunday',
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        campaign_source: params.get('source') || params.get('utm_source') || 'Direct'
      });
      setRegistered(true);
    } catch (err: any) {
      console.error('Registration failed:', err);
      // More detailed error feedback
      if (err.message) {
        alert(`Registration failed: ${err.message}`);
      } else {
        alert('Something went wrong. Please check your internet connection or try a different browser.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (view === 'registry') {
    return <AdminRegistry />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-body selection:bg-emerald-500/20 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 group-hover:scale-110 transition-all duration-500">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 font-heading">
              Nivesh Link
            </span>
          </div>
          {/* Hidden link to admin */}
          <div className="absolute right-0 bottom-0 w-16 h-16 cursor-default opacity-0" onClick={() => window.location.hash = '#/admin'} />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 md:pt-36 pb-10 md:pb-16 px-4 md:px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-emerald-50/50 to-transparent blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-3xl md:text-7xl font-bold font-heading tracking-tight mb-4 leading-[1.2] md:leading-[1.15] text-slate-900">
            Want to start trading <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600">but feeling confused?</span>
          </h1>

          <p className="text-sm md:text-xl text-slate-500 mb-6 md:mb-10 max-w-2xl mx-auto font-medium leading-[1.5] md:leading-[1.4] px-2 md:px-4 tracking-tight">
            Get a clear, simple roadmap in our 90-Minute Live Webinar designed for absolute beginners.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3.5 max-w-2xl mx-auto mb-10 md:mb-16 px-4 md:px-0">
            <EventInfo icon={<Calendar className="text-emerald-600 w-4 md:h-4.5" />} label={activeWebinar ? new Date(activeWebinar.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : '1 Feb, Sunday'} />
            <EventInfo icon={<Clock className="text-emerald-600 w-4 md:h-4.5" />} label={activeWebinar?.time || "11 AM Sharp"} />
            <EventInfo icon={<Video className="text-emerald-600 w-4 md:h-4.5" />} label="Google Meet" />
          </div>

          {!registered ? (
            <div id="register" className="p-6 md:p-12 bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] max-w-lg mx-auto relative overflow-hidden transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <h3 className="text-xl md:text-2xl font-bold font-heading mb-8 md:mb-10 text-slate-900">
                Reserve Your Free Seat
              </h3>
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <InputGroup label="Full Name" type="text" placeholder="Ajay Sharma" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputGroup label="Email" type="email" placeholder="email@example.com" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                  <InputGroup label="WhatsApp" type="tel" placeholder="+91" value={formData.whatsapp} onChange={v => setFormData({ ...formData, whatsapp: v })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-3 md:ml-4 tracking-widest">Experience</label>
                  <select
                    className="w-full px-5 md:px-7 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none text-sm cursor-pointer"
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  >
                    <option value="Beginner">Beginner (Zero Knowledge)</option>
                    <option value="Intermediate">Intermediate (knows basics)</option>
                    <option value="Advanced">Advanced (active trader)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 md:py-4 bg-emerald-600 text-white rounded-xl font-bold font-heading uppercase tracking-[0.15em] text-[10px] md:text-xs hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 mt-4 active:scale-95"
                >
                  {loading ? 'Processing...' : 'Register for Free'}
                </button>
                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  <ShieldCheck size={12} className="text-emerald-500" /> SECURE ACCESS • NO SPAM
                </p>
              </form>
            </div>
          ) : (
            <div className="p-8 md:p-10 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] md:rounded-[2.5rem] shadow-sm max-w-lg mx-auto text-center animate-in zoom-in duration-700">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-100">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-heading mb-2 text-slate-900">Registration Confirmed!</h3>
              <p className="text-sm md:text-base text-slate-500 font-medium mb-8 leading-tight">Meeting link will be shared on WhatsApp.</p>
              <a
                href={activeWebinar?.whatsapp_group_link || "https://chat.whatsapp.com/Fr5ieLzdLICI85SLwVCKQI?mode=gi_t"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 text-white rounded-xl font-bold font-heading uppercase tracking-widest text-[10px] md:text-xs shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
              >
                Join WhatsApp Group
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-emerald-600 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px]">What we'll cover</span>
            <h2 className="text-2xl md:text-5xl font-bold font-heading mt-2 tracking-tight text-slate-900">Your Journey Roadmap</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <RoadmapBox step="1" title="Foundations" items={["Reality Check (90% Rule)", "Market Ecosystem", "Instruments & Equity"]} />
            <RoadmapBox step="2" title="Analysis & Strategy" items={["Fundamental Pillars", "Technical Charts", "Breakout Strategies"]} />
            <RoadmapBox step="3" title="Execution" items={["Risk Management", "Trading Journal", "Course Curriculum"]} />
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xl md:text-3xl font-bold font-heading mb-10 md:mb-12 text-slate-900 px-4">Exclusive Attendance Bonuses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <RewardBox title="Portfolio Guide PDF" />
            <RewardBox title="Trading Checklist" />
            <RewardBox title="VIP Community Access" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-slate-950 rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 text-center shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />
          <h2 className="text-2xl md:text-6xl font-bold font-heading text-white mb-6 md:mb-8 tracking-tight text-balance">Seats fill up fast.</h2>
          <button
            onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-bold font-heading text-[10px] md:text-xs uppercase tracking-widest hover:scale-[1.02] hover:bg-emerald-500 transition-all shadow-xl active:scale-95"
          >
            Register for Free Now
          </button>
          <p className="mt-8 text-slate-500 font-bold font-heading text-[9px] md:text-[10px] uppercase tracking-[0.4em]">Limited Lifetime Access Bonuses</p>
        </div>
      </section>

      <footer className="py-10 md:py-12 text-center border-t border-slate-100 bg-white">
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] px-4">Nivesh Link Coaching • 2026</p>
      </footer>
    </div>
  );
}

function EventInfo({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center md:flex-col justify-center md:justify-center gap-3 md:gap-3 p-4 md:p-7 bg-white border border-slate-100 rounded-2xl md:rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-emerald-100 transition-all text-left md:text-center">
      <div className="w-8 h-8 md:w-11 md:h-11 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-xs md:text-base font-bold font-heading text-slate-800 tracking-tight">{label}</span>
    </div>
  );
}

function InputGroup({ label, type, placeholder, value, onChange }: { label: string, type: string, placeholder: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-1 md:space-y-1.5">
      <label className="text-[9px] font-bold uppercase text-slate-400 ml-3 md:ml-4 tracking-widest">{label}</label>
      <input
        required
        type={type}
        className="w-full px-5 md:px-7 py-3 md:py-3.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm tracking-tight"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function RoadmapBox({ step, title, items }: { step: string, title: string, items: string[] }) {
  return (
    <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-2xl md:rounded-3xl hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-500 group text-left">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white mb-5 md:mb-6 text-[10px] tracking-widest">
        {step}
      </div>
      <h4 className="font-bold font-heading text-lg md:text-xl mb-3 md:mb-4 text-slate-900">{title}</h4>
      <ul className="space-y-2 md:space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] md:text-sm text-slate-500 font-medium leading-relaxed">
            <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RewardBox({ title }: { title: string }) {
  return (
    <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] hover:bg-emerald-50/30 hover:border-emerald-100 transition-all duration-300">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
        <Gift size={20} className="md:w-5 md:h-5" />
      </div>
      <h3 className="text-xs md:text-base font-bold font-heading text-slate-800 tracking-tight">{title}</h3>
      <p className="mt-1.5 md:mt-2 text-[8px] md:text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Attendance Bonus</p>
    </div>
  );
}

export default App;
