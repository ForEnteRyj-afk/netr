import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, ArrowUpRight, RefreshCw, Wallet, History, LayoutGrid, User,
  ChevronRight, Scan, Copy, X, ChevronDown, Maximize2, Check,
  Smartphone, House, Wifi, Key, Lightbulb, Building, ChevronLeft,
  ShieldCheck, Mail, Globe, Coins, Shield,
  Smartphone as DeviceIcon, CheckCircle2, Eye, EyeOff, Flashlight, Image as ImageIcon,
  ArrowDown
} from 'lucide-react';

// --- ИМПОРТ КАРТИНОК ---
import pmrLogo from './assets/pmr_logo.png';   // Твой файл рубля
import usdtLogo from './assets/usdt_logo.png'; // Твой файл USDT

// --- ИКОНКИ ВАЛЮТ ---
const ASSET_ICONS = {
  USDT: usdtLogo, // ТЕПЕРЬ ИСПОЛЬЗУЕМ ТВОЮ КАРТИНКУ
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

// --- КОМПОНЕНТ РУБЛЯ ПМР (КАРТИНКА) ---
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
      filter: 'invert(1)' // Делает черный логотип белым (убери эту строку, если логотип уже белый)
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
  <div onClick={onClick} className="flex flex-col items-center gap-2.5 cursor-pointer group active:scale-95 transition-transform">
    <div className={`
      w-[72px] h-[72px] rounded-[26px] flex items-center justify-center transition-all duration-300 shadow-lg
      ${primary 
        ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)]' 
        : 'bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.1]'
      }
    `}>
      <Icon size={30} strokeWidth={2.5} />
    </div>
    <span className="text-[12px] font-bold text-gray-400 group-hover:text-white transition-colors">{label}</span>
  </div>
);

// --- ГЛАВНОЕ ПРИЛОЖЕНИЕ ---
export default function App() {
  const [tab, setTab] = useState('wallet');
  const [activeModal, setActiveModal] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [serviceCategory, setServiceCategory] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState({ code: 'ru', label: 'Русский', flag: '🇷🇺' });
  const [toast, setToast] = useState(null);
  const [showBalance, setShowBalance] = useState(true);

  // --- ДАННЫЕ ---
  const [userAssets, setUserAssets] = useState({ usdt: 0, ton: 0 });
  const [rates, setRates] = useState({ USDT: 1, TON: 1, USD_PRB: 1 });
  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
  const [totalBalanceRUB, setTotalBalanceRUB] = useState(0);
  const [pricesInUSD, setPricesInUSD] = useState({ USDT: 1, TON: 0 });

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
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[140vw] h-[140vw] bg-blue-600/15 rounded-full blur-[120px] animate-blob mix-blend-screen opacity-60" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[120vw] h-[120vw] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen opacity-50" />
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
                <div className="relative flex items-center justify-center">
                   
                   {/* ГЛАВНЫЙ БАЛАНС: USD */}
                   <h1 className="text-[56px] font-[900] tracking-tighter text-transparent bg-clip-text leading-none drop-shadow-2xl select-none" style={{ backgroundImage: SILVER_GRADIENT }}>
                     {showBalance ? (
                       <>${formatMoney(totalBalanceUSD).split('.')[0]}<span className="text-[32px] opacity-60">.{formatMoney(totalBalanceUSD).split('.')[1]}</span></>
                     ) : (
                       <span className="tracking-widest opacity-80">••••••</span>
                     )}
                   </h1>
                   
                   <button onClick={() => setShowBalance(!showBalance)} className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-all hover:scale-110 active:scale-95 opacity-50 hover:opacity-100">
                      {showBalance ? <Eye size={24} /> : <EyeOff size={24} />}
                   </button>
                </div>

                {/* ВТОРОСТЕПЕННЫЙ БАЛАНС: RUB (PMR) */}
                <div className="flex items-center justify-center gap-2 mt-5 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all hover:bg-white/[0.06]">
                   {showBalance ? (
                      <><span className="text-[15px] font-bold text-gray-300 tracking-wide">≈ {formatRub(totalBalanceRUB)}</span><PmrIcon size={14} className="text-gray-300 mb-[1px]" /></>
                   ) : (<span className="text-[15px] font-bold text-gray-300 tracking-widest px-2">••••••</span>)}
                </div>
              </div>
            </div>

            <div className="flex justify-between px-6 mb-10">
              <ActionButton icon={Plus} label="Пополнить" primary onClick={() => setActiveModal('deposit')} />
              <ActionButton icon={ArrowUpRight} label="Вывод" onClick={() => setActiveModal('withdraw')} />
              <ActionButton icon={RefreshCw} label="Обмен" onClick={() => setActiveModal('swap')} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end px-2 mb-2">
                 <h3 className="text-xl font-black text-white">Активы</h3>
              </div>
              
              {assetsList.map(a => (
                <div key={a.code} className="flex justify-between items-center p-5 rounded-[40px] bg-[#121214] border border-white/[0.05] active:scale-[0.98] transition-all relative overflow-hidden group hover:border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center overflow-hidden">
                       {/* ЗДЕСЬ ТЕПЕРЬ ТВОЯ КАРТИНКА USDT */}
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
                    <div className="font-black text-xl text-white tracking-wide">{showBalance ? a.amount : '••••'}</div>
                    <div className="text-[13px] font-bold text-[#4ADE80] flex items-center justify-end gap-1">
                        {showBalance ? `≈ $${a.valueUSD}` : '••••'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... ВКЛАДКИ (History, Services, Profile) - они не менялись ... */}
        {tab === 'history' && (
           <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-6 text-gray-500"><History size={48} strokeWidth={1.5} /></div>
              <h2 className="text-2xl font-black text-white mb-2">История пуста</h2>
              <p className="text-gray-500 font-medium">Транзакции появятся здесь</p>
           </div>
        )}
        {tab === 'services' && (<div className="text-center mt-20 text-gray-500">Раздел Сервисы</div>)}
        {tab === 'profile' && (<div className="text-center mt-20 text-gray-500">Раздел Профиль</div>)}

      </main>

      {/* НИЖНЕЕ МЕНЮ */}
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

      <Modal isOpen={activeModal === 'deposit'} onClose={() => setActiveModal(null)} title="Пополнение"><div className="text-white">Функция пополнения</div></Modal>
      <Modal isOpen={activeModal === 'withdraw'} onClose={() => setActiveModal(null)} title="Вывод"><div className="text-white">Функция вывода</div></Modal>
      <Modal isOpen={activeModal === 'swap'} onClose={() => setActiveModal(null)} title="Обмен"><div className="text-white">Функция обмена</div></Modal>
    </div>
  );
}