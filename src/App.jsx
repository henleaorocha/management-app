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
  AlertCircle
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';

// Firebase Configuration from environment
const firebaseConfig = {
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

// Identificador estável do aplicativo
const appId = typeof __app_id !== 'undefined' ? __app_id : 'arkmeds-talent-hub-v1';

const SQUADS = [
  "Desenvolvimento Hardware",
  "Desenvolvimento MArk",
  "Desenvolvimento CMMS",
  "Desenvolvimento Sppark",
  "Desenvolvimento ArkP"
];

const App = () => {
  // --- Estados ---
  const [view, setView] = useState('login'); 
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    nome: '',
    squad: SQUADS[0],
    cargo: '',
    modeloTrabalho: 'CLT',
    senioridade: 'Júnior',
    salario: '',
    ultimaPromocao: ''
  });

  // --- 1. Autenticação Robusta (Regra 3) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Adicione esta verificação de fallback
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          // Se não houver token (como no seu localhost), ele usa o anônimo que você ativou
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Erro crítico de auth:", err);
      }
    };
    
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- 2. Sincronização em Tempo Real (Regras 1 e 2) ---
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Caminho estrito: /artifacts/{appId}/public/data/employees
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'employees');
    
    const unsubscribe = onSnapshot(colRef, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEmployees(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erro Firestore:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // --- Handlers ---
  const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const userEmail = result.user.email;

    // A TRAVA DE SEGURANÇA: Só permite o SEU e-mail
    if (userEmail === 'hen.leao.rocha@gmail.com') {
      setView('home');
      setLoginError(false);
    } else {
      // Se for outro e-mail, desloga na hora
      await auth.signOut();
      setLoginError("Acesso restrito: E-mail não autorizado.");
    }
  } catch (error) {
    console.error("Erro no login:", error);
  }
};

  const handleLogout = () => {
    setView('login');
    setPassword('');
  };

  const openModal = (emp = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({ ...emp });
    } else {
      setEditingEmployee(null);
      setFormData({
        nome: '',
        squad: SQUADS[0],
        cargo: '',
        modeloTrabalho: 'CLT',
        senioridade: 'Júnior',
        salario: '',
        ultimaPromocao: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const data = { 
      ...formData, 
      salario: Number(formData.salario), 
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingEmployee) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'employees', editingEmployee.id);
        await setDoc(docRef, data, { merge: true });
      } else {
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'employees');
        await addDoc(colRef, data);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const deleteEmployee = async (id) => {
    if (!user) return;
    if (window.confirm("Deseja excluir permanentemente este colaborador?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', id));
      } catch (err) {
        console.error("Erro ao excluir:", err);
      }
    }
  };

  // --- Cálculos ---
  const stats = useMemo(() => {
    const total = employees.length;
    const sumSalario = employees.reduce((acc, curr) => acc + (curr.salario || 0), 0);
    return { total, sumSalario };
  }, [employees]);

  const filtered = employees.filter(e => 
    e.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.squad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  
  const formatDate = (s) => {
    if (!s) return "-";
    const parts = s.includes('-') ? s.split('-') : s.split('/');
    if (parts.length !== 3) return s;
    if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return s;
  };

  const ArkmedsLogo = ({ className = "h-8" }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full fill-current">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="220 60" />
        <path d="M50 20 L80 80 L65 80 L50 50 L35 80 L20 80 Z" />
      </svg>
      <span className="font-bold tracking-tight text-xl">ARKMEDS</span>
    </div>
  );

  // --- Telas ---
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#244C5A] flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
        <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0097A9]/10 rounded-full -mr-16 -mt-16" />
          <div className="flex flex-col items-center mb-10">
            <ArkmedsLogo className="h-12 text-[#0097A9] mb-4" />
            <h2 className="text-2xl font-bold text-[#244C5A]">Admin Login</h2>
            <p className="text-slate-400 text-sm">Painel Administrativo</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                placeholder="Senha de acesso" 
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${loginError ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-[#0097A9] outline-none transition-all`}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="w-full bg-[#FFC72C] text-[#244C5A] font-bold py-4 rounded-2xl shadow-lg hover:brightness-95 transition-all">Acessar Sistema</button>
            {loginError && <p className="text-red-500 text-center text-sm font-medium">Senha incorreta.</p>}
          </form>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#F8FAFB] pb-20" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
        <nav className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm">
          <ArkmedsLogo className="text-[#0097A9]" />
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 flex items-center gap-2 font-bold transition-colors"><LogOut size={20}/> Sair</button>
        </nav>

        <main className="max-w-6xl mx-auto p-10">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[#244C5A] mb-2">Painel de Gestão</h1>
            <p className="text-slate-500 text-lg">Administração de talentos Arkmeds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-50 cursor-pointer hover:border-[#0097A9] transition-all group" onClick={() => setView('crud')}>
              <div className="w-16 h-16 bg-[#0097A9]/10 rounded-2xl flex items-center justify-center text-[#0097A9] mb-6 group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <h3 className="text-3xl font-bold text-[#244C5A]">{loading ? "..." : stats.total}</h3>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Colaboradores Cadastrados</p>
              <div className="mt-8 flex items-center text-[#0097A9] font-bold gap-2">Gerenciar Base <ArrowRight size={18}/></div>
            </div>
            
            <div className="bg-[#244C5A] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={80}/></div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-[#FFC72C] mb-6">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold">{loading ? "..." : formatCurrency(stats.sumSalario)}</h3>
              <p className="text-white/50 font-bold uppercase text-xs tracking-widest">Total da Folha Mensal</p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-12 gap-4 text-slate-400 font-medium italic">
              <Loader2 className="animate-spin" /> Sincronizando com a nuvem...
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
      
      <div className="bg-[#244C5A] text-white pt-10 pb-24 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('home')} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all shadow-inner"><LayoutDashboard/></button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Base de Talentos</h1>
              <p className="text-white/60">Registros sincronizados em tempo real</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="bg-[#FFC72C] text-[#244C5A] px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <UserPlus size={20}/> Novo Registro
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto -mt-12 px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom duration-500">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <div className="relative w-1/3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Filtrar por nome ou squad..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0097A9]/20 outline-none transition-all shadow-sm" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-[#0097A9] text-sm font-bold animate-pulse">
                <Loader2 className="animate-spin" size={16}/> SINCRO...
              </div>
            ) : (
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {filtered.length} Colaboradores Ativos
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[#244C5A] text-[10px] font-bold uppercase tracking-widest border-b">
                  <th className="px-8 py-5">Colaborador</th>
                  <th className="px-8 py-5">Squad / Cargo</th>
                  <th className="px-8 py-5">Vínculo</th>
                  <th className="px-8 py-5 text-right">Salário Nominal</th>
                  <th className="px-8 py-5 text-right">Última Promoção</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0097A9]/10 text-[#0097A9] rounded-xl flex items-center justify-center font-bold text-lg">{emp.nome?.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-[#244C5A]">{emp.nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.senioridade}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[#0097A9] font-bold text-xs mb-1">{emp.squad}</p>
                      <p className="text-slate-500 text-sm line-clamp-1">{emp.cargo}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${emp.modeloTrabalho === 'CLT' ? 'bg-[#0097A9]/10 text-[#0097A9]' : 'bg-[#FFC72C]/20 text-[#244C5A]'}`}>{emp.modeloTrabalho}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-[#244C5A]">{formatCurrency(emp.salario)}</td>
                    <td className="px-8 py-5 text-right text-sm text-slate-500 italic">{formatDate(emp.ultimaPromocao)}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(emp)} className="p-2 text-slate-400 hover:text-[#0097A9] hover:bg-[#0097A9]/10 rounded-lg transition-colors"><Edit3 size={18}/></button>
                        <button onClick={() => deleteEmployee(emp.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <AlertCircle size={40} className="opacity-20" />
                        <p className="font-medium italic">Base de dados vazia para este filtro.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#244C5A]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#0097A9] p-6 flex justify-between items-center text-white">
               <h2 className="text-xl font-bold flex items-center gap-3"><UserPlus/> {editingEmployee ? 'Editar Perfil' : 'Novo Colaborador'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Nome Completo</label>
                <input required name="nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0097A9] transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Squad</label>
                <select name="squad" value={formData.squad} onChange={e => setFormData({...formData, squad: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none">
                  {SQUADS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Cargo</label>
                <input required name="cargo" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Contrato</label>
                <select name="modeloTrabalho" value={formData.modeloTrabalho} onChange={e => setFormData({...formData, modeloTrabalho: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none">
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Senioridade</label>
                <select name="senioridade" value={formData.senioridade} onChange={e => setFormData({...formData, senioridade: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none">
                  <option value="Estagiário">Estagiário</option>
                  <option value="Júnior">Júnior</option>
                  <option value="Pleno">Pleno</option>
                  <option value="Sênior">Sênior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Salário Mensal (R$)</label>
                <input required type="number" step="0.01" value={formData.salario} onChange={e => setFormData({...formData, salario: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Data da Última Promoção</label>
                <input type="date" value={formData.ultimaPromocao} onChange={e => setFormData({...formData, ultimaPromocao: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
              </div>
            </form>

            <div className="p-8 bg-slate-50 border-t flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
              <button onClick={handleSubmit} className="flex-[2] bg-[#FFC72C] text-[#244C5A] font-bold py-4 rounded-2xl shadow-xl hover:brightness-95 transition-all">Salvar Registro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;