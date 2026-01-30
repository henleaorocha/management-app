import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  Briefcase, 
  TrendingUp, 
  ChevronRight,
  Plus,
  Lock, 
  LogOut,
  LayoutDashboard,
  Wallet,
  ArrowRight,
  Loader2,
  AlertCircle,
  Mail,
  FlaskConical,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Calendar,
  MessageSquare,
  PlusCircle,
  Clock,
  Frown,
  Meh,
  Smile,
  Laugh,
  Angry,
  History,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  GraduationCap,
  GitBranch,
  ShieldCheck,
  User,
  PieChart,
  Percent,
  Info,
  Layers,
  MinusCircle,
  Rocket,
  ChevronLeft
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

// Identifica se estamos no ambiente de Preview/Canvas
const isPreviewEnv = typeof __firebase_config !== 'undefined';

// Firebase Configuration
const firebaseConfig = isPreviewEnv 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyAWzofJhtiPHMV3wE51o_rLD7v09QEKSoQ",
      authDomain: "management-app-8d8a8.firebaseapp.com",
      projectId: "management-app-8d8a8",
      storageBucket: "management-app-8d8a8.firebasestorage.app",
      messagingSenderId: "836040173534",
      appId: "1:836040173534:web:2c8bf697e233c7111edf4f",
      measurementId: "G-4T91CHDF9X"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'arkmeds-talent-hub-v1';
const MASTER_EMAIL = 'hen.leao.rocha@gmail.com';

const SQUADS = [
  "Desenvolvimento Hardware",
  "Desenvolvimento MArk",
  "Desenvolvimento CMMS",
  "Desenvolvimento Sppark",
  "Desenvolvimento ArkP"
];

