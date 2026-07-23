import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MessageSquare, Send, Sparkles, X, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  const [totalExec, setTotalExec] = useState(0);
  const [scripts, setScripts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  
  const [settings, setSettings] = useState({
    discord_show: false,
    discord_name: 'Join For Us',
    discord_link: 'https://comingsoon&have&a&nice&day',
    devtool_show: false,
    devtool_name: 'Community',
    devtool_link: 'https://comingsoon&have&a&nice&day',
    donate_show: false,
    donate_name: 'Donation',
    donate_link: 'https://comingsoon&have&a&nice&day'
  });

  const [fabOpen, setFabOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const LS_URL = 'loadstring(game:HttpGet("https://zhenshubuniversal.vercel.app"))()';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (scripts.length > 0) fetchThumbnails();
  }, [scripts]);

  async function fetchData() {
    // 1. Fetch Total Executions
    const { data: statsData } = await supabase.from('global_stats').select('total_executions').eq('id', 1).single();
    if (statsData) setTotalExec(statsData.total_executions);

    // 2. Fetch Site Settings
    const { data: sets } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (sets) {
      setSettings({
        discord_show: Boolean(sets.discord_show),
        discord_name: sets.discord_name || 'Join For us',
        discord_link: sets.discord_link || 'https://comingsoon&have&a&nice&day',
        devtool_show: Boolean(sets.devtool_show),
        devtool_name: sets.devtool_name || 'Community',
        devtool_link: sets.devtool_link || 'https://comingsoon&have&a&nice&day',
        donate_show: Boolean(sets.donate_show),
        donate_name: sets.donate_name || 'Donation',
        donate_link: sets.donate_link || 'https://comingsoon&have&a&nice&day'
      });
    }
    setIsSettingsLoaded(true);

    // 3. Fetch Scripts Collection
    const { data: scriptsData } = await supabase.from('scripts').select('*').order('created_at', { ascending: false });
    if (scriptsData) setScripts(scriptsData);

    // 4. Fetch Public Threads Messages
    const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (msgData) setMessages(msgData);
  }

  const fetchThumbnails = async () => {
    const placeIds = scripts.map(s => s.place_id).filter(Boolean);
    if (placeIds.length === 0) return;

    try {
      const res = await fetch(`https://thumbnails.roproxy.com/v1/places/gameicons?placeIds=${placeIds.join(',')}&returnPolicy=PlaceHolder&size=150x150&format=Png`);
      const data = await res.json();
      if (data && data.data) {
        const map = {};
        data.data.forEach(item => { map[item.targetId] = item.imageUrl; });
        setThumbnails(map);
      }
    } catch (e) {
      console.error('Thumbnail fetch error:', e);
    }
  };

  const copyMain = async () => {
    navigator.clipboard.writeText(LS_URL);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);

    // Increment total executions hanya saat tombol Salin Script diklik
    await supabase.rpc('increment_executions', { amount: 1 });
    setTotalExec(prev => prev + 1);
  };

  const handleSendMessage = async () => {
    if (!msgContent.trim()) return alert('Pesan tidak boleh kosong!');

    const { error } = await supabase.from('messages').insert([
      {
        sender_name: senderName.trim() || 'Anonymous',
        content: msgContent.trim()
      }
    ]);

    if (!error) {
      setMsgContent('');
      fetchData();
      setActiveModal('thread');
    } else {
      alert('Gagal mengirim pesan: ' + error.message);
    }
  };

  const formatCount = (num) => {
    return num >= 1000 ? (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : num;
  };

  return (
    <div className="text-zinc-100 min-h-screen relative overflow-x-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Navbar */}
        <nav className="flex justify-between items-center py-6 border-b border-white/10 gap-4 mb-6">
          <div className="font-orbitron text-2xl font-black tracking-widest chrome-text flex items-center gap-2">
            <span className="text-white animate-pulse">•</span> ZH
          </div>
          <div className="flex flex-wrap justify-center gap-3 font-mono text-xs">
            {isSettingsLoaded && settings.discord_show && (
              <a href={settings.discord_link} target="_blank" rel="noreferrer" className="cling-effect px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition backdrop-blur-md flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                {settings.discord_name}
              </a>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono text-xs mb-8 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-white ping-glow"></div>
            Total Execute: <span className="text-white font-bold text-sm">{formatCount(totalExec)}</span>
          </div>

          <div className="relative w-fit mx-auto mb-4">
            <h1 className="font-zendots text-5xl sm:text-7xl md:text-8xl tracking-tight uppercase chrome-text leading-none">
              ZHENS<br />HUB
            </h1>
          </div>

          <p className="font-mono text-xs sm:text-sm text-zinc-400 tracking-[0.2em] uppercase mt-4 mb-10">
            Premium Roblox scripts with Advanced Features
          </p>

          {/* Loadstring Terminal Box */}
          <div className="max-w-3xl mx-auto mb-16 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl overflow-hidden shadow-2xl text-left">
            <div className="bg-black/40 px-6 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/80"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-800 border border-white/20"></div>
              </div>
              <span className="font-mono text-xs text-zinc-400">universal.lua</span>
            </div>
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="font-mono text-xs sm:text-sm text-zinc-200 break-all leading-relaxed">
                <span className="text-white font-bold underline">loadstring</span>(game:HttpGet(<span className="text-zinc-400 italic">"https://zhenshubuniversal.vercel.app"</span>))()
              </div>
              <button onClick={copyMain} className="cling-effect w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/20 bg-white/10 hover:bg-white text-white hover:text-black font-orbitron text-xs font-bold tracking-wider whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2">
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Disalin!' : 'Salin Script'}
              </button>
            </div>
          </div>
        </section>

        {/* Script Collection Grid */}
        <section className="mt-4 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-zendots text-2xl uppercase chrome-text whitespace-nowrap">Script Collection</h2>
            <div className="h-px bg-gradient-to-r from-white/20 to-transparent w-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((s) => (
              <div 
                key={s.id} 
                className="cling-effect bg-zinc-900/40 border border-white/10 hover:border-white/30 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-xl border border-white/10 overflow-hidden bg-black/40 flex-shrink-0">
                      <img 
                        src={thumbnails[s.place_id] || "/logo.png"} 
                        onError={(e) => { e.target.src = "/logo.png"; }}
                        className="w-full h-full object-cover" 
                        alt={s.title} 
                      />
                    </div>
                    <span className={`font-orbitron text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${s.status === 'DISABLED' ? 'bg-black/50 text-zinc-400 border-white/10' : 'bg-white/10 text-white border-white/20'}`}>
                      {s.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                    {s.title}
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 text-amber-300 transition" />
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">{s.description}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-white/10 font-mono text-xs">
                  <span className="text-white">⚡ {formatCount(s.executions)} Executions</span>
                  <span className="text-zinc-500">{s.version || 'v1.0.0'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Dev Tools & Support Section */}
        {isSettingsLoaded && (settings.devtool_show || settings.donate_show) && (
          <div className="max-w-2xl mx-auto flex flex-col gap-6 items-center py-8">
            {settings.devtool_show && (
              <div className="w-full text-center">
                <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-3">~ Tools</p>
                <a href={settings.devtool_link} target="_blank" rel="noreferrer" className="cling-effect w-full max-w-xs inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold transition">
                  {settings.devtool_name} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {settings.donate_show && (
              <div className="w-full text-center">
                <p className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-3">~ Support Developer 🙏</p>
                <a href={settings.donate_link} target="_blank" rel="noreferrer" className="cling-effect w-full max-w-xs inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-full border border-white/25 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold transition">
                  {settings.donate_name} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {fabOpen && (
          <div className="flex flex-col gap-2 transition-all duration-300">
            <button onClick={() => { setActiveModal('thread'); setFabOpen(false); }} className="px-5 py-3 rounded-full border border-white/10 bg-zinc-900/90 text-white font-mono text-xs shadow-xl backdrop-blur-md hover:bg-zinc-800 transition flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Public Threads
            </button>
            <button onClick={() => { setActiveModal('send'); setFabOpen(false); }} className="px-5 py-3 rounded-full border border-white/10 bg-zinc-900/90 text-white font-mono text-xs shadow-xl backdrop-blur-md hover:bg-zinc-800 transition flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" /> Kirim Pesan
            </button>
          </div>
        )}
        <button onClick={() => setFabOpen(!fabOpen)} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition">
          {fabOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      {/* Modals */}
      {activeModal && <div onClick={() => setActiveModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"></div>}

      {activeModal === 'send' && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-zinc-950 border border-white/15 rounded-2xl p-6 z-50 backdrop-blur-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
            <h3 className="font-orbitron font-bold text-sm text-white">KIRIM PESAN KE ADMIN</h3>
            <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white font-bold"><X className="w-5 h-5" /></button>
          </div>
          <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Nama Anda (No Name = Anonymous)" className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl p-3 mb-3 focus:outline-none" />
          <textarea rows="4" value={msgContent} onChange={(e) => setMsgContent(e.target.value)} placeholder="Tulis pesan..." className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl p-3 mb-4 focus:outline-none resize-none"></textarea>
          <button onClick={handleSendMessage} className="w-full py-3 bg-white text-black font-orbitron font-bold text-xs rounded-xl hover:bg-zinc-200 transition">KIRIM PESAN</button>
        </div>
      )}

      {activeModal === 'thread' && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-zinc-950 border border-white/15 rounded-2xl p-6 z-50 backdrop-blur-2xl shadow-2xl max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
            <h3 className="font-orbitron font-bold text-sm text-white">PUBLIC THREADS</h3>
            <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white font-bold"><X className="w-5 h-5" /></button>
          </div>
          <div className="overflow-y-auto space-y-3 flex-1 pr-1 font-sans text-sm">
            {messages.length === 0 ? (
              <div className="text-center text-zinc-500 py-4 font-mono text-xs">Belum ada percakapan.</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                    <span className="text-white font-bold">👤 {m.sender_name}</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">{m.content}</p>
                  {m.admin_reply && (
                    <div className="bg-white/10 border-l-2 border-white pl-2.5 py-1.5 mt-2 rounded-r-lg">
                      <span className="font-orbitron text-[10px] font-bold text-white block uppercase">👤 Admin</span>
                      <span className="text-xs text-zinc-300">{m.admin_reply}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <footer className="py-8 text-center font-mono text-xs text-zinc-500 border-t border-white/10 mt-12 bg-black/40">
        <div><span className="text-white font-bold">ZH</span> - ZHENSHUB © 2026</div>
      </footer>
    </div>
  );
                              }
