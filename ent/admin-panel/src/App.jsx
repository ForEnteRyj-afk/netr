import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Smartphone, Users, ShieldAlert, Activity, Settings, 
  Search, Bell, LogOut, Wifi, Battery, MoreVertical, Play, Pause, 
  RefreshCw, Lock, Server, Globe, AlertTriangle, CheckCircle, XCircle, 
  Filter, Download, Shield, ChevronRight, Plus, X, Edit2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- Компоненты интерфейса ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
  >
    <Icon size={20} className={active ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'} />
    <span className="font-medium text-sm">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />}
  </button>
);

const NodeCard = ({ node }) => (
  <div className={`relative p-5 rounded-2xl border backdrop-blur-xl transition-all ${
    node.status === 'active' ? 'bg-white/[0.02] border-green-500/20' : 
    node.status === 'warning' ? 'bg-yellow-500/[0.05] border-yellow-500/20' : 
    'bg-red-500/[0.05] border-red-500/20'
  }`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          node.status === 'active' ? 'bg-green-500' : 
          node.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="font-bold text-white tracking-wide">{node.id}</span>
      </div>
      <div className="flex gap-2">
        <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"><RefreshCw size={14}/></button>
      </div>
    </div>
    <div className="w-full h-32 bg-black/40 rounded-xl mb-4 border border-white/5 flex items-center justify-center relative overflow-hidden group cursor-pointer">
       {node.status === 'stopped' ? (
         <div className="text-xs text-gray-600 font-mono">OFFLINE</div>
       ) : (
         <>
           <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all" />
           <div className="z-10 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-mono text-green-400 flex items-center gap-2">
                 <Activity size={10} /> Live View
              </span>
           </div>
         </>
       )}
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">App</span>
        <span className="text-white font-medium">{node.bank}</span>
      </div>
      <div className="flex justify-between text-xs pt-2 border-t border-white/5 mt-2">
         <span className="text-gray-600">{node.uptime}</span>
         <span className="text-gray-600 flex items-center gap-1"><Battery size={10}/> {node.battery}%</span>
      </div>
    </div>
  </div>
);

// --- Модальные окна редактирования ---

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...user });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Редактировать баланс</h3>
          <button onClick={onClose}><X className="text-gray-500 hover:text-white" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Telegram ID</label>
            <input disabled value={formData.telegramId} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-gray-400 mt-1 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">USDT Balance</label>
            <input type="number" value={formData.usdtBalance} onChange={e => setFormData({...formData, usdtBalance: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-1 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">TON Balance</label>
            <input type="number" value={formData.tonBalance} onChange={e => setFormData({...formData, tonBalance: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-1 focus:border-blue-500 outline-none" />
          </div>
          <button onClick={() => onSave(formData)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4 transition-colors">Сохранить изменения</button>
        </div>
      </div>
    </div>
  );
};

const EditRatesModal = ({ rates, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...rates });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Настройка курсов</h3>
          <button onClick={onClose}><X className="text-gray-500 hover:text-white" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">1 USDT = ? RUB</label>
            <input type="number" value={formData.USDT} onChange={e => setFormData({...formData, USDT: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-1 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">1 TON = ? RUB</label>
            <input type="number" value={formData.TON} onChange={e => setFormData({...formData, TON: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-1 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Курс Доллара (USD)</label>
            <input type="number" value={formData.USD_PRB} onChange={e => setFormData({...formData, USD_PRB: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-1 focus:border-blue-500 outline-none" />
          </div>
          <button onClick={() => onSave(formData)} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl mt-4 transition-colors">Обновить курсы</button>
        </div>
      </div>
    </div>
  );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ АДМИНКИ ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Данные с сервера
  const [rates, setRates] = useState({ USDT: 0, TON: 0, USD_PRB: 0 });
  const [users, setUsers] = useState([]);
  
  // Модальные окна
  const [editingUser, setEditingUser] = useState(null);
  const [isEditingRates, setIsEditingRates] = useState(false);

  // Демо-данные для визуализации
  const MOCK_NODES = [
    { id: 'NODE-01', bank: 'Agroprom', status: 'active', proxy: '192.168.1.10 (MD)', battery: 98, uptime: '24h 12m' },
    { id: 'NODE-02', bank: 'Sber (PMR)', status: 'active', proxy: '192.168.1.12 (MD)', battery: 100, uptime: '12h 45m' },
    { id: 'NODE-03', bank: 'Exim', status: 'warning', proxy: '45.12.18.99 (RU)', battery: 45, uptime: '2h 10m' },
    { id: 'NODE-04', bank: 'Agroprom', status: 'stopped', proxy: '188.24.11.2 (MD)', battery: 0, uptime: '0m' },
  ];
  const CHART_DATA = [
    { time: '00:00', volume: 4000 }, { time: '04:00', volume: 3000 }, { time: '08:00', volume: 2000 },
    { time: '12:00', volume: 2780 }, { time: '16:00', volume: 1890 }, { time: '20:00', volume: 2390 }, { time: '23:59', volume: 3490 },
  ];

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
        const ratesRes = await fetch('http://localhost:3000/rates');
        const usersRes = await fetch('http://localhost:3000/users');
        const ratesData = await ratesRes.json();
        const usersData = await usersRes.json();
        setRates(ratesData);
        setUsers(usersData);
    } catch (e) { console.error("Server offline?"); }
  };

  const handleSaveRates = async (newRates) => {
    await fetch('http://localhost:3000/admin/update-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            USDT: parseFloat(newRates.USDT),
            TON: parseFloat(newRates.TON),
            USD_PRB: parseFloat(newRates.USD_PRB)
        })
    });
    fetchData();
    setIsEditingRates(false);
  };

  const handleSaveUser = async (updatedUser) => {
    await fetch('http://localhost:3000/admin/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: updatedUser.id,
            usdt: parseFloat(updatedUser.usdtBalance),
            ton: parseFloat(updatedUser.tonBalance)
        })
    });
    fetchData();
    setEditingUser(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#050507] text-gray-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0c] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-500 flex items-center justify-center shadow-lg shadow-white/5">
            <span className="font-black text-black text-xs">SW</span>
          </div>
          <div>
            <h1 className="font-bold text-white leading-none">Silver</h1>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Admin Core</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <p className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Modules</p>
          <SidebarItem icon={LayoutDashboard} label="Дашборд" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Users} label="Пользователи" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={Smartphone} label="Банковские Узлы" active={activeTab === 'nodes'} onClick={() => setActiveTab('nodes')} />
          <p className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2 mt-8">System</p>
          <SidebarItem icon={LogOut} label="Выйти" active={false} onClick={() => window.location.reload()} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#050507]/80 backdrop-blur-md flex items-center justify-between px-8 z-20 shrink-0">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
                 <span className="text-xs font-bold text-green-400">System Online</span>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <button className="relative text-gray-400 hover:text-white"><Bell size={20} /><div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050507]" /></button>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
           
           {/* === DASHBOARD === */}
           {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-4 gap-6">
                   <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"><div className="text-gray-500 text-xs font-bold uppercase mb-1">Пользователи</div><h3 className="text-2xl font-black text-white">{users.length}</h3></div>
                   <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"><div className="text-gray-500 text-xs font-bold uppercase mb-1">Курс USDT</div><h3 className="text-2xl font-black text-green-400">{rates.USDT} ₽</h3></div>
                   <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"><div className="text-gray-500 text-xs font-bold uppercase mb-1">Курс TON</div><h3 className="text-2xl font-black text-blue-400">{rates.TON} ₽</h3></div>
                   <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"><div className="text-gray-500 text-xs font-bold uppercase mb-1">Узлы</div><h3 className="text-2xl font-black text-white">4 / 5</h3></div>
                </div>

                <div className="grid grid-cols-3 gap-6 h-96">
                   <div className="col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <h3 className="font-bold text-white mb-6">Объем транзакций</h3>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={CHART_DATA}>
                            <defs><linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                            <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setIsEditingRates(true)} className="p-2 bg-blue-600 rounded-lg text-white shadow-lg"><Edit2 size={16}/></button>
                      </div>
                      <h3 className="font-bold text-white mb-4">Курсы валют</h3>
                      <div className="space-y-4 flex-1">
                         <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <div><p className="text-sm font-bold text-white">USDT / RUB</p></div>
                            <div className="text-right"><p className="font-mono font-bold text-green-400 text-lg">{rates.USDT}</p></div>
                         </div>
                         <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <div><p className="text-sm font-bold text-white">TON / RUB</p></div>
                            <div className="text-right"><p className="font-mono font-bold text-blue-400 text-lg">{rates.TON}</p></div>
                         </div>
                         <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <div><p className="text-sm font-bold text-white">USD / RUB</p></div>
                            <div className="text-right"><p className="font-mono font-bold text-gray-400 text-lg">{rates.USD_PRB}</p></div>
                         </div>
                      </div>
                      <button onClick={() => setIsEditingRates(true)} className="mt-4 w-full py-3 rounded-xl bg-blue-600/10 text-blue-400 font-bold text-sm hover:bg-blue-600/20 transition-colors">
                         Изменить курсы
                      </button>
                   </div>
                </div>
             </div>
           )}

           {/* === USERS === */}
           {activeTab === 'users' && (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black text-white">База пользователей</h2>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Telegram</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">USDT</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">TON</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Действия</th>
                         </tr>
                      </thead>
                      <tbody>
                         {users.map((user, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                               <td className="p-4 font-mono text-xs text-gray-500">{user.id}</td>
                               <td className="p-4 font-bold text-white">{user.telegramId}</td>
                               <td className="p-4 text-green-400 font-mono">{user.usdtBalance}</td>
                               <td className="p-4 text-blue-400 font-mono">{user.tonBalance}</td>
                               <td className="p-4">
                                  <button onClick={() => setEditingUser(user)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                                     <Edit2 size={16} />
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {/* === NODES === */}
           {activeTab === 'nodes' && (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-white">Банковские Модули</h2>
                   <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-bold shadow-lg shadow-blue-900/20"><Plus size={18} /> Добавить узел</button>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {MOCK_NODES.map((node) => <NodeCard key={node.id} node={node} />)}
                </div>
             </div>
           )}

        </div>
      </main>

      {/* Модалки */}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
      {isEditingRates && <EditRatesModal rates={rates} onClose={() => setIsEditingRates(false)} onSave={handleSaveRates} />}

    </div>
  );
}