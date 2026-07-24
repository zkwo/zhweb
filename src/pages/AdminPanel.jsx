import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, Bell, Link2, Code2, MessageSquare, LogOut, ChevronDown } from 'lucide-react';

export default function AdminPanel({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'popup' | 'links' | 'scripts' | 'messages'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [globalExec, setGlobalExec] = useState(0);
  const [scripts, setScripts] = useState([]);
  const [messages, setMessages] = useState([]);

  // Popup Settings state
  const [popup, setPopup] = useState({
    id: 1,
    is_active: true,
    title: '',
    content: ''
  });

  // Site Settings state
  const [settings, setSettings] = useState({
    id: 1,
    discord_show: true,
    discord_name: 'Discord',
    discord_link: '',
    devtool_show: true,
    devtool_name: '',
    devtool_link: '',
    donate_show: true,
    donate_name: '',
    donate_link: ''
  });

  // Script Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [status, setStatus] = useState('ACTIVE');
  const [executions, setExecutions] = useState(0);
  const [version, setVersion] = useState('v1.0.0');
  const [description, setDescription] = useState('');

  const ADMIN_PASS = '089527732022';

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setIsAuthenticated(true);
    } else {
      alert('Password salah!');
    }
  };

  async function loadAdminData() {
    // 1. Stats
    const { data: stats } = await supabase.from('global_stats').select('total_executions').eq('id', 1).single();
    if (stats) setGlobalExec(stats.total_executions);

    // 2. Popup Settings
    const { data: popupData } = await supabase.from('popup_settings').select('*').eq('id', 1).maybeSingle();
    if (popupData) setPopup(popupData);

    // 3. Site Settings
    const { data: sets } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (sets) setSettings(sets);

    // 4. Scripts
    const { data: scriptList } = await supabase.from('scripts').select('*').order('created_at', { ascending: false });
    if (scriptList) setScripts(scriptList);

    // 5. Messages
    const { data: msgList } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (msgList) setMessages(msgList);
  }

  const saveGlobalExec = async () => {
    await supabase.from('global_stats').upsert({ id: 1, total_executions: parseInt(globalExec) });
    alert('Global Executions berhasil disimpan!');
  };

  //const savePopupSettings = async () => {
    //const { error } = await supabase.from('popup_settings').upsert({
      //id: 1,
      //is_active: popup.is_active,
      //title: popup.title,
      //content: popup.content
    //});

   // if (!error) {
   //   alert('Pengaturan Popup Announcement berhasil disimpan!');
  //    loadAdminData();
//    } else    
  //alert('Gagal menyimpan popup: ' + error.message);
 //   }
//  };
const savePopupSettings = async () => {
    const { error } = await supabase.from('popup_settings').upsert({
      id: 1,
      is_active: popup.is_active,
      title: popup.title,
      content: popup.content,
      updated_at: new Date().toISOString() // <-- Tambahkan waktu pembaruan terbaru
    });

    if (!error) {
      alert('Pengaturan Popup Announcement berhasil disimpan & dipush ke semua pengguna!');
      loadAdminData();
    } else {
      alert('Gagal menyimpan popup: ' + error.message);
    }
  };
  
  const saveSiteSettings = async () => {
    const { error } = await supabase.from('site_settings').upsert({
      id: 1,
      discord_show: settings.discord_show,
      discord_name: settings.discord_name,
      discord_link: settings.discord_link,
      devtool_show: settings.devtool_show,
      devtool_name: settings.devtool_name,
      devtool_link: settings.devtool_link,
      donate_show: settings.donate_show,
      donate_name: settings.donate_name,
      donate_link: settings.donate_link
    });

    if (!error) {
      alert('Pengaturan tombol & link berhasil disimpan!');
      loadAdminData();
    } else {
      alert('Gagal menyimpan: ' + error.message);
    }
  };

  const handleSubmitScript = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      place_id: placeId,
      developer_name: developerName,
      is_verified: isVerified,
      status,
      executions: parseInt(executions),
      version,
      description
    };

    if (editingId) {
      await supabase.from('scripts').update(payload).eq('id', editingId);
    } else {
      await supabase.from('scripts').insert([payload]);
    }

    resetForm();
    loadAdminData();
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setTitle(s.title);
    setPlaceId(s.place_id);
    setDeveloperName(s.developer_name || '');
    setIsVerified(s.is_verified !== false);
    setStatus(s.status);
    setExecutions(s.executions);
    setVersion(s.version);
    setDescription(s.description);
  };

  const toggleArchive = async (s) => {
    const nextState = !s.is_archived;
    await supabase.from('scripts').update({ is_archived: nextState }).eq('id', s.id);
    loadAdminData();
  };

  const handleDeleteScript = async (id) => {
    if (confirm('Hapus script ini secara permanen?')) {
      await supabase.from('scripts').delete().eq('id', id);
      loadAdminData();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setPlaceId('');
    setDeveloperName('');
    setIsVerified(true);
    setStatus('ACTIVE');
    setExecutions(0);
    setVersion('v1.0.0');
    setDescription('');
  };

  const handleReply = async (id, replyText) => {
    await supabase.from('messages').update({ admin_reply: replyText }).eq('id', id);
    alert('Balasan tersimpan!');
    loadAdminData();
  };

  const handleDeleteMsg = async (id) => {
    if (confirm('Hapus pesan?')) {
      await supabase.from('messages').delete().eq('id', id);
      loadAdminData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-zinc-900/80 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl">
          <h2 className="font-orbitron text-xl font-bold tracking-widest text-white mb-6">ADMIN LOGIN</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan Password Admin"
            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white font-mono mb-4 focus:outline-none"
          />
          <button onClick={handleLogin} className="w-full py-3 bg-white text-black font-orbitron font-bold text-xs rounded-xl hover:bg-zinc-200 transition">
            MASUK PANEL
          </button>
          <button onClick={onBack} className="mt-4 text-xs font-mono text-zinc-400 hover:underline block mx-auto">
            ← Kembali ke Website
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Stats', icon: LayoutDashboard },
    { id: 'popup', label: 'Popup Notifikasi', icon: Bell },
    { id: 'links', label: 'Tombol & Link', icon: Link2 },
    { id: 'scripts', label: 'Collection Script', icon: Code2 },
    { id: 'messages', label: 'Pesan Masuk', icon: MessageSquare },
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Admin */}
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white tracking-wider">ZHENS HUB — ADMIN PANEL</h1>
            <p className="font-mono text-xs text-zinc-400">Pengaturan Realtime & Database Cloud</p>
          </div>
          <button onClick={onBack} className="px-5 py-2 rounded-full border border-white/20 text-xs font-mono text-zinc-300 hover:bg-white hover:text-black transition flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" /> KELUAR
          </button>
        </div>

        {/* Tab Navigation Menu (Desktop & Tablet) */}
        <div className="hidden md:flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 py-2.5 rounded-full font-mono text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'bg-zinc-900/60 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Dropdown Navigation Menu (Mobile) */}
        <div className="md:hidden relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-zinc-900 border border-white/15 rounded-xl p-3 flex justify-between items-center text-xs font-mono text-white"
          >
            <span className="flex items-center gap-2">
              {navItems.find(i => i.id === activeTab)?.label}
            </span>
            <ChevronDown className={`w-4 h-4 transition ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/15 rounded-xl overflow-hidden z-30 shadow-2xl space-y-1 p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
                      activeTab === item.id ? 'bg-white text-black font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'dashboard' && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <h2 className="font-orbitron text-sm font-bold text-white border-b border-white/5 pb-2">TOTAL EXECUTIONS GLOBAL</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block font-mono text-xs text-zinc-400 mb-1">Hitungan Manual Execution Counter</label>
                <input type="number" value={globalExec} onChange={(e) => setGlobalExec(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white font-mono focus:outline-none" />
              </div>
              <button onClick={saveGlobalExec} className="w-full sm:w-auto px-6 py-3 bg-white text-black font-orbitron font-bold text-xs rounded-xl hover:bg-zinc-200 transition">
                SIMPAN EXECUTION
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: POPUP NOTIFIKASI */}
        {activeTab === 'popup' && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h2 className="font-orbitron text-sm font-bold text-white">POPUP ANNOUNCEMENT NOTIFICATION</h2>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={popup.is_active} 
                  onChange={(e) => setPopup({ ...popup, is_active: e.target.checked })} 
                  className="w-4 h-4 accent-emerald-500" 
                />
                Aktifkan Popup
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">Judul Popup Announcement</label>
                <input 
                  type="text" 
                  value={popup.title} 
                  onChange={(e) => setPopup({ ...popup, title: e.target.value })} 
                  placeholder="misal: Follow Channel WA & IG ZHENS HUB" 
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" 
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-400 mb-1">
                  Isi Pesan / Konten (Bisa spasi/enter kebawah & sertakan URL link otomatis berwarna)
                </label>
                <textarea 
                  rows="6" 
                  value={popup.content} 
                  onChange={(e) => setPopup({ ...popup, content: e.target.value })} 
                  placeholder="Gunakan Enter untuk baris baru. Salin link URL seperti https://instagram.com/xxx untuk menjadikannya link berwarna otomatis." 
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none font-sans leading-relaxed resize-none" 
                />
              </div>

              <button onClick={savePopupSettings} className="px-6 py-3 bg-emerald-500 text-black font-orbitron font-bold text-xs rounded-xl hover:bg-emerald-400 transition">
                SIMPAN POPUP ANNOUNCEMENT
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: TOMBOL & LINK */}
        {activeTab === 'links' && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <h2 className="font-orbitron text-sm font-bold text-white border-b border-white/5 pb-2">PENGATURAN TOMBOL & REDIRECT LINK</h2>
            
            {/* Discord */}
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white">Tombol Discord Navbar</span>
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input type="checkbox" checked={settings.discord_show} onChange={(e) => setSettings({ ...settings, discord_show: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                  Tampilkan
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" value={settings.discord_name} onChange={(e) => setSettings({ ...settings, discord_name: e.target.value })} placeholder="Nama Tombol" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white" />
                <input type="text" value={settings.discord_link} onChange={(e) => setSettings({ ...settings, discord_link: e.target.value })} placeholder="Link Invite Discord" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white font-mono" />
              </div>
            </div>

            {/* Dev Tools */}
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white">Tombol Developer Tools</span>
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input type="checkbox" checked={settings.devtool_show} onChange={(e) => setSettings({ ...settings, devtool_show: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                  Tampilkan
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" value={settings.devtool_name} onChange={(e) => setSettings({ ...settings, devtool_name: e.target.value })} placeholder="Nama Tombol" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white" />
                <input type="text" value={settings.devtool_link} onChange={(e) => setSettings({ ...settings, devtool_link: e.target.value })} placeholder="Link Redirect" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white font-mono" />
              </div>
            </div>

            {/* Saweria */}
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white">Tombol Support / Donasi</span>
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input type="checkbox" checked={settings.donate_show} onChange={(e) => setSettings({ ...settings, donate_show: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                  Tampilkan
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" value={settings.donate_name} onChange={(e) => setSettings({ ...settings, donate_name: e.target.value })} placeholder="Nama Tombol" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white" />
                <input type="text" value={settings.donate_link} onChange={(e) => setSettings({ ...settings, donate_link: e.target.value })} placeholder="Link Redirect" className="bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white font-mono" />
              </div>
            </div>

            <button onClick={saveSiteSettings} className="px-6 py-3 bg-emerald-500 text-black font-orbitron font-bold text-xs rounded-xl hover:bg-emerald-400 transition">
              SIMPAN PENGATURAN LINK
            </button>
          </div>
        )}

        {/* TAB 4: COLLECTION SCRIPT */}
        {activeTab === 'scripts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Form Script */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
              <h2 className="font-orbitron text-sm font-bold text-white mb-4 border-b border-white/5 pb-2">
                {editingId ? 'EDIT SCRIPT' : 'TAMBAH SCRIPT BARU'}
              </h2>
              <form onSubmit={handleSubmitScript} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="Judul Game (misal: Evade)" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                  <input type="text" placeholder="Place ID (misal: 9872472334)" value={placeId} onChange={(e) => setPlaceId(e.target.value)} required className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                  
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="Nama Developer/Group (opsional)" value={developerName} onChange={(e) => setDeveloperName(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                  <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3">
                    <label className="text-xs text-zinc-300 font-mono flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                      Verified Badge (Centang Biru)
                    </label>
                  </div>
                  <input type="number" placeholder="Executions Card Ini" value={executions} onChange={(e) => setExecutions(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="Versi (misal: v1.0.0)" value={version} onChange={(e) => setVersion(e.target.value)} className="bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                  <input type="text" placeholder="Deskripsi Ringkas Script" value={description} onChange={(e) => setDescription(e.target.value)} required className="sm:col-span-2 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 bg-emerald-500 text-black font-orbitron font-bold text-xs rounded-xl hover:bg-emerald-400 transition">
                    SIMPAN SCRIPT
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="px-6 py-3 bg-zinc-800 text-white font-orbitron font-bold text-xs rounded-xl hover:bg-zinc-700 transition">
                      BATAL
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Tabel Collection */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 overflow-x-auto">
              <h2 className="font-orbitron text-sm font-bold text-white mb-4 border-b border-white/5 pb-2">DAFTAR SCRIPT HUB</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-xs text-zinc-400">
                    <th className="py-2">Judul</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Visibility</th>
                    <th className="py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {scripts.map((s) => (
                    <tr key={s.id} className="border-b border-white/5">
                      <td className="py-3 font-bold">{s.title}</td>
                      <td className="py-3 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded border ${s.status === 'ACTIVE' ? 'border-emerald-500/30 text-emerald-400' : 'border-zinc-700 text-zinc-500'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-xs">
                        {s.is_archived ? <span className="text-amber-400">[Archived]</span> : <span className="text-zinc-500">[Public]</span>}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button onClick={() => toggleArchive(s)} className={`px-3 py-1 font-bold text-xs rounded transition ${s.is_archived ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                          {s.is_archived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button onClick={() => handleEdit(s)} className="px-3 py-1 bg-amber-500 text-black font-bold text-xs rounded hover:bg-amber-400">Edit</button>
                        <button onClick={() => handleDeleteScript(s.id)} className="px-3 py-1 bg-red-500 text-white font-bold text-xs rounded hover:bg-red-600">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PESAN MASUK (PUBLIC THREADS) */}
        {activeTab === 'messages' && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <h2 className="font-orbitron text-sm font-bold text-white border-b border-white/5 pb-2">PESAN MASUK (PUBLIC THREADS)</h2>
            {messages.length === 0 ? (
              <div className="text-center text-zinc-500 py-8 font-mono text-xs">Belum ada pesan masuk dari pengunjung.</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="bg-zinc-950 border border-white/10 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span className="text-white font-bold">👤 {m.sender_name}</span>
                    <button onClick={() => handleDeleteMsg(m.id)} className="text-red-400 hover:underline">Hapus</button>
                  </div>
                  <p className="text-sm text-zinc-200">{m.content}</p>
                  <div className="flex gap-2 pt-2">
                    <input type="text" defaultValue={m.admin_reply} id={`reply-input-${m.id}`} placeholder="Tulis balasan admin..." className="flex-1 bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none" />
                    <button onClick={() => handleReply(m.id, document.getElementById(`reply-input-${m.id}`).value)} className="px-4 py-2 bg-white text-black font-bold text-xs rounded hover:bg-zinc-200 transition">
                      Balas
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
                                                                       }
