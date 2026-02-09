import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, ArrowUpRight, RefreshCw, Wallet, History, LayoutGrid, User,
  ChevronRight, Scan, Copy, X, ChevronDown, Maximize2, Check,
  Smartphone, House, Wifi, Key, Lightbulb, Building, ChevronLeft,
  ShieldCheck, Mail, Globe, Coins, Shield,
  Smartphone as DeviceIcon, CheckCircle2, Eye, EyeOff, Flashlight, Image as ImageIcon,
  ArrowDown, Info, HelpCircle, LogOut
} from 'lucide-react';

// --- ИМПОРТ КАРТИНОК ---
import pmrLogo from './assets/pmr_logo.png';
import usdtLogo from './assets/usdt_logo.png';

// --- ИКОНКИ ВАЛЮТ ---
const ASSET_ICONS = {
  USDT: usdtLogo, 
  TON: 'https://cryptologos.cc/logos/toncoin-ton-logo.svg?v=025',
  TRX: "https://cryptologos.cc/logos/tron-trx-logo.svg?v=025",
  BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025",
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025"
};

const NETWORK_ICONS = {
  'TRC20': ASSET_ICONS.TRX,
  'TON': ASSET_ICONS.TON,
  'ERC20': ASSET_ICONS.ETH,
  'BSC': ASSET_ICONS.BNB,
  'BTC': ASSET_ICONS.BTC
};

const SILVER_GRADIENT = 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)';
const HIDDEN_BALANCE = '******'; 

// --- КОМПОНЕНТ РУБЛЯ ПМР ---
const PmrIcon = ({ size = 14, className = "" }) => (
  <img 
    src={pmrLogo} 
    alt="₽"
    width={size} 
    height={size} 
    className={className} 
    style={{ 
      display: 'inline-block', 
      verticalAlign: 'middle',
      objectFit: 'contain',
      filter: 'invert(1)' 
    }} 
  />
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#121214] border-t border-white/10 rounded-t-[32px] overflow-hidden animate-in slide-in-from-bottom-full duration-300 shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h3 className="text-[22px] font-black text-white">{title}</h3>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto scrollbar-hide flex-1 pb-10">
          {children}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, primary }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-2.5 cursor-pointer group active:scale-95 transition-transform w-20">
    <div className={`
      w-[72px] h-[72px] rounded-[26px] flex items-center justify-center transition-all duration-300 shadow-lg
      ${primary 
        ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)]' 
        : 'bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.1]'
      }
    `}>
      <Icon size={30} strokeWidth={2.5} />
    </div>
    <span className="text-[12px] font-bold text-gray-400 group-hover:text-white transition-colors text-center">{label}</span>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [tab, setTab] = useState('wallet');
  const [activeModal, setActiveModal] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [serviceCategory, setServiceCategory] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState({ code: 'ru', label: 'Русский', flag: '🇷🇺' });
  const [toast, setToast] = useState(null);
  const [showBalance, setShowBalance] = useState(true);

  // --- DATA STATES ---
  const [userAssets, setUserAssets] = useState({ usdt: 0, ton: 0 });
  const [rates, setRates] = useState({ USDT: 1, TON: 1, USD_PRB: 1 });
  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
  const [totalBalanceRUB, setTotalBalanceRUB] = useState(0);
  const [pricesInUSD, setPricesInUSD] = useState({ USDT: 1, TON: 0 });

  // --- FORM STATES ---
  const [depositCrypto, setDepositCrypto] = useState('USDT');
  const [depositNetwork, setDepositNetwork] = useState('TON');
  const [withdrawAsset, setWithdrawAsset] = useState('USDT');
  const [withdrawNetwork, setWithdrawNetwork] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [swapAmount, setSwapAmount] = useState('');
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    fetch('http://localhost:3000/rates')
      .then(res => res.json())
      .then(ratesData => {
        setRates(ratesData);
        fetch('http://localhost:3000/users')
          .then(res => res.json())
          .then(userData => {
            if (userData && userData.length > 0) {
              const currentUser = userData[userData.length - 1]; 
              const usdtQty = currentUser.usdtBalance || 0;
              const tonQty = currentUser.tonBalance || 0;
              setUserAssets({ usdt: usdtQty, ton: tonQty });
              
              const tonPriceUsd = ratesData.TON / ratesData.USD_PRB;
              setPricesInUSD({ USDT: 1.00, TON: tonPriceUsd });

              const totalUsd = (usdtQty * 1) + (tonQty * tonPriceUsd);
              setTotalBalanceUSD(totalUsd);

              const totalRub = totalUsd * ratesData.USD_PRB;
              setTotalBalanceRUB(totalRub);
            }
          });
      })
      .catch(err => console.error(err));
  };

  const assetsList = [
    { 
      code: 'USDT', 
      amount: userAssets.usdt.toFixed(2), 
      valueUSD: (userAssets.usdt * 1).toFixed(2), 
      price: "$1.00",
      networks: ['TRC20','TON','ERC20','BSC'] 
    },
    { 
      code: 'TON', 
      amount: userAssets.ton.toFixed(2), 
      valueUSD: (userAssets.ton * pricesInUSD.TON).toFixed(2), 
      price: `≈ $${pricesInUSD.TON.toFixed(2)}`, 
      networks: ['TON'] 
    }
  ];

  const formatMoney = (amount) => {
    return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatRub = (amount) => {
    return Number(amount).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast('ID скопирован');
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white font-sans selection:bg-white/10 flex flex-col overflow-hidden relative">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[140vw] h-[140vw] bg-blue-600/30 rounded-full blur-[120px] animate-blob mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[120vw] h-[120vw] bg-purple-600/30 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
        <div className="absolute top-[30%] right-[30%] w-[100vw] h-[100vw] bg-pink-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
      </div>

      {toast && (
         <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-[#1A1A1D] border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={18} className="text-green-500" />
            <span className="text-sm font-bold">{toast}</span>
         </div>
      )}

      <main className="flex-1 px-5 pt-6 pb-32 overflow-y-auto scrollbar-hide relative z-10">
        {tab === 'wallet' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center py-10 relative">
              <div className="flex flex-col items-center">
                
                {/* --- MAIN BALANCE (USD) --- */}
                <div className="flex items-center justify-center w-full mb-5">
                   <h1 className="text-[56px] font-[900] tracking-tighter text-transparent bg-clip-text leading-none drop-shadow-2xl select-none text-center" style={{ backgroundImage: SILVER_GRADIENT }}>
                     {showBalance ? (
                       <>
                         ${formatMoney(totalBalanceUSD).split('.')[0]}
                         <span className="text-[32px] opacity-60">.{formatMoney(totalBalanceUSD).split('.')[1]}</span>
                       </>
                     ) : (
                       <span className="tracking-widest opacity-80 text-[56px]">{HIDDEN_BALANCE}</span>
                     )}
                   </h1>
                </div>

                {/* --- SECONDARY BALANCE (RUB) + EYE --- */}
                <div className="flex justify-center w-full relative mb-4">
                   <div className="relative flex items-center justify-center">
                      
                      <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg">
                          {showBalance ? (
                             <>
                                <span className="text-[15px] font-bold text-gray-300 tracking-wide">
                                    ≈ {formatRub(totalBalanceRUB)}
                                </span>
                                <PmrIcon size={14} className="text-gray-300 mb-[1px]" />
                             </>
                          ) : (
                             <span className="text-[15px] font-bold text-gray-300 tracking-widest px-2">{HIDDEN_BALANCE}</span>
                          )}
                      </div>

                      {/* EYE BUTTON (Absolute right) */}
                      <button 
                        onClick={() => setShowBalance(!showBalance)} 
                        className="absolute -right-14 p-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                      >
                          {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>

                   </div>
                </div>

              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between px-6 mb-10">
              <ActionButton icon={Plus} label="Пополнить" primary onClick={() => setActiveModal('deposit')} />
              <ActionButton icon={ArrowUpRight} label="Вывод" onClick={() => setActiveModal('withdraw')} />
              <ActionButton icon={RefreshCw} label="Обмен" onClick={() => setActiveModal('swap')} />
            </div>

            {/* ASSETS LIST */}
            <div className="space-y-3">
              <div className="flex justify-between items-end px-2 mb-2">
                 <h3 className="text-xl font-black text-white">Активы</h3>
              </div>
              
              {assetsList.map(a => (
                <div key={a.code} className="flex justify-between items-center p-5 rounded-[40px] bg-[#121214] border border-white/[0.05] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center overflow-hidden">
                       <img src={ASSET_ICONS[a.code]} className="w-full h-full object-cover" alt={a.code} />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="font-black text-xl text-white tracking-wide">{a.code}</div>
                      <div className="flex items-center gap-1 text-[13px] font-bold text-gray-500">
                        {a.price}
                      </div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="font-black text-xl text-white tracking-wide">{showBalance ? a.amount : HIDDEN_BALANCE}</div>
                    <div className="text-[13px] font-bold text-[#4ADE80] flex items-center justify-end gap-1">
                        {showBalance ? `≈ $${a.valueUSD}` : HIDDEN_BALANCE}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {tab === 'history' && (
           <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-6 text-gray-500"><History size={48} strokeWidth={1.5} /></div>
              <h2 className="text-2xl font-black text-white mb-2">История пуста</h2>
              <p className="text-gray-500 font-medium">Транзакции появятся здесь</p>
           </div>
        )}

        {/* --- SERVICES TAB --- */}
        {tab === 'services' && (
           <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">
              {!serviceCategory ? (
                 <>
                    <h2 className="text-3xl font-black px-2">Сервисы</h2>
                    <div className="flex flex-col gap-4">
                       <button className="w-full p-6 bg-white/[0.03] border border-white/[0.06] rounded-[32px] flex items-center gap-6 active:scale-[0.98] transition-transform">
                          <div className="w-14 h-14 rounded-[20px] bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                             <Smartphone size={28} />
                          </div>
                          <div className="text-left flex-1">
                             <span className="font-black text-xl leading-tight block">Мобильная связь</span>
                             <span className="text-xs font-bold text-gray-500 mt-1">IDC, LinkService</span>
                          </div>
                          <ChevronRight className="ml-auto text-gray-600" />
                       </button>

                       <button 
                          onClick={() => setServiceCategory('utilities')}
                          className="w-full p-6 bg-white/[0.03] border border-white/[0.06] rounded-[32px] flex items-center gap-6 active:scale-[0.98] transition-transform"
                       >
                          <div className="w-14 h-14 rounded-[20px] bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                             <House size={28} />
                          </div>
                          <div className="text-left flex-1">
                             <span className="font-black text-xl leading-tight block">Коммунальные услуги</span>
                             <span className="text-xs font-bold text-gray-500 mt-1">Свет, Вода, Газ</span>
                          </div>
                          <ChevronRight className="ml-auto text-gray-600" />
                       </button>
                    </div>
                 </>
              ) : (
                 <div className="animate-in slide-in-from-right-8 duration-300">
                    <div className="flex items-center gap-2 mb-8">
                       <button onClick={() => setServiceCategory(null)} className="p-3 -ml-2 rounded-full hover:bg-white/10 text-gray-400">
                          <ChevronLeft size={32} />
                       </button>
                       <h2 className="text-2xl font-black">Коммунальные услуги</h2>
                    </div>
                    <div className="space-y-3">
                       {[
                          { title: 'Интернет', sub: 'IDC, LinkService', icon: Wifi },
                          { title: 'Домофон', sub: 'Оплата услуг', icon: Key },
                          { title: 'ЖКУ', sub: 'Свет, Вода, Газ', icon: Lightbulb },
                          { title: 'Аренда', sub: 'Оплата помещений', icon: Building },
                       ].map((item, i) => (
                          <button key={i} className="w-full p-5 bg-white/[0.03] border border-white/[0.06] rounded-[28px] flex items-center gap-5 active:scale-[0.98] transition-transform">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white">
                                <item.icon size={24} />
                             </div>
                             <div className="text-left">
                                <div className="font-black text-lg">{item.title}</div>
                                <div className="text-xs font-bold text-gray-500">{item.sub}</div>
                             </div>
                             <ChevronRight className="ml-auto text-gray-600" />
                          </button>
                       ))}
                    </div>
                 </div>
              )}
           </div>
        )}

        {/* --- PROFILE TAB --- */}
        {tab === 'profile' && (
           <div className="space-y-8 pt-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 p-[2px]">
                       <div className="w-full h-full bg-[#121214] rounded-full flex items-center justify-center text-gray-400">
                          <User size={32} />
                       </div>
                    </div>
                    <div>
                       <h2 className="text-2xl font-black">@User</h2>
                       <p className="text-sm font-bold text-gray-500">Silver Member</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => copyToClipboard('1294022')}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 active:scale-95 transition-transform"
                 >
                    <span className="text-xs font-bold text-gray-400">ID: 1294022</span>
                    <Copy size={12} className="text-gray-500" />
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-[28px]">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-3">
                       <ShieldCheck size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-500 mb-1">Верификация</p>
                    <p className="font-black text-white">Пройдена ›</p>
                 </div>
                 <div className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-[28px]">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-3">
                       <Mail size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-500 mb-1">Email</p>
                    <p className="font-black text-white">Добавить ›</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-4">Предпочтения</p>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] overflow-hidden">
                       <button 
                          onClick={() => setShowLanguageModal(true)}
                          className="w-full p-5 flex items-center gap-4 hover:bg-white/5 border-b border-white/5"
                       >
                          <Globe className="text-blue-400" size={22} />
                          <span className="font-bold text-base">Язык</span>
                          <div className="ml-auto flex items-center gap-2">
                             <span className="text-sm font-medium text-gray-400">{language.label}</span>
                             <ChevronRight size={20} className="text-gray-600" />
                          </div>
                       </button>
                       <button className="w-full p-5 flex items-center gap-4 hover:bg-white/5">
                          <Coins className="text-blue-400" size={22} />
                          <span className="font-bold text-base">Валюта</span>
                          <div className="ml-auto flex items-center gap-2">
                             <span className="text-sm font-medium text-gray-400">RUB</span>
                             <ChevronRight size={20} className="text-gray-600" />
                          </div>
                       </button>
                    </div>
                 </div>

                 <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-4">Параметры</p>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] overflow-hidden">
                       <button className="w-full p-5 flex items-center gap-4 hover:bg-white/5 border-b border-white/5">
                          <Shield className="text-blue-400" size={22} />
                          <span className="font-bold text-base">Безопасность</span>
                          <ChevronRight size={20} className="ml-auto text-gray-600" />
                       </button>
                       <button className="w-full p-5 flex items-center gap-4 hover:bg-white/5">
                          <DeviceIcon className="text-blue-400" size={22} />
                          <span className="font-bold text-base">Устройства</span>
                          <div className="ml-auto flex items-center gap-2">
                             <span className="text-sm font-medium text-gray-400">2</span>
                             <ChevronRight size={20} className="text-gray-600" />
                          </div>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </main>

      {/* FOOTER NAV */}
      <div className="fixed bottom-0 left-0 right-0 p-5 z-50">
        <div className="relative flex justify-between items-end bg-[#1A1A1D] rounded-[40px] px-2 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 h-[76px]">
          <button onClick={() => setTab('wallet')} className={`flex flex-col items-center justify-end pb-1 gap-1 flex-1 h-full transition-all active:scale-95 group ${tab === 'wallet' ? 'text-white' : 'text-gray-500'}`}>
             <Wallet size={24} strokeWidth={tab === 'wallet' ? 2.5 : 2} className="group-hover:text-white transition-colors" /><span className="text-[10px] font-bold tracking-wide">Главная</span>
          </button>
          <button onClick={() => setTab('history')} className={`flex flex-col items-center justify-end pb-1 gap-1 flex-1 h-full transition-all active:scale-95 group ${tab === 'history' ? 'text-white' : 'text-gray-500'}`}>
             <History size={24} strokeWidth={tab === 'history' ? 2.5 : 2} className="group-hover:text-white transition-colors" /><span className="text-[10px] font-bold tracking-wide">История</span>
          </button>
          <div className="relative flex flex-col items-center justify-end flex-1 h-full">
             <div className="absolute -top-[34px]">
                <button onClick={() => setShowScanner(true)} className="bg-white text-black rounded-full w-[64px] h-[64px] flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.3)] active:scale-90 transition-transform"><Scan size={30} strokeWidth={2.5} /></button>
             </div>
             <span className="text-[10px] font-bold tracking-wide text-white pb-1 whitespace-nowrap">QR оплата</span>
          </div>
          <button onClick={() => setTab('services')} className={`flex flex-col items-center justify-end pb-1 gap-1 flex-1 h-full transition-all active:scale-95 group ${tab === 'services' ? 'text-white' : 'text-gray-500'}`}>
             <LayoutGrid size={24} strokeWidth={tab === 'services' ? 2.5 : 2} className="group-hover:text-white transition-colors" /><span className="text-[10px] font-bold tracking-wide">Сервисы</span>
          </button>
          <button onClick={() => setTab('profile')} className={`flex flex-col items-center justify-end pb-1 gap-1 flex-1 h-full transition-all active:scale-95 group ${tab === 'profile' ? 'text-white' : 'text-gray-500'}`}>
             <User size={24} strokeWidth={tab === 'profile' ? 2.5 : 2} className="group-hover:text-white transition-colors" /><span className="text-[10px] font-bold tracking-wide">Профиль</span>
          </button>
        </div>
      </div>

      {/* === MODALS (Standard) === */}
      {/* (Included in the full code block, same logic as before but using HIDDEN_BALANCE if needed) */}
      <Modal isOpen={activeModal === 'deposit'} onClose={() => setActiveModal(null)} title="Пополнение">
         <div className="space-y-8">
            <div>
               <p className="text-[11px] font-black text-gray-500 uppercase mb-4 ml-2 tracking-widest">Выберите криптовалюту</p>
               <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.keys(ASSET_ICONS).slice(0, 2).map(coin => (
                     <button key={coin} onClick={() => setDepositCrypto(coin)} className={`relative flex flex-col items-start gap-3 p-5 rounded-[28px] min-w-[120px] border-[2px] transition-all duration-300 ${depositCrypto === coin ? 'bg-white/[0.08] border-[#007AFF] shadow-lg' : 'bg-white/[0.03] border-transparent'}`}>
                        <img src={ASSET_ICONS[coin]} className="w-10 h-10 object-contain" />
                        <div className="flex flex-col items-start mt-2"><span className="font-black text-lg">{coin}</span><span className="text-xs font-bold text-gray-400">0 {coin}</span></div>
                     </button>
                  ))}
               </div>
            </div>
            <div>
               <p className="text-[11px] font-black text-gray-500 uppercase mb-4 ml-2 tracking-widest">Выберите сеть</p>
               <div className="space-y-3">
                  {assetsList.find(a => a.code === depositCrypto)?.networks.map(net => (
                     <button key={net} onClick={() => setDepositNetwork(net)} className={`w-full p-5 rounded-[28px] flex items-center justify-between border-[2px] transition-all ${depositNetwork === net ? 'bg-white/[0.08] border-transparent' : 'bg-white/[0.02] border-transparent'}`}>
                        <div className="flex items-center gap-5"><div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${depositNetwork === net ? 'bg-white text-black' : 'bg-white/10'}`}><img src={NETWORK_ICONS[net]} className="w-full h-full object-cover scale-110" /></div><div className="text-left"><p className="font-black text-lg">{net}</p><p className="text-xs font-bold text-gray-500">Комиссия до {net === 'TON' ? '0.0' : '2.75'} {depositCrypto}</p></div></div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${depositNetwork === net ? 'bg-[#007AFF]' : 'bg-white/10'}`}>{depositNetwork === net && <Check size={16} strokeWidth={4} />}</div>
                     </button>
                  ))}
               </div>
            </div>
            <button className="w-full py-5 bg-[#007AFF] text-white font-black text-lg rounded-[28px] shadow-lg active:scale-[0.98] transition-all">Продолжить</button>
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'withdraw'} onClose={() => setActiveModal(null)} title="Вывод средств">
         <div className="space-y-6 pt-2">
            <div className="flex bg-white/5 p-1 rounded-[20px]">{['USDT', 'TON'].map(asset => (<button key={asset} onClick={() => setWithdrawAsset(asset)} className={`flex-1 py-3 rounded-[16px] text-sm font-black transition-all ${withdrawAsset === asset ? 'bg-white text-black shadow-lg' : 'text-gray-500'}`}>{asset}</button>))}</div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-6 space-y-4">
               <div className="flex justify-between items-center"><span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Адрес</span><div className="flex gap-3"><button className="p-2 bg-white/5 rounded-xl text-white"><Scan size={20}/></button><button className="p-2 bg-white/5 rounded-xl text-white"><Maximize2 size={20}/></button></div></div>
               <textarea value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} placeholder="Вставьте адрес" className="w-full bg-transparent text-white font-bold text-lg placeholder:text-gray-700 focus:outline-none resize-none h-16"/>
            </div>
            <div className="relative">
                <button onClick={() => setShowNetworkSelect(!showNetworkSelect)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-5 flex items-center justify-between active:bg-white/[0.05]">
                    <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">{withdrawNetwork ? <img src={NETWORK_ICONS[withdrawNetwork]} className="w-full h-full object-cover" /> : <LayoutGrid size={24} className="text-gray-500" />}</div><div className="text-left"><p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Сеть</p><p className={`font-black text-lg ${withdrawNetwork ? 'text-white' : 'text-gray-600'}`}>{withdrawNetwork || "Выберите сеть"}</p></div></div>
                    <ChevronDown className={`text-gray-500 transition-transform ${showNetworkSelect ? 'rotate-180' : ''}`} />
                </button>
                {showNetworkSelect && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1E] border border-white/10 rounded-[28px] overflow-hidden z-20 shadow-2xl animate-in fade-in slide-in-from-top-2">
                      {assetsList.find(a => a.code === withdrawAsset)?.networks.map(net => (
                         <button key={net} onClick={() => { setWithdrawNetwork(net); setShowNetworkSelect(false); }} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 border-b border-white/5 last:border-0"><img src={NETWORK_ICONS[net]} className="w-8 h-8 rounded-full" /><div className="text-left"><p className="font-bold">{net}</p></div>{withdrawNetwork === net && <Check size={16} className="ml-auto text-blue-500" />}</button>
                      ))}
                   </div>
                )}
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-6 flex justify-between items-center"><div><p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Сумма</p><input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="bg-transparent text-3xl font-black text-white placeholder:text-gray-700 focus:outline-none w-32"/></div><button className="px-4 py-2 bg-white/10 rounded-[14px] text-sm font-bold text-blue-400">Max</button></div>
            <button className="w-full py-5 bg-white text-black font-black text-lg rounded-[28px] shadow-lg active:scale-[0.98] transition-all">Вывести</button>
         </div>
      </Modal>

      <Modal isOpen={activeModal === 'swap'} onClose={() => setActiveModal(null)} title="Обмен крипто">
         <div className="space-y-4 pt-2">
            <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><img src={ASSET_ICONS.USDT} className="w-32 h-32"/></div>
               <div className="flex justify-between items-center mb-6 relative z-10"><span className="text-[12px] font-black text-gray-500 uppercase tracking-wide">Вы отдаете</span><div className="flex items-center gap-3 bg-black/40 pl-3 pr-4 py-2 rounded-full border border-white/5"><img src={ASSET_ICONS.USDT} className="w-6 h-6"/><span className="font-black text-base">USDT</span><ChevronDown size={16} className="text-gray-500"/></div></div>
               <div className="flex justify-between items-end relative z-10"><input type="number" placeholder="0" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} className="bg-transparent text-4xl font-black placeholder:text-gray-700 focus:outline-none w-2/3"/><button className="text-[#007AFF] text-sm font-black bg-blue-500/10 px-3 py-1 rounded-lg mb-1">MAX</button></div>
               <div className="flex justify-between mt-6 text-[12px] text-gray-500 font-bold border-t border-white/5 pt-4 relative z-10"><span>Баланс: {userAssets.usdt}</span><span className="text-white">1 USDT ≈ {pricesInUSD.TON ? (1 / pricesInUSD.TON).toFixed(4) : '...'} TON</span></div>
            </div>
            <div className="flex justify-center -my-5 relative z-20"><div className="w-12 h-12 bg-[#2C2C2E] border-[4px] border-[#121214] rounded-full flex items-center justify-center text-white shadow-xl"><ArrowDown size={22} strokeWidth={3}/></div></div>
            <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><img src={ASSET_ICONS.TON} className="w-32 h-32"/></div>
               <div className="flex justify-between items-center mb-6 relative z-10"><span className="text-[12px] font-black text-gray-500 uppercase tracking-wide">Вы получаете</span><div className="flex items-center gap-3 bg-black/40 pl-3 pr-4 py-2 rounded-full border border-white/5"><img src={ASSET_ICONS.TON} className="w-6 h-6"/><span className="font-black text-base">TON</span><ChevronDown size={16} className="text-gray-500"/></div></div>
               <div className="flex items-center relative z-10"><span className="text-4xl font-black text-gray-600">~ 0.00</span></div>
            </div>
            <button className="w-full py-5 bg-white text-black font-black text-lg rounded-[28px] mt-4 shadow-lg active:scale-[0.98] transition-all">Обменять</button>
         </div>
      </Modal>

      <Modal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} title="Выберите язык">
          <div className="space-y-2">
              {[ { code: 'ru', label: 'Русский', flag: '🇷🇺' }, { code: 'ro', label: 'Румынский', flag: '🇲🇩' }, { code: 'en', label: 'Английский', flag: '🇺🇸' } ].map(lang => (
                  <button key={lang.code} onClick={() => { setLanguage(lang); setShowLanguageModal(false); }} className="w-full p-4 flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-[24px] active:scale-[0.98] transition-transform"><span className="text-2xl">{lang.flag}</span><span className="font-black text-white">{lang.label}</span>{language.code === lang.code && <Check className="ml-auto text-blue-500" size={20} />}</button>
              ))}
          </div>
      </Modal>

      {showScanner && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-6 pt-12 absolute top-0 w-full z-20"><button onClick={() => setShowScanner(false)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white"><X size={24}/></button><span className="text-lg font-black tracking-wide">Сканировать QR</span><button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white"><Flashlight size={24}/></button></div>
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gray-900"><div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"/></div>
               <div className="relative w-72 h-72 rounded-[32px] border-[2px] border-white/30 z-10 overflow-hidden">
                  <div className="absolute inset-0 border-[4px] border-white rounded-[30px] opacity-50"/>
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-[6px] border-l-[6px] border-[#007AFF] rounded-tl-[20px] -mt-[2px] -ml-[2px]"/>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-[6px] border-r-[6px] border-[#007AFF] rounded-tr-[20px] -mt-[2px] -mr-[2px]"/>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[6px] border-l-[6px] border-[#007AFF] rounded-bl-[20px] -mb-[2px] -ml-[2px]"/>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[6px] border-r-[6px] border-[#007AFF] rounded-br-[20px] -mb-[2px] -mr-[2px]"/>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#007AFF] shadow-[0_0_20px_rgba(0,122,255,0.8)] animate-scan-line"/>
               </div>
               <p className="absolute bottom-32 text-gray-300 font-bold text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">Наведите камеру на QR-код</p>
            </div>
            <div className="h-32 bg-black/80 backdrop-blur-xl flex items-center justify-center gap-12 pb-8">
               <div className="flex flex-col items-center gap-2 opacity-50"><div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"><History size={24}/></div><span className="text-[10px] font-bold">История</span></div>
               <button className="w-20 h-20 bg-white rounded-full border-[6px] border-gray-300 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-transform"><div className="w-16 h-16 bg-white border-[2px] border-black rounded-full"/></button>
               <div className="flex flex-col items-center gap-2"><button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform hover:bg-white/20"><ImageIcon size={24}/></button><span className="text-[10px] font-bold">Галерея</span></div>
            </div>
        </div>
      )}
    </div>
  );
}