const SENTIMENTS = [
  { value: 1, icon: Angry, color: 'text-red-600', bg: 'bg-red-50', label: 'Frustrado' },
  { value: 2, icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Desmotivado' },
  { value: 3, icon: Meh, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Neutro' },
  { value: 4, icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Satisfeito' },
  { value: 5, icon: Laugh, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Muito Feliz' },
];

const App = () => {
  // Views: 'login', 'welcome', 'selection', 'home' (Budget - Empty), 'crud' (People/Talent Hub)
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isPreviewBypass, setIsPreviewBypass] = useState(false);
  const [showSalaries, setShowSalaries] = useState(false);
  const [cltChargePercent, setCltChargePercent] = useState(35);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });

  const [is1on1ModalOpen, setIs1on1ModalOpen] = useState(false);
  const [selectedEmpFor1on1, setSelectedEmpFor1on1] = useState(null);
  const [oneOnOnes, setOneOnOnes] = useState([]);
  const [loading1on1s, setLoading1on1s] = useState(false);
  const [isAdding1on1, setIsAdding1on1] = useState(false);
  const [editing1on1Id, setEditing1on1Id] = useState(null);
  
  const [form1on1, setForm1on1] = useState({
    titulo: '', decisoes: '', proximaPauta: '', sentimento: 3, data: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState({
    nome: '', email: '', cargo: '', modeloTrabalho: 'CLT', senioridade: 'Júnior', salario: '', ultimaPromocao: '', managerId: '',
    allocations: [{ squad: SQUADS[0], percent: 100 }]
  });

  const TODAY_STR = "2026-01-29";
  const TODAY = new Date(TODAY_STR + "T00:00:00");

  const isMaster = user?.email === MASTER_EMAIL;
  const currentEmployeeProfile = useMemo(() => {
    return employees.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase());
  }, [employees, user]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token).catch(() => signInAnonymously(auth));
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error(err); } finally { setAuthChecking(false); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser?.email) {
        setUser(currentUser);
        setView('welcome');
        setLoginError("");
        setIsPreviewBypass(false);
      } else if (!isPreviewBypass) {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [isPreviewBypass]);

  useEffect(() => {
    if (!user) return; 
    setLoading(true);
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'employees');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(data);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedEmpFor1on1) { setOneOnOnes([]); return; }
    setLoading1on1s(true);
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allData
        .filter(item => item.employeeId === selectedEmpFor1on1.id)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
      setOneOnOnes(filtered);
      setLoading1on1s(false);
    }, () => setLoading1on1s(false));
    return () => unsubscribe();
  }, [user, selectedEmpFor1on1]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (err) { setLoginError("Erro no SSO."); }
  };

  const handleBypass = () => {
    setIsPreviewBypass(true);
    setUser({ displayName: "Admin Master (Simulado)", email: MASTER_EMAIL });
    setView('welcome');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsPreviewBypass(false);
    setView('login');
  };

  const handleEnterHub = () => {
    if (isMaster) {
      setView('selection');
    } else {
      setView('crud'); 
    }
  };

  const openModal = (emp = null) => {
    if (emp) { 
      setEditingEmployee(emp); 
      setFormData({ 
        ...emp, 
        managerId: emp.managerId || '',
        allocations: emp.allocations || [{ squad: emp.squad || SQUADS[0], percent: 100 }]
      }); 
    } else { 
      setEditingEmployee(null); 
      setFormData({ 
        nome: '', email: '', cargo: '', modeloTrabalho: 'CLT', 
        senioridade: 'Júnior', salario: '', ultimaPromocao: '', 
        managerId: isMaster ? '' : (currentEmployeeProfile?.id || ''),
        allocations: [{ squad: SQUADS[0], percent: 100 }]
      }); 
    }
    setIsModalOpen(true);
  };

  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    const data = { ...formData, salario: Number(formData.salario), updatedAt: new Date().toISOString() };
    try {
      if (editingEmployee) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', editingEmployee.id), data, { merge: true });
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'employees'), data);
      setIsModalOpen(false);
    } catch (err) { console.error(err); }
  };

  const deleteEmployee = async (id) => {
    if (window.confirm("Excluir colaborador? Isso é irreversível.")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', id));
  };

  const open1on1History = (emp) => {
    setSelectedEmpFor1on1(emp);
    setIs1on1ModalOpen(true);
    setIsAdding1on1(false);
    setEditing1on1Id(null);
  };

  const handleStartNew1on1 = () => {
    const lastSession = oneOnOnes.length > 0 ? oneOnOnes[0] : null;
    setForm1on1({ titulo: '', decisoes: lastSession?.proximaPauta || '', proximaPauta: '', sentimento: 3, data: new Date().toISOString().split('T')[0] });
    setEditing1on1Id(null);
    setIsAdding1on1(true);
  };

  const handleEdit1on1 = (session) => {
    setForm1on1({ titulo: session.titulo || '', decisoes: session.decisoes || '', proximaPauta: session.proximaPauta || '', sentimento: session.sentimento || 3, data: session.data || '' });
    setEditing1on1Id(session.id);
    setIsAdding1on1(true);
  };

  const handleSubmit1on1 = async (e) => {
    e.preventDefault();
    const record = { ...form1on1, employeeId: selectedEmpFor1on1.id, updatedAt: new Date().toISOString() };
    try {
      if (editing1on1Id) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes', editing1on1Id), record, { merge: true });
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes'), { ...record, createdAt: new Date().toISOString() });
      setIsAdding1on1(false);
    } catch (err) { console.error(err); }
  };

  const delete1on1 = async (id) => {
    if (window.confirm("Remover 1:1?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes', id));
  };

  const addAllocation = () => {
      if (formData.allocations.length >= 5) return;
      setFormData({ ...formData, allocations: [...formData.allocations, { squad: SQUADS[0], percent: 0 }] });
  };

  const removeAllocation = (index) => {
      const newList = formData.allocations.filter((_, i) => i !== index);
      setFormData({ ...formData, allocations: newList });
  };

  const updateAllocation = (index, field, value) => {
      const newList = [...formData.allocations];
      newList[index][field] = field === 'percent' ? Number(value) : value;
      setFormData({ ...formData, allocations: newList });
  };

  const visibleEmployees = useMemo(() => {
    if (isMaster) return employees;
    if (currentEmployeeProfile) {
        return employees.filter(e => e.managerId === currentEmployeeProfile.id);
    }
    return [];
  }, [employees, isMaster, currentEmployeeProfile]);

  const calculateRealCost = (salary, model) => {
      if (model === 'CLT' || model === 'Estagiário') {
          return salary * (1 + cltChargePercent / 100);
      }
      return salary;
  };

  const sortedAndFilteredEmployees = useMemo(() => {
    let result = visibleEmployees.filter(e => {
        const matchesName = e.nome?.toLowerCase().includes(searchTerm.toLowerCase());
        const hasSquadInAllocations = e.allocations?.some(a => a.squad?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesName || hasSquadInAllocations;
    });
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = sortConfig.key === 'mesesPromocao' ? getMonthsSince(a.ultimaPromocao) : a[sortConfig.key];
        let bVal = sortConfig.key === 'mesesPromocao' ? getMonthsSince(b.ultimaPromocao) : b[sortConfig.key];
        if (typeof aVal === 'string') return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return result;
  }, [visibleEmployees, searchTerm, sortConfig]);

  const stats = useMemo(() => {
    const total = visibleEmployees.length;
    const sumCLT = visibleEmployees.filter(e => e.modeloTrabalho === 'CLT').reduce((acc, curr) => acc + calculateRealCost(curr.salario || 0, curr.modeloTrabalho), 0);
    const sumPJ = visibleEmployees.filter(e => e.modeloTrabalho === 'PJ').reduce((acc, curr) => acc + (curr.salario || 0), 0);
    const sumEstagio = visibleEmployees.filter(e => e.modeloTrabalho === 'Estagiário').reduce((acc, curr) => acc + calculateRealCost(curr.salario || 0, curr.modeloTrabalho), 0);
    const totalPayroll = sumCLT + sumPJ + sumEstagio;
    const squadMap = {};
    visibleEmployees.forEach(e => {
        const fullCost = calculateRealCost(e.salario || 0, e.modeloTrabalho);
        if (e.allocations && e.allocations.length > 0) {
            e.allocations.forEach(alloc => {
                const share = (fullCost * (alloc.percent || 0)) / 100;
                squadMap[alloc.squad] = (squadMap[alloc.squad] || 0) + share;
            });
        }
    });
    const squadStats = Object.keys(squadMap).map(name => ({
        name, total: squadMap[name], percent: totalPayroll > 0 ? (squadMap[name] / totalPayroll) * 100 : 0
    })).sort((a, b) => b.total - a.total);
    return { total, sumCLT, sumPJ, sumEstagio, totalPayroll, squadStats };
  }, [visibleEmployees, cltChargePercent]);

  const getMonthsSince = (dateStr) => {
    if (!dateStr) return 0;
    const promoDate = new Date(dateStr + "T00:00:00");
    if (isNaN(promoDate.getTime())) return 0;
    return (TODAY.getFullYear() - promoDate.getFullYear()) * 12 + (TODAY.getMonth() - promoDate.getMonth());
  };

  const formatCurrency = (v) => {
    if (!showSalaries) return "R$ ••••";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  };

  const formatDate = (s) => {
    if (!s) return "-";
    const p = s.split(s.includes('-') ? '-' : '/');
    return p.length === 3 ? (p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : s) : s;
  };

  const ArkmedsLogo = ({ className = "h-8" }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full fill-current"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" /><path d="M50 20 L80 80 L65 80 L50 50 L35 80 L20 80 Z" /></svg>
      <span className="font-bold tracking-tight text-xl">ARKMEDS</span>
    </div>
  );

  const SortableTh = ({ label, sortKey, align = 'left' }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <th className={`px-8 py-5 cursor-pointer hover:bg-[#0097A9]/5 transition-colors group ${align === 'right' ? 'text-right' : 'text-left'}`} onClick={() => {
        let direction = 'asc';
        if (isActive && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key: sortKey, direction });
      }}>
        <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
          <span className={`${isActive ? 'text-[#0097A9]' : ''}`}>{label}</span>
          <div className="flex flex-col opacity-30 group-hover:opacity-100 transition-opacity">
            {isActive && sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-[#0097A9]" /> : isActive && sortConfig.direction === 'desc' ? <ChevronDown size={14} className="text-[#0097A9]" /> : <ArrowUpDown size={14} />}
          </div>
        </div>
      </th>
    );
  };

  // --- Views rendering logic ---
  if (view === 'login' || authChecking) {
    return (
      <div className="min-h-screen bg-[#244C5A] flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
        <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl relative overflow-hidden text-center animate-in fade-in duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0097A9]/10 rounded-full -mr-16 -mt-16" />
          <div className="flex flex-col items-center mb-10">
            <ArkmedsLogo className="h-12 text-[#0097A9] mb-4" />
            <h2 className="text-2xl font-bold text-[#244C5A]">SSO Login</h2>
            <p className="text-slate-400 text-sm">Painel Administrativo Arkmeds</p>
          </div>
          <div className="space-y-4">
            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-[#244C5A] font-bold py-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-6 h-6" /> Entrar com Google
            </button>
            {isPreviewEnv && (
                <button onClick={handleBypass} className="w-full text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-[#0097A9] py-2 flex items-center justify-center gap-2 transition-all">
                  <FlaskConical size={12} /> Ignorar SSO (Bypass Preview)
                </button>
            )}
            {loginError && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs text-center font-bold italic">{loginError}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'welcome') {
      return (
          <div className="min-h-screen bg-[#244C5A] flex items-center justify-center p-8 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
              <div className="max-w-lg w-full animate-in zoom-in-95 duration-500">
                  <ArkmedsLogo className="text-white mb-12 h-16 mx-auto" />
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-12 rounded-[50px] shadow-2xl">
                      <div className="w-24 h-24 bg-[#FFC72C] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,199,44,0.4)]">
                          <Rocket size={48} className="text-[#244C5A] animate-bounce" />
                      </div>
                      <h2 className="text-4xl font-black text-white mb-4 italic">Bem-vindo!</h2>
                      <p className="text-white/60 mb-10 leading-relaxed text-lg font-medium">
                          Sua identidade foi autenticada. Clique abaixo para entrar no ecossistema de gestão da Arkmeds.
                      </p>
                      <button 
                          onClick={handleEnterHub}
                          className="w-full bg-[#FFC72C] text-[#244C5A] font-black py-6 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl uppercase tracking-tighter flex items-center justify-center gap-3"
                      >
                          Entrar no Talent Hub <ChevronRight size={24} />
                      </button>
                  </div>
                  <button onClick={handleLogout} className="mt-12 text-white/30 hover:text-white/60 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto">
                      <LogOut size={14}/> Sair da Conta
                  </button>
              </div>
          </div>
      );
  }

  if (view === 'selection' && isMaster) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-8 text-left animate-in slide-in-from-bottom-4 duration-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="max-w-4xl w-full">
            <div className="flex justify-between items-end mb-12">
                <div>
                   <ArkmedsLogo className="text-[#0097A9] mb-6 h-10" />
                   <h1 className="text-4xl font-black text-[#244C5A] mb-2">Olá, {user?.displayName.split(' ')[0]}</h1>
                   <p className="text-slate-500 text-lg font-medium">Escolha uma frente de gestão:</p>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors flex items-center gap-2 mb-2"><LogOut size={20}/> Sair</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div onClick={() => setView('home')} className="bg-white p-12 rounded-[40px] shadow-xl border-2 border-transparent hover:border-[#FFC72C] transition-all cursor-pointer group hover:-translate-y-2 duration-300">
                    <div className="w-20 h-20 bg-[#FFC72C]/10 rounded-3xl flex items-center justify-center text-[#244C5A] mb-8 group-hover:scale-110 transition-transform"><TrendingUp size={40} /></div>
                    <h3 className="text-2xl font-black text-[#244C5A] mb-4">Gestão de Orçamento</h3>
                    <p className="text-slate-400 leading-relaxed mb-8">Área de planejamento estratégico financeiro e acompanhamento de fluxo de caixa corporativo.</p>
                    <div className="flex items-center text-[#0097A9] font-black uppercase text-xs tracking-widest gap-2">Acessar Orçamento <ChevronRight size={16}/></div>
                </div>
                <div onClick={() => setView('crud')} className="bg-[#244C5A] p-12 rounded-[40px] shadow-xl border-2 border-transparent hover:border-[#0097A9] transition-all cursor-pointer group hover:-translate-y-2 duration-300 text-white">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-[#FFC72C] mb-8 group-hover:scale-110 transition-transform"><Users size={40} /></div>
                    <h3 className="text-2xl font-black mb-4">Gestão de Pessoas</h3>
                    <p className="text-white/50 leading-relaxed mb-8">Controle de talentos, rateio por squad, provisionamento de encargos e histórico de 1:1.</p>
                    <div className="flex items-center text-[#FFC72C] font-black uppercase text-xs tracking-widest gap-2">Entrar no Talent Hub <ChevronRight size={16}/></div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (view === 'home' && isMaster) {
      return (
        <div className="min-h-screen bg-[#F8FAFB] text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <nav className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-6">
                    <ArkmedsLogo className="text-[#0097A9]" />
                    <button onClick={() => setView('selection')} className="flex items-center gap-2 text-slate-400 hover:text-[#0097A9] font-bold text-sm transition-all bg-slate-50 px-4 py-2 rounded-xl">
                        <ChevronLeft size={18}/> Voltar ao Menu
                    </button>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors"><LogOut size={20}/></button>
            </nav>
            <main className="max-w-7xl mx-auto p-20 flex flex-col items-center justify-center min-h-[70vh] text-center">
                <div className="w-32 h-32 bg-slate-100 rounded-[40px] flex items-center justify-center text-slate-300 mb-8 border-4 border-dashed border-slate-200">
                    <TrendingUp size={64}/>
                </div>
                <h1 className="text-4xl font-black text-[#244C5A] mb-4">Módulo de Orçamento</h1>
                <p className="text-slate-400 text-lg max-w-md">Esta área está em desenvolvimento e será populada em breve com ferramentas de BI financeiro.</p>
            </main>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
      <nav className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-6">
              <ArkmedsLogo className="text-[#0097A9]" />
              {isMaster && (
                  <button onClick={() => setView('selection')} className="flex items-center gap-2 text-slate-400 hover:text-[#0097A9] font-bold text-sm transition-all bg-slate-50 px-4 py-2 rounded-xl">
                      <LayoutDashboard size={18}/> Menu Principal
                  </button>
              )}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSalaries(!showSalaries)} className={`p-2 rounded-xl transition-all ${showSalaries ? 'bg-[#FFC72C] text-[#244C5A]' : 'bg-slate-100 text-slate-400'}`}>
                {showSalaries ? <Eye size={20}/> : <EyeOff size={20}/>}
            </button>
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-[#244C5A]">{user?.displayName}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black">{isMaster ? "Acesso Master" : "Acesso Gestor"}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors"><LogOut size={20}/></button>
          </div>
        </nav>

      <div className="bg-[#244C5A] text-white pt-10 pb-24 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-4">
            <Users size={32} className="text-[#FFC72C]"/> Talent Hub Arkmeds
          </h1>
          <button onClick={() => openModal()} className="bg-[#FFC72C] text-[#244C5A] px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
            Novo Registro
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto -mt-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-transparent">
              <Users className="text-[#0097A9] mb-6" size={32} />
              <h3 className="text-3xl font-bold text-[#244C5A]">{loading ? "..." : stats.total}</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{isMaster ? "Total Colaboradores" : "Seu Time"}</p>
            </div>
            <div className="bg-[#0097A9] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10"><UserCheck size={80}/></div>
              <TrendingUp className="text-[#FFC72C] mb-6" size={32} />
              <div><h3 className="text-2xl font-bold">{loading ? "..." : formatCurrency(stats.sumCLT)}</h3><p className="text-white/50 font-bold uppercase text-[9px] tracking-widest">Folha CLT (Prov.)</p></div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-[#244C5A]"><Building2 size={80}/></div>
              <Wallet className="text-[#0097A9] mb-6" size={32} />
              <div><h3 className="text-2xl font-bold text-[#244C5A]">{loading ? "..." : formatCurrency(stats.sumPJ)}</h3><p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Folha PJ (Real)</p></div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-[#244C5A]"><GraduationCap size={80}/></div>
              <PlusCircle className="text-[#FFC72C] mb-6" size={32} />
              <div><h3 className="text-2xl font-bold text-[#244C5A]">{loading ? "..." : formatCurrency(stats.sumEstagio)}</h3><p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Estágios (Prov.)</p></div>
            </div>
          </div>

          <section className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 mb-12">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <div>
                   <div className="flex items-center gap-2 text-[#0097A9] mb-1 uppercase text-[10px] font-black tracking-widest"><PieChart size={14}/> Orçamentos</div>
                   <h2 className="text-2xl font-black text-[#244C5A]">Previsão Mensal por Squad</h2>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0097A9]/10 rounded-xl text-[#0097A9]"><Percent size={18}/></div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase">Encargos CLT</label>
                            <div className="flex items-center gap-2">
                                <input type="number" value={cltChargePercent} onChange={(e) => setCltChargePercent(Number(e.target.value))} className="w-16 bg-transparent font-black text-[#244C5A] outline-none border-b-2 border-transparent focus:border-[#0097A9] transition-all text-sm"/>
                                <span className="text-[#244C5A] font-bold text-sm">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Provisionado</p><p className="text-lg font-black text-[#0097A9]">{formatCurrency(stats.totalPayroll)}</p></div>
                </div>
             </div>
             <div className="space-y-6 max-w-5xl">
                   {stats.squadStats.map((s, idx) => (
                      <div key={s.name} className="group">
                         <div className="flex justify-between items-end mb-2">
                            <div><span className="text-[9px] font-black text-slate-300 uppercase mr-2">0{idx + 1}</span><span className="text-sm font-bold text-[#244C5A] group-hover:text-[#0097A9] transition-colors">{s.name}</span></div>
                            <div className="text-right"><p className="text-xs font-black text-[#244C5A]">{formatCurrency(s.total)}</p><p className="text-[9px] font-bold text-[#FFC72C]">{s.percent.toFixed(1)}%</p></div>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#0097A9] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,151,169,0.2)]" style={{ width: `${s.percent}%` }}/></div>
                      </div>
                   ))}
             </div>
          </section>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <div className="relative w-1/3"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Filtrar colaboradores..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{sortedAndFilteredEmployees.length} REGISTROS</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 text-[#244C5A] text-[10px] font-bold uppercase tracking-widest border-b"><SortableTh label="Colaborador" sortKey="nome" /><SortableTh label="Squads / Alocação" sortKey="squad" /><SortableTh label="Salário Nominal" sortKey="salario" align="right" /><SortableTh label="Meses s/ Promo" sortKey="mesesPromocao" align="right" /><th className="px-8 py-5 text-right">Ações</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAndFilteredEmployees.map(emp => {
                  const manager = employees.find(e => e.id === emp.managerId);
                  const allocations = (emp.allocations && emp.allocations.length > 0) ? emp.allocations : [{ squad: emp.squad || 'Sem Squad', percent: 100 }];
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-[#0097A9]/10 text-[#0097A9] rounded-xl flex items-center justify-center font-bold text-lg">{emp.nome?.charAt(0)}</div><div><p className="font-bold text-[#244C5A]">{emp.nome}</p><p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{emp.senioridade} • {emp.modeloTrabalho}</p>{manager && <div className="flex items-center gap-1 text-[9px] text-[#0097A9] font-black uppercase tracking-tighter"><GitBranch size={10} /> Reporta a: {manager.nome}</div>}</div></div></td>
                      <td className="px-8 py-5 text-sm"><div className="space-y-1.5">{allocations.map((a, i) => (<div key={i} className="flex items-center gap-2"><span className="text-[#0097A9] font-bold text-xs">{a.squad}</span><span className="text-slate-300 text-[9px] font-black">{a.percent}%</span></div>))}<p className="text-slate-500 text-[10px] italic pt-1 mt-1 line-clamp-1">{emp.cargo}</p></div></td>
                      <td className="px-8 py-5 text-right font-bold text-[#244C5A]">{formatCurrency(emp.salario)}</td>
                      <td className="px-8 py-5 text-right"><span className={`text-sm font-bold ${getMonthsSince(emp.ultimaPromocao) > 12 ? 'text-orange-500' : 'text-slate-700'}`}>{getMonthsSince(emp.ultimaPromocao)} meses</span></td>
                      <td className="px-8 py-5 text-right"><div className="flex justify-end gap-1">
                        <button onClick={() => open1on1History(emp)} className="p-2 text-slate-400 hover:text-[#0097A9] rounded-lg transition-all" title="Histórico de 1:1"><MessageSquare size={18}/></button>
                        {(isMaster || (currentEmployeeProfile && emp.managerId === currentEmployeeProfile.id)) && (
                            <>
                              <button onClick={() => openModal(emp)} className="p-2 text-slate-400 hover:text-[#244C5A] hover:bg-slate-200 rounded-lg" title="Editar"><Edit3 size={18}/></button>
                              <button onClick={() => deleteEmployee(emp.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 size={18}/></button>
                            </>
                        )}
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1:1 */}
      {is1on1ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#244C5A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300 text-left">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20">
            <div className="bg-[#0097A9] p-8 flex justify-between items-start text-white shrink-0"><div><div className="flex items-center gap-2 text-[#FFC72C] mb-2 uppercase text-[10px] font-black tracking-[0.2em]"><Clock size={14}/> Performance</div><h2 className="text-3xl font-black">1:1 Histórico • {selectedEmpFor1on1?.nome}</h2></div><button onClick={() => setIs1on1ModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"><X size={24}/></button></div>
            <div className="flex flex-1 overflow-hidden">
               <div className="w-1/2 border-r border-slate-100 flex flex-col bg-slate-50/30">
                  <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-white"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessões</span><button onClick={() => isAdding1on1 && !editing1on1Id ? setIsAdding1on1(false) : handleStartNew1on1()} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-[#FFC72C] text-[#244C5A] shadow-md">{isAdding1on1 ? 'Voltar' : 'Nova 1:1'}</button></div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {oneOnOnes.map((item) => {
                        const sent = SENTIMENTS.find(s => s.value === item.sentimento) || SENTIMENTS[2];
                        return (<div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group text-left"><div className="flex justify-between items-start mb-3"><div><div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold text-[#0097A9] uppercase">{formatDate(item.data)}</span></div><h4 className="font-bold text-[#244C5A] group-hover:text-[#0097A9] transition-colors">{item.titulo}</h4></div><div className={`p-2 rounded-xl ${sent.bg} ${sent.color}`} title={sent.label}><sent.icon size={18}/></div></div><div className="text-xs text-slate-600 line-clamp-2 mb-4 whitespace-pre-wrap">{item.decisoes}</div><div className="flex justify-between items-center pt-3 border-t border-slate-50"><div className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={10}/> {item.proximaPauta ? 'Pauta futura' : 'Sem pauta'}</div><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => handleEdit1on1(item)} className="p-1.5 text-slate-400 hover:text-[#0097A9] hover:bg-red-50 rounded-md"><Edit3 size={14}/></button><button onClick={() => delete1on1(id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14}/></button></div></div></div>);
                    })}
                  </div>
               </div>
               <div className="w-1/2 overflow-y-auto bg-white p-10">
                 {isAdding1on1 ? (
                   <form onSubmit={handleSubmit1on1} className="space-y-6 animate-in slide-in-from-right duration-300">
                     <h3 className="text-xl font-bold text-[#244C5A] flex items-center gap-2">{editing1on1Id ? 'Editar Sessão' : 'Registrar Conversa'}</h3>
                     <div className="grid grid-cols-2 gap-4"><div className="col-span-2"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Título</label><input required value={form1on1.titulo} onChange={e => setForm1on1({...form1on1, titulo: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9]" /></div><div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Data</label><input type="date" required value={form1on1.data} onChange={e => setForm1on1({...form1on1, data: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#0097A9]"/></div><div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Sentimento</label><div className="flex justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">{SENTIMENTS.map(s => <button key={s.value} type="button" onClick={() => setForm1on1({...form1on1, sentimento: s.value})} className={`p-2 rounded-xl transition-all ${form1on1.sentimento === s.value ? `${s.bg} ${s.color} shadow-sm scale-110` : 'text-slate-300'}`}><s.icon size={20}/></button>)}</div></div></div>
                     <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Decisões</label><textarea required value={form1on1.decisoes} onChange={e => setForm1on1({...form1on1, decisoes: e.target.value})} rows="6" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-sm resize-none"></textarea></div>
                     <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Pauta Futura</label><textarea value={form1on1.proximaPauta} onChange={e => setForm1on1({...form1on1, proximaPauta: e.target.value})} rows="3" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-sm resize-none"></textarea></div>
                     <button type="submit" className="w-full bg-[#244C5A] text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-[#0097A9] transition-all flex items-center justify-center gap-2"><Save size={20}/> {editing1on1Id ? 'Atualizar' : 'Salvar'} Registro</button>
                   </form>
                 ) : <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center"><MessageSquare size={48} className="opacity-10 mb-4"/><p className="text-sm">Selecione uma sessão ou crie uma nova.</p></div>}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FUNCIONÁRIO */}
      {isModalOpen && (isMaster || currentEmployeeProfile) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#244C5A]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left border border-white/10">
            <div className="bg-[#0097A9] p-6 flex justify-between items-center text-white shrink-0"><h2 className="text-xl font-bold flex items-center gap-3 text-left"><UserPlus/> {editingEmployee ? 'Editar' : 'Novo'} Colaborador</h2><button onClick={() => setIsModalOpen(false)}><X/></button></div>
            <form onSubmit={handleSubmitEmployee} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Nome Completo</label><input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9]" /></div>
              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-[#0097A9] block mb-2 tracking-widest">E-mail Corporativo</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-[#0097A9]/5 border-2 border-[#0097A9]/10 rounded-2xl outline-none focus:border-[#0097A9]" placeholder="Para acesso de gestor..." /></div>
              
              <div className="col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><Layers size={18} className="text-[#0097A9]"/><label className="text-[10px] font-black uppercase text-[#244C5A] tracking-widest">Squads (Max 5)</label></div>
                    <button type="button" onClick={addAllocation} disabled={formData.allocations.length >= 5} className="text-[10px] font-black uppercase text-[#0097A9] hover:bg-[#0097A9]/10 px-3 py-1.5 rounded-xl transition-all disabled:opacity-30">+ Add Squad</button>
                </div>
                <div className="space-y-3">
                    {formData.allocations.map((alloc, index) => (<div key={index} className="flex items-center gap-3 animate-in slide-in-from-left duration-200"><div className="flex-1"><select value={alloc.squad} onChange={e => updateAllocation(index, 'squad', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm">{SQUADS.map(s => <option key={s} value={s}>{s}</option>)}</select></div><div className="w-24 relative"><input type="number" value={alloc.percent} onChange={e => updateAllocation(index, 'percent', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm pr-8 font-bold text-[#0097A9]" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span></div>{formData.allocations.length > 1 && (<button type="button" onClick={() => removeAllocation(index)} className="text-slate-300 hover:text-red-500"><MinusCircle size={20}/></button>)}</div>))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-3"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Total da Alocação</span><div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${formData.allocations.reduce((sum, a) => sum + a.percent, 0) === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500 animate-pulse'}`}><span className="text-sm font-black">{formData.allocations.reduce((sum, a) => sum + a.percent, 0)}%</span>{formData.allocations.reduce((sum, a) => sum + a.percent, 0) !== 100 && <AlertCircle size={14}/>}</div></div>
              </div>

              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-[#0097A9] flex items-center gap-2 mb-2 tracking-widest"><ShieldCheck size={14}/> Gestor Direto</label><select value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} disabled={!isMaster} className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] ${!isMaster ? 'opacity-50 cursor-not-allowed' : ''}`}><option value="">Sem Gestor Direto</option>{employees.filter(e => e.id !== editingEmployee?.id).map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
              <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Cargo</label>
                    <input required value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Contrato</label>
                    <select value={formData.modeloTrabalho} onChange={e => setFormData({...formData, modeloTrabalho: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"><option value="CLT">CLT</option><option value="PJ">PJ</option><option value="Estagiário">Estagiário</option></select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Senioridade</label>
                    <select value={formData.senioridade} onChange={e => setFormData({...formData, senioridade: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none"><option value="Estagiário">Estagiário</option><option value="Júnior">Júnior</option><option value="Pleno">Pleno</option><option value="Sênior">Sênior</option><option value="Lead">Lead</option></select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Salário Nominal (R$)</label>
                    <input required type="number" step="0.01" value={formData.salario} onChange={e => setFormData({...formData, salario: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9]" />
                  </div>
              </div>
              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Data da Última Promoção</label><input type="date" value={formData.ultimaPromocao} onChange={e => setFormData({...formData, ultimaPromocao: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9]" /></div>
            </form>
            <div className="p-8 bg-slate-50 border-t flex gap-4"><button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-all">Cancelar</button><button onClick={handleSubmitEmployee} disabled={formData.allocations.reduce((sum, a) => sum + a.percent, 0) !== 100} className="flex-[2] bg-[#FFC72C] text-[#244C5A] font-bold py-4 rounded-2xl shadow-xl hover:brightness-95 transition-all disabled:opacity-30">Salvar Registro</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;