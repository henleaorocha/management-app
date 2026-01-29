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
  Info
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
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = typeof __firebase_config !== 'undefined' 
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
  // --- Estados Gerais ---
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isPreviewBypass, setIsPreviewBypass] = useState(false);
  const [showSalaries, setShowSalaries] = useState(false);
  
  // Estado para cálculo de encargos (padrão 35%)
  const [cltChargePercent, setCltChargePercent] = useState(35);
  
  // --- Estados de CRUD ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });

  // --- Estados de 1:1 ---
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
    nome: '', email: '', squad: SQUADS[0], cargo: '', modeloTrabalho: 'CLT', senioridade: 'Júnior', salario: '', ultimaPromocao: '', managerId: ''
  });

  const TODAY_STR = "2026-01-29";
  const TODAY = new Date(TODAY_STR + "T00:00:00");

  // Identifica o papel do usuário
  const isMaster = user?.email === MASTER_EMAIL;
  const currentEmployeeProfile = useMemo(() => {
    return employees.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase());
  }, [employees, user]);

  // --- 1. Autenticação ---
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
        setView('home');
        setLoginError("");
        setIsPreviewBypass(false);
      } else if (!isPreviewBypass) {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [isPreviewBypass]);

  // --- 2. Sincronização Funcionários ---
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

  // --- 3. Sincronização 1:1s ---
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

  // --- Handlers ---
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (err) { setLoginError("Erro no SSO."); }
  };

  const handleBypass = () => {
    setIsPreviewBypass(true);
    setUser({ displayName: "Admin Master (Simulado)", email: MASTER_EMAIL });
    setView('home');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsPreviewBypass(false);
    setView('login');
  };

  const openModal = (emp = null) => {
    if (emp) { setEditingEmployee(emp); setFormData({ ...emp, managerId: emp.managerId || '' }); }
    else { 
      setEditingEmployee(null); 
      setFormData({ nome: '', email: '', squad: SQUADS[0], cargo: '', modeloTrabalho: 'CLT', senioridade: 'Júnior', salario: '', ultimaPromocao: '', managerId: '' }); 
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
    if (window.confirm("Excluir colaborador?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', id));
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

  // --- Lógica de Filtro por Permissão ---
  const visibleEmployees = useMemo(() => {
    if (isMaster) return employees;
    if (currentEmployeeProfile) {
        return employees.filter(e => e.managerId === currentEmployeeProfile.id);
    }
    return [];
  }, [employees, isMaster, currentEmployeeProfile]);

  const sortedAndFilteredEmployees = useMemo(() => {
    let result = visibleEmployees.filter(e => 
      e.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.squad?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  // Função auxiliar para calcular o custo real (nominal + encargos se CLT/Estágio)
  const calculateRealCost = (salary, model) => {
      if (model === 'CLT' || model === 'Estagiário') {
          return salary * (1 + cltChargePercent / 100);
      }
      return salary; // PJ sem encargos adicionais
  };

  const stats = useMemo(() => {
    const total = visibleEmployees.length;
    
    // Cálculos provisionados (com encargos onde aplicável)
    const sumCLT = visibleEmployees
        .filter(e => e.modeloTrabalho === 'CLT')
        .reduce((acc, curr) => acc + calculateRealCost(curr.salario || 0, curr.modeloTrabalho), 0);
    
    const sumPJ = visibleEmployees
        .filter(e => e.modeloTrabalho === 'PJ')
        .reduce((acc, curr) => acc + (curr.salario || 0), 0);
    
    const sumEstagio = visibleEmployees
        .filter(e => e.modeloTrabalho === 'Estagiário')
        .reduce((acc, curr) => acc + calculateRealCost(curr.salario || 0, curr.modeloTrabalho), 0);
    
    const totalPayroll = sumCLT + sumPJ + sumEstagio;

    // Cálculo por Squad (usando custo real)
    const squadMap = {};
    visibleEmployees.forEach(e => {
        if (!squadMap[e.squad]) squadMap[e.squad] = 0;
        squadMap[e.squad] += calculateRealCost(e.salario || 0, e.modeloTrabalho);
    });

    const squadStats = Object.keys(squadMap).map(name => ({
        name,
        total: squadMap[name],
        percent: totalPayroll > 0 ? (squadMap[name] / totalPayroll) * 100 : 0
    })).sort((a, b) => b.total - a.total);

    return { total, sumCLT, sumPJ, sumEstagio, totalPayroll, squadStats };
  }, [visibleEmployees, cltChargePercent]);

  // --- Helpers Visuais ---
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

  // --- Views ---
  if (view === 'login' || authChecking) {
    return (
      <div className="min-h-screen bg-[#244C5A] flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
        <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0097A9]/10 rounded-full -mr-16 -mt-16" />
          <div className="flex flex-col items-center mb-10">
            <ArkmedsLogo className="h-12 text-[#0097A9] mb-4" />
            <h2 className="text-2xl font-bold text-[#244C5A]">SSO Login</h2>
            <p className="text-slate-400 text-sm">Painel de Liderança Arkmeds</p>
          </div>
          <div className="space-y-4">
            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-[#244C5A] font-bold py-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-6 h-6" /> Entrar com Google
            </button>
            <button onClick={handleBypass} className="w-full text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-[#0097A9] py-2 flex items-center justify-center gap-2"><FlaskConical size={12} /> Ignorar SSO (Master)</button>
            {loginError && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs text-center font-bold italic">{loginError}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Permissão negada para e-mail não listado
  if (!isMaster && !currentEmployeeProfile && !loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg text-center border border-slate-100">
           <AlertCircle className="mx-auto text-red-500 mb-6" size={64}/>
           <h2 className="text-2xl font-bold text-[#244C5A] mb-4">Acesso não autorizado</h2>
           <p className="text-slate-500 mb-8">O e-mail <strong>{user?.email}</strong> não está cadastrado como gestor na base Arkmeds.</p>
           <button onClick={handleLogout} className="bg-[#244C5A] text-white px-8 py-3 rounded-xl font-bold">Voltar ao Login</button>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#F8FAFB] text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
        <nav className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm">
          <ArkmedsLogo className="text-[#0097A9]" />
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
        <main className="max-w-7xl mx-auto p-10">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[#244C5A] mb-2">Talent Hub</h1>
            <p className="text-slate-500">{isMaster ? "Visão Geral da Organização" : `Equipe de ${user?.displayName}`}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl cursor-pointer hover:border-[#0097A9] border border-transparent transition-all group" onClick={() => setView('crud')}>
              <Users className="text-[#0097A9] mb-6" size={40} />
              <h3 className="text-3xl font-bold text-[#244C5A]">{loading ? "..." : stats.total}</h3>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{isMaster ? "Total de Colaboradores" : "Seu Time"}</p>
              <div className="mt-8 flex items-center text-[#0097A9] font-bold gap-2 text-sm">Gerenciar Base <ArrowRight size={16}/></div>
            </div>

            <div className="bg-[#244C5A] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10"><UserCheck size={80}/></div>
              <TrendingUp className="text-[#FFC72C] mb-6" size={40} />
              <div>
                <h3 className="text-2xl font-bold">{loading ? "..." : formatCurrency(stats.sumCLT)}</h3>
                <div className="flex items-center gap-1">
                   <p className="text-white/50 font-bold uppercase text-[9px] tracking-widest">Folha CLT (Provisionada)</p>
                   <Info size={10} className="text-white/30" title={`Incluindo ${cltChargePercent}% de encargos`}/>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-[#244C5A]"><Building2 size={80}/></div>
              <Wallet className="text-[#0097A9] mb-6" size={40} />
              <div>
                <h3 className="text-2xl font-bold text-[#244C5A]">{loading ? "..." : formatCurrency(stats.sumPJ)}</h3>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Folha PJ (Real)</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-[#244C5A]"><GraduationCap size={80}/></div>
              <PlusCircle className="text-[#FFC72C] mb-6" size={40} />
              <div>
                <h3 className="text-2xl font-bold text-[#244C5A]">{loading ? "..." : formatCurrency(stats.sumEstagio)}</h3>
                <div className="flex items-center gap-1">
                   <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Bolsas (Provisionadas)</p>
                   <Info size={10} className="text-slate-300" title={`Incluindo ${cltChargePercent}% de encargos`}/>
                </div>
              </div>
            </div>
          </div>

          <section className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-50 animate-in slide-in-from-bottom duration-500">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <div>
                   <div className="flex items-center gap-2 text-[#0097A9] mb-1 uppercase text-[10px] font-black tracking-widest">
                      <PieChart size={14}/> Análise Orçamentária
                   </div>
                   <h2 className="text-2xl font-black text-[#244C5A]">Previsão Mensal por Squad</h2>
                </div>
                
                {/* CONFIGURAÇÃO DE ENCARGOS */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0097A9]/10 rounded-xl text-[#0097A9]">
                            <Percent size={18}/>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Encargos CLT/Estágio</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={cltChargePercent} 
                                    onChange={(e) => setCltChargePercent(Number(e.target.value))}
                                    className="w-16 bg-transparent font-black text-[#244C5A] outline-none border-b-2 border-transparent focus:border-[#0097A9] transition-all text-sm"
                                />
                                <span className="text-[#244C5A] font-bold text-sm">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Provisionado</p>
                       <p className="text-lg font-black text-[#0097A9]">{formatCurrency(stats.totalPayroll)}</p>
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-8 max-w-4xl">
                <div className="space-y-6">
                   {stats.squadStats.length > 0 ? stats.squadStats.map((s, idx) => (
                      <div key={s.name} className="group">
                         <div className="flex justify-between items-end mb-2">
                            <div>
                               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mr-2">0{idx + 1}</span>
                               <span className="text-sm font-bold text-[#244C5A] group-hover:text-[#0097A9] transition-colors">{s.name}</span>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-[#244C5A]">{formatCurrency(s.total)}</p>
                               <p className="text-[9px] font-bold text-[#FFC72C] uppercase tracking-tighter">{s.percent.toFixed(1)}% do orçamento</p>
                            </div>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#0097A9] rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,151,169,0.3)]" 
                                style={{ width: `${s.percent}%` }}
                            />
                         </div>
                      </div>
                   )) : (
                      <div className="py-12 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        Nenhum colaborador vinculado a squads para gerar análise.
                      </div>
                   )}
                </div>
             </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
      
      {/* Header CRUD */}
      <div className="bg-[#244C5A] text-white pt-10 pb-24 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('home')} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all shadow-inner"><LayoutDashboard/></button>
            <h1 className="text-3xl font-bold tracking-tight">{isMaster ? "Base Global de Talentos" : "Meu Time"}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowSalaries(!showSalaries)} 
                className={`flex items-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all ${showSalaries ? 'bg-[#FFC72C] text-[#244C5A]' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
                {showSalaries ? <Eye size={20}/> : <EyeOff size={20}/>}
                <span className="text-xs uppercase tracking-widest">{showSalaries ? "Ocultar" : "Mostrar"} Salários</span>
            </button>
            {isMaster && <button onClick={() => openModal()} className="bg-[#FFC72C] text-[#244C5A] px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">Novo Registro</button>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto -mt-12 px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <div className="relative w-1/3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Filtrar por nome ou squad..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{sortedAndFilteredEmployees.length} REGISTROS</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[#244C5A] text-[10px] font-bold uppercase tracking-widest border-b">
                  <SortableTh label="Colaborador" sortKey="nome" />
                  <SortableTh label="Squad / Cargo" sortKey="squad" />
                  <SortableTh label="Salário Nominal" sortKey="salario" align="right" />
                  <SortableTh label="Meses s/ Promo" sortKey="mesesPromocao" align="right" />
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAndFilteredEmployees.map(emp => {
                  const manager = employees.find(e => e.id === emp.managerId);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#0097A9]/10 text-[#0097A9] rounded-xl flex items-center justify-center font-bold text-lg">{emp.nome?.charAt(0)}</div>
                          <div>
                            <p className="font-bold text-[#244C5A]">{emp.nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{emp.senioridade} • {emp.modeloTrabalho}</p>
                            {manager && <div className="flex items-center gap-1 text-[9px] text-[#0097A9] font-black uppercase tracking-tighter"><GitBranch size={10} /> Reporta a: {manager.nome}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm">
                        <p className="text-[#0097A9] font-bold mb-1">{emp.squad}</p>
                        <p className="text-slate-500 line-clamp-1">{emp.cargo}</p>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-[#244C5A]">
                          {formatCurrency(emp.salario)}
                      </td>
                      <td className="px-8 py-5 text-right">
                         <span className={`text-sm font-bold ${getMonthsSince(emp.ultimaPromocao) > 12 ? 'text-orange-500' : 'text-slate-700'}`}>{getMonthsSince(emp.ultimaPromocao)} meses</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => open1on1History(emp)} className="p-2 text-slate-400 hover:text-[#0097A9] hover:bg-[#0097A9]/10 rounded-lg transition-all" title="Histórico de 1:1"><MessageSquare size={18}/></button>
                          {isMaster && (
                            <>
                              <button onClick={() => openModal(emp)} className="p-2 text-slate-400 hover:text-[#244C5A] hover:bg-slate-200 rounded-lg" title="Editar"><Edit3 size={18}/></button>
                              <button onClick={() => deleteEmployee(emp.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 size={18}/></button>
                            </>
                          )}
                        </div>
                      </td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#244C5A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20 text-left">
            <div className="bg-[#0097A9] p-8 flex justify-between items-start text-white shrink-0">
               <div className="text-left">
                 <div className="flex items-center gap-2 text-[#FFC72C] mb-2 uppercase text-[10px] font-black tracking-[0.2em]">
                    <Clock size={14}/> Performance
                 </div>
                 <h2 className="text-3xl font-black">1:1 Histórico • <span className="text-white/80 font-medium">{selectedEmpFor1on1?.nome}</span></h2>
               </div>
               <button onClick={() => setIs1on1ModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"><X size={24}/></button>
            </div>

            <div className="flex flex-1 overflow-hidden">
               <div className="w-1/2 border-r border-slate-100 flex flex-col bg-slate-50/30">
                  <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-white">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessões</span>
                     <button onClick={() => isAdding1on1 && !editing1on1Id ? setIsAdding1on1(false) : handleStartNew1on1()} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-[#FFC72C] text-[#244C5A] shadow-md">{isAdding1on1 ? 'Voltar' : 'Nova 1:1'}</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading1on1s ? (
                      <div className="flex items-center justify-center py-20 text-slate-400 animate-pulse"><Loader2 className="animate-spin mr-2"/> Carregando...</div>
                    ) : oneOnOnes.length === 0 ? (
                      <div className="py-20 text-center text-slate-300 italic">Nenhuma 1:1 registrada ainda.</div>
                    ) : (
                      oneOnOnes.map((item) => {
                        const sent = SENTIMENTS.find(s => s.value === item.sentimento) || SENTIMENTS[2];
                        const Icon = sent.icon;
                        const isFuture = new Date(item.data + "T00:00:00") > TODAY;
                        return (
                          <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group text-left">
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-bold text-[#0097A9] uppercase">{formatDate(item.data)}</span>
                                      {isFuture && <span className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Agendada</span>}
                                   </div>
                                   <h4 className="font-bold text-[#244C5A] group-hover:text-[#0097A9] transition-colors">{item.titulo}</h4>
                                </div>
                                <div className={`p-2 rounded-xl ${sent.bg} ${sent.color}`} title={sent.label}><Icon size={18}/></div>
                             </div>
                             <div className="text-xs text-slate-600 line-clamp-2 mb-4 whitespace-pre-wrap">{item.decisoes}</div>
                             <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={10}/> {item.proximaPauta ? 'Pauta futura' : 'Sem pauta'}</div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                   <button onClick={() => handleEdit1on1(item)} className="p-1.5 text-slate-400 hover:text-[#0097A9] hover:bg-slate-50 rounded-md"><Edit3 size={14}/></button>
                                   <button onClick={() => delete1on1(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14}/></button>
                                </div>
                             </div>
                          </div>
                        );
                      })
                    )}
                  </div>
               </div>

               <div className="w-1/2 overflow-y-auto bg-white p-10 text-left">
                 {isAdding1on1 ? (
                   <form onSubmit={handleSubmit1on1} className="space-y-6 animate-in slide-in-from-right duration-300">
                     <h3 className="text-xl font-bold text-[#244C5A] flex items-center gap-2">{editing1on1Id ? 'Editar Sessão' : 'Registrar Conversa'}</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Título</label><input required value={form1on1.titulo} onChange={e => setForm1on1({...form1on1, titulo: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#0097A9]" /></div>
                        <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Data</label><input type="date" required value={form1on1.data} onChange={e => setForm1on1({...form1on1, data: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#0097A9]"/></div>
                        <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Sentimento</label><div className="flex justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">{SENTIMENTS.map(s => <button key={s.value} type="button" onClick={() => setForm1on1({...form1on1, sentimento: s.value})} className={`p-2 rounded-xl transition-all ${form1on1.sentimento === s.value ? `${s.bg} ${s.color} shadow-sm scale-110` : 'text-slate-300'}`}><s.icon size={20}/></button>)}</div></div>
                     </div>
                     <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Decisões e Notas</label><textarea required value={form1on1.decisoes} onChange={e => setForm1on1({...form1on1, decisoes: e.target.value})} rows="6" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#0097A9] text-sm resize-none"></textarea></div>
                     <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Próxima Pauta</label><textarea value={form1on1.proximaPauta} onChange={e => setForm1on1({...form1on1, proximaPauta: e.target.value})} rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0097A9] text-sm resize-none"></textarea></div>
                     <button type="submit" className="w-full bg-[#244C5A] text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-[#0097A9] transition-all flex items-center justify-center gap-2"><Save size={20}/> {editing1on1Id ? 'Atualizar' : 'Salvar'} Registro</button>
                   </form>
                 ) : <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center"><MessageSquare size={48} className="opacity-10 mb-4"/><p className="text-sm">Selecione ou crie uma nova sessão.</p></div>}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FUNCIONÁRIO (MASTER ONLY) */}
      {isModalOpen && isMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#244C5A]/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left border border-white/10">
            <div className="bg-[#0097A9] p-6 flex justify-between items-center text-white shrink-0"><h2 className="text-xl font-bold flex items-center gap-3 text-left"><UserPlus/> {editingEmployee ? 'Editar' : 'Novo'} Colaborador</h2><button onClick={() => setIsModalOpen(false)}><X/></button></div>
            <form onSubmit={handleSubmitEmployee} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Nome Completo</label><input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9]" /></div>
              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-[#0097A9] block mb-2 tracking-widest">E-mail Corporativo</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-[#0097A9]/5 border-2 border-[#0097A9]/10 rounded-2xl outline-none focus:border-[#0097A9]" placeholder="Para acesso de gestor..." /></div>
              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-[#0097A9] flex items-center gap-2 mb-2 tracking-widest"><ShieldCheck size={14}/> Gestor Direto</label><select value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9]"><option value="">Sem Gestor Direto</option>{employees.filter(e => e.id !== editingEmployee?.id).map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
              <div><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Squad</label><select value={formData.squad} onChange={e => setFormData({...formData, squad: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none">{SQUADS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Cargo</label><input required value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" /></div>
              <div><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Contrato</label><select value={formData.modeloTrabalho} onChange={e => setFormData({...formData, modeloTrabalho: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none"><option value="CLT">CLT</option><option value="PJ">PJ</option><option value="Estagiário">Estagiário</option></select></div>
              <div><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Senioridade</label><select value={formData.senioridade} onChange={e => setFormData({...formData, senioridade: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none"><option value="Estagiário">Estagiário</option><option value="Júnior">Júnior</option><option value="Pleno">Pleno</option><option value="Sênior">Sênior</option><option value="Lead">Lead</option></select></div>
              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Salário Mensal Nominal (R$)</label><input required type="number" step="0.01" value={formData.salario} onChange={e => setFormData({...formData, salario: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9]" /></div>
              <div className="col-span-2"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Data da Última Promoção</label><input type="date" value={formData.ultimaPromocao} onChange={e => setFormData({...formData, ultimaPromocao: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9]" /></div>
            </form>
            <div className="p-8 bg-slate-50 border-t flex gap-4"><button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button><button onClick={handleSubmitEmployee} className="flex-[2] bg-[#FFC72C] text-[#244C5A] font-bold py-4 rounded-2xl shadow-lg hover:brightness-95 transition-all">Salvar Registro</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;