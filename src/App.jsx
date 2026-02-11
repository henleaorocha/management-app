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
  ChevronLeft,
  ListFilter,
  CheckCircle2,
  Circle,
  DollarSign,
  FileText,
  Target,
  BarChart3,
  Globe2,
  Filter,
  ArrowDownWideNarrow,
  BarChart2,
  Settings
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
  updateDoc,
  getDoc
} from 'firebase/firestore';

// Identifica se estamos no ambiente de Preview/Canvas
const isPreviewEnv = typeof __firebase_config !== 'undefined';

// Firebase Configuration
const firebaseConfig = isPreviewEnv 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
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

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const BUDGET_STATUS = ["Orçado", "Realizado", "Cancelado", "Extra"];

const DEPARTMENTS = ["ArkP", "CMMS", "Embark", "MArk", "Sppark"];

const CURRENCIES = [
  { value: 'BRL', label: 'Real (R$)', locale: 'pt-BR' },
  { value: 'USD', label: 'Dólar ($)', locale: 'en-US' }
];

const EXPENSE_TYPES = [
  "Custos de Produção",
  "Despesas Administrativas",
  "Despesas Bancárias",
  "Despesas com Equipe",
  "Despesas com Manutenção",
  "Despesas com Marketing",
  "Despesas com P&D - Prototipação",
  "Despesas Correntes",
  "Despesas Financeiras",
  "Despesas Operacionais",
  "Investimentos Estratégicos"
];

const CATEGORIES = [
  "13º Salário",
  "Adiantamento",
  "Assistência Médica - Coparticipação",
  "Assistência Médica - Mensalidade",
  "Assistência Odontológica",
  "Assistência Psicológica",
  "Bonificações",
  "Brindes",
  "Comissões",
  "Compra de Serviços",
  "Compras de Materia Prima",
  "Compras Diversas para Revenda",
  "Compras para Manutenção de Equipamentos",
  "Compras para Prototipação",
  "Comunicação",
  "Confraternizações",
  "Contratações",
  "Cursos e Treinamentos",
  "Despesas de Viagens",
  "Despesas Diversas",
  "Equipamentos de Informática",
  "Equipamentos para Testes",
  "Feiras e Eventos",
  "Férias",
  "FGTS",
  "Fretes - Compras",
  "Fretes - Correios",
  "INSS + IRRF",
  "Licenças de Software - Anual",
  "Licenças de Software - Mensal",
  "Locação de Veículos",
  "Manutenção de Imobilizado",
  "Máquinas e Equipamentos",
  "Material de Uso e Consumo",
  "Móveis e Utensílios",
  "Multibenefícios",
  "Nacionalização das Importações - Numérários",
  "Outros Benefícios",
  "Pensão Alimentícia",
  "Plataformas Online",
  "PLR",
  "Prestador de Serviço - PJ",
  "Publicidade Online",
  "Reajustes Saláriais",
  "Rescisões",
  "Salários",
  "Seguro de Vida",
  "Seguros Diversos",
  "Serviços de Calibração",
  "Serviços de Hospedagem de Servidores",
  "Serviços Gráficos",
  "Telefonia",
  "Transportes por Aplicativos (Uber, 99, Lalamove)",
  "Vale Transporte",
  "Visita à clientes locais"
];

const FIXED_EXCHANGE_RATE = 5.5; 

const SENTIMENTS = [
  { value: 1, icon: Angry, color: 'text-red-600', bg: 'bg-red-50', label: 'Frustrado' },
  { value: 2, icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Desmotivado' },
  { value: 3, icon: Meh, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Neutro' },
  { value: 4, icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Satisfeito' },
  { value: 5, icon: Laugh, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Muito Feliz' },
];

// --- Componentes de UI ---
const ArkmedsLogo = ({ className = "h-8" }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-[#0097A9] rounded-lg flex items-center justify-center text-white font-black text-xl">A</div>
        <span className="font-black tracking-tighter text-xl text-inherit">ARKMEDS</span>
    </div>
);

// Componente de Gráfico de Barras Customizado
const BudgetBarChart = ({ data, maxValue }) => {
  return (
    <div className="w-full h-64 flex items-end justify-between gap-2 mt-6">
      {data.map((item, index) => {
        const heightPrev = maxValue > 0 ? (item.previsto / maxValue) * 100 : 0;
        const heightReal = maxValue > 0 ? (item.realizado / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="flex flex-col items-center flex-1 group relative h-full justify-end">
            {/* Tooltip on Hover */}
            <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-max pointer-events-none shadow-xl">
              <p className="font-bold uppercase tracking-widest mb-1 text-slate-400">{item.mes}</p>
              <p className="text-[#FFC72C]">Prev: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.previsto)}</p>
              <p className="text-[#0097A9]">Real: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.realizado)}</p>
            </div>

            <div className="flex gap-1 w-full justify-center items-end h-full px-1">
                {/* Barra Previsto */}
                <div 
                    className="w-1/2 bg-[#FFC72C] rounded-t-md transition-all duration-500 hover:brightness-110 relative min-h-[4px]"
                    style={{ height: `${Math.max(heightPrev, 1)}%` }}
                ></div>
                {/* Barra Realizado */}
                <div 
                    className="w-1/2 bg-[#0097A9] rounded-t-md transition-all duration-500 hover:brightness-110 relative min-h-[4px]"
                    style={{ height: `${Math.max(heightReal, 1)}%` }}
                ></div>
            </div>
            
            <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter truncate w-full text-center">
              {item.mes.substring(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const App = () => {
  // --- Estados ---
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  
  // States - Talent Hub
  const [employees, setEmployees] = useState([]);
  const [globalOneOnOnes, setGlobalOneOnOnes] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // States - Orçamento
  const [budgetItems, setBudgetItems] = useState([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    titulo: '',
    descricao: '', 
    selectedMonths: [],
    status: 'Orçado',
    valorPrevisto: '',
    valorRealizado: '',
    moeda: 'BRL',
    tipoDespesa: EXPENSE_TYPES[0],
    categoria: CATEGORIES[0],
    allocations: [{ department: DEPARTMENTS[0], percent: 100 }],
    confidencial: false
  });

  // Filtros e Ordenação de Orçamento
  const [budgetFilterMonth, setBudgetFilterMonth] = useState('');
  const [budgetFilterDept, setBudgetFilterDept] = useState('');
  const [budgetFilterStatus, setBudgetFilterStatus] = useState('');
  const [budgetSortConfig, setBudgetSortConfig] = useState({ key: 'mes', direction: 'asc' });

  // Gestão de Permissões de Orçamento
  const [deptManagers, setDeptManagers] = useState({});
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedDeptForConfig, setSelectedDeptForConfig] = useState(DEPARTMENTS[0]);
  const [newManagerEmail, setNewManagerEmail] = useState('');

  // Common States
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
  const [loading1on1s, setLoading1on1s] = useState(false);
  const [isAdding1on1, setIsAdding1on1] = useState(false);
  const [editing1on1Id, setEditing1on1Id] = useState(null);
  
  const [form1on1, setForm1on1] = useState({
    employeeId: '',
    titulo: '', 
    decisoes: '', 
    proximaPauta: '', 
    sentimento: 3, 
    status: 'Agendada',
    data: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState({
    nome: '', email: '', cargo: '', modeloTrabalho: 'CLT', senioridade: 'Júnior', salario: '', ultimaPromocao: '', managerId: '',
    allocations: [{ squad: SQUADS[0], percent: 100 }]
  });

  // --- Constantes ---
  const TODAY_STR = new Date().toISOString().split('T')[0]; 
  const TODAY = new Date(TODAY_STR + "T00:00:00");

  // --- Helpers ---
  const getMonthsSince = (dateStr) => {
    if (!dateStr) return 0;
    const promoDate = new Date(dateStr + "T00:00:00");
    if (isNaN(promoDate.getTime())) return 0;
    return (TODAY.getFullYear() - promoDate.getFullYear()) * 12 + (TODAY.getMonth() - promoDate.getMonth());
  };

  const calculateRealCost = (salary, model) => {
    const s = Number(salary) || 0;
    if (model === 'CLT' || model === 'Estagiário') return s * (1 + Number(cltChargePercent) / 100);
    return s;
  };

  const formatCurrency = (v, currencyCode = 'BRL') => {
    if (!showSalaries && view !== 'home') return `${currencyCode === 'USD' ? '$' : 'R$'} ••••`;
    const locale = currencyCode === 'USD' ? 'en-US' : 'pt-BR';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(v || 0);
  };

  const formatDate = (s) => {
    if (!s) return "-";
    const p = s.split(s.includes('-') ? '-' : '/');
    return p.length === 3 ? (p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : s) : s;
  };

  // --- Memos ---
  const isMaster = useMemo(() => isPreviewBypass || user?.email?.toLowerCase() === MASTER_EMAIL.toLowerCase(), [user, isPreviewBypass]);

  // Memo para verificar se o usuário é gestor de algum departamento
  const isDeptManager = useMemo(() => {
    if (!user || !deptManagers) return false;
    return Object.values(deptManagers).some(emails => 
      Array.isArray(emails) && emails.map(e => e.toLowerCase()).includes(user.email?.toLowerCase())
    );
  }, [user, deptManagers]);

  // Memo para obter a lista de departamentos que o usuário logado gerencia
  const myManagedDepts = useMemo(() => {
    if (isMaster) return DEPARTMENTS; // Master gerencia tudo
    const myDepts = [];
    Object.entries(deptManagers).forEach(([dept, emails]) => {
      if (emails && Array.isArray(emails) && emails.map(e => e.toLowerCase()).includes(user?.email?.toLowerCase())) {
        myDepts.push(dept);
      }
    });
    return myDepts;
  }, [user, deptManagers, isMaster]);

  const specificOneOnOnes = useMemo(() => {
    if (!selectedEmpFor1on1) return [];
    return globalOneOnOnes
        .filter(s => s.employeeId === selectedEmpFor1on1.id)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [globalOneOnOnes, selectedEmpFor1on1]);
  
  const currentEmployeeProfile = useMemo(() => {
    return employees.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase());
  }, [employees, user]);

  const visibleEmployees = useMemo(() => {
    if (isMaster || isPreviewBypass) return employees;
    if (currentEmployeeProfile) return employees.filter(e => e.managerId === currentEmployeeProfile.id);
    return [];
  }, [employees, isMaster, isPreviewBypass, currentEmployeeProfile]);

  const sortedAndFilteredEmployees = useMemo(() => {
    let result = visibleEmployees.filter(e => 
        e.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.allocations?.some(a => a.squad?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = sortConfig.key === 'mesesPromocao' ? getMonthsSince(a.ultimaPromocao) : a[sortConfig.key];
        let bVal = sortConfig.key === 'mesesPromocao' ? getMonthsSince(b.ultimaPromocao) : b[sortConfig.key];
        if (typeof aVal === 'string') return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return sortConfig.direction === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
      });
    }
    return result;
  }, [visibleEmployees, searchTerm, sortConfig]);

  const stats = useMemo(() => {
    const total = visibleEmployees.length;
    const sumCLT = visibleEmployees.filter(e => e.modeloTrabalho === 'CLT').reduce((acc, curr) => acc + calculateRealCost(curr.salario, curr.modeloTrabalho), 0);
    const sumPJ = visibleEmployees.filter(e => e.modeloTrabalho === 'PJ').reduce((acc, curr) => acc + Number(curr.salario || 0), 0);
    const sumEstagio = visibleEmployees.filter(e => e.modeloTrabalho === 'Estagiário').reduce((acc, curr) => acc + calculateRealCost(curr.salario, curr.modeloTrabalho), 0);
    const totalPayroll = sumCLT + sumPJ + sumEstagio;
    
    const squadMap = {};
    visibleEmployees.forEach(e => {
        const fullCost = calculateRealCost(e.salario, e.modeloTrabalho);
        if (e.allocations && e.allocations.length > 0) {
            e.allocations.forEach(alloc => {
                const share = (fullCost * (Number(alloc.percent) || 0)) / 100;
                squadMap[alloc.squad] = (squadMap[alloc.squad] || 0) + share;
            });
        } else if (e.squad) {
            squadMap[e.squad] = (squadMap[e.squad] || 0) + fullCost;
        } else {
            squadMap['Não Atribuído'] = (squadMap['Não Atribuído'] || 0) + fullCost;
        }
    });
    
    const squadStats = Object.keys(squadMap).map(name => ({
        name, total: squadMap[name], percent: totalPayroll > 0 ? (squadMap[name] / totalPayroll) * 100 : 0
    })).sort((a, b) => b.total - a.total);
    
    return { total, sumCLT, sumPJ, sumEstagio, totalPayroll, squadStats };
  }, [visibleEmployees, cltChargePercent]);

  const oneOnOneModuleData = useMemo(() => {
      const myEmployeesIds = visibleEmployees.map(e => e.id);
      const relevantSessions = globalOneOnOnes
        .filter(s => myEmployeesIds.includes(s.employeeId))
        .sort((a, b) => new Date(b.data) - new Date(a.data));
      
      const todaySessions = relevantSessions.filter(s => s.data === TODAY_STR);
      return { relevantSessions, todaySessions };
  }, [globalOneOnOnes, visibleEmployees, TODAY_STR]);

  const filteredBudgetItems = useMemo(() => {
    let items = budgetItems.filter(item => {
      // 1. Filtro de Segurança / Row-Level Security
      if (!isMaster) {
        // Verifica se o item pertence a um departamento que o usuário gerencia
        let belongsToMyDept = false;
        if (item.allocations && item.allocations.length > 0) {
          belongsToMyDept = item.allocations.some(a => myManagedDepts.includes(a.department));
        } else {
          belongsToMyDept = myManagedDepts.includes(item.departamento);
        }
        if (!belongsToMyDept) return false;
      }

      // 2. Filtros Normais de UI
      const matchMonth = budgetFilterMonth ? item.mes === budgetFilterMonth : true;
      const matchStatus = budgetFilterStatus ? item.status === budgetFilterStatus : true;
      
      let matchDept = true;
      if (budgetFilterDept) {
        if (item.allocations && item.allocations.length > 0) {
          matchDept = item.allocations.some(a => a.department === budgetFilterDept);
        } else {
          matchDept = item.departamento === budgetFilterDept;
        }
      }
      
      return matchMonth && matchStatus && matchDept;
    });

    // Ordenação
    const { key, direction } = budgetSortConfig;
    items.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];

        if (key === 'departamento') {
            const getDept = (i) => i.allocations && i.allocations.length > 0 ? i.allocations[0].department : (i.departamento || '');
            aVal = getDept(a);
            bVal = getDept(b);
        }

        if (key === 'saldo') {
            aVal = Number(a.valorRealizado || 0) - Number(a.valorPrevisto || 0);
            bVal = Number(b.valorRealizado || 0) - Number(b.valorPrevisto || 0);
        }

        if (key === 'mes') {
            return direction === 'asc' 
                ? MONTHS.indexOf(a.mes) - MONTHS.indexOf(b.mes) 
                : MONTHS.indexOf(b.mes) - MONTHS.indexOf(a.mes);
        }

        if (key === 'valorPrevisto' || key === 'valorRealizado' || key === 'saldo') {
            const numA = Number(aVal || 0);
            const numB = Number(bVal || 0);
            return direction === 'asc' ? numA - numB : numB - numA;
        }

        const strA = (aVal || '').toString().toLowerCase();
        const strB = (bVal || '').toString().toLowerCase();
        return direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return items;
  }, [budgetItems, budgetFilterMonth, budgetFilterStatus, budgetFilterDept, budgetSortConfig, isMaster, myManagedDepts]);

  // Cálculo para o Gráfico e Totalizadores
  const chartData = useMemo(() => {
      // 1. Array de base para os 12 meses
      const data = MONTHS.map(m => ({ mes: m, previsto: 0, realizado: 0 }));
      
      const itemsToProcess = budgetItems.filter(item => {
          // Segurança
          if (!isMaster) {
            let belongsToMyDept = false;
            if (item.allocations && item.allocations.length > 0) {
              belongsToMyDept = item.allocations.some(a => myManagedDepts.includes(a.department));
            } else {
              belongsToMyDept = myManagedDepts.includes(item.departamento);
            }
            if (!belongsToMyDept) return false;
          }
          // Filtro de Status
          return budgetFilterStatus ? item.status === budgetFilterStatus : true;
      });

      itemsToProcess.forEach(item => {
          const monthIndex = MONTHS.indexOf(item.mes);
          if (monthIndex === -1) return;

          let vPrev = Number(item.valorPrevisto || 0);
          let vReal = Number(item.valorRealizado || 0);
          const rate = item.moeda === 'USD' ? FIXED_EXCHANGE_RATE : 1;

          vPrev = vPrev * rate;
          vReal = vReal * rate;

          // Aplica Rateio se houver filtro de Depto
          if (budgetFilterDept) {
              let share = 0;
              if (item.allocations && item.allocations.length > 0) {
                  const alloc = item.allocations.find(a => a.department === budgetFilterDept);
                  if (alloc) share = Number(alloc.percent) / 100;
              } else {
                  if (item.departamento === budgetFilterDept) share = 1;
              }
              vPrev = vPrev * share;
              vReal = vReal * share;
          }

          data[monthIndex].previsto += vPrev;
          data[monthIndex].realizado += vReal;
      });

      return data;
  }, [budgetItems, budgetFilterDept, budgetFilterStatus, isMaster, myManagedDepts]);

  const budgetStats = useMemo(() => {
      let totalPrevisto = 0;
      let totalRealizado = 0;

      filteredBudgetItems.forEach(item => {
          let vPrev = Number(item.valorPrevisto || 0);
          let vReal = Number(item.valorRealizado || 0);
          const rate = item.moeda === 'USD' ? FIXED_EXCHANGE_RATE : 1;

          vPrev = vPrev * rate;
          vReal = vReal * rate;

          if (budgetFilterDept) {
              if (item.allocations && item.allocations.length > 0) {
                  const alloc = item.allocations.find(a => a.department === budgetFilterDept);
                  if (alloc) {
                      const share = Number(alloc.percent) / 100;
                      vPrev = vPrev * share;
                      vReal = vReal * share;
                  }
              }
          }

          totalPrevisto += vPrev;
          totalRealizado += vReal;
      });

      return { totalPrevisto, totalRealizado };
  }, [filteredBudgetItems, budgetFilterDept]);

  const chartMaxValue = useMemo(() => {
      let max = 0;
      chartData.forEach(d => {
          if (d.previsto > max) max = d.previsto;
          if (d.realizado > max) max = d.realizado;
      });
      return max > 0 ? max : 1;
  }, [chartData]);

  // --- Firebase Effects ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token).catch(() => signInAnonymously(auth));
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Firebase Auth Error:", err); } finally { setAuthChecking(false); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setView('welcome');
      else if (!isPreviewBypass) setView('login');
    });
    return () => unsubscribe();
  }, [isPreviewBypass]);

  // Carrega Configurações de Gestores
  useEffect(() => {
    if (!user) return;
    const settingsDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'department_managers');
    const unsubscribe = onSnapshot(settingsDoc, (docSnap) => {
      if (docSnap.exists()) {
        setDeptManagers(docSnap.data());
      } else {
        setDeptManagers({});
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return; 
    setLoading(true);
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'employees');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGlobalOneOnOnes(data);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'budget');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBudgetItems(data.sort((a,b) => MONTHS.indexOf(a.mes) - MONTHS.indexOf(b.mes)));
    });
    return () => unsubscribe();
  }, [user]);

  // --- Handlers ---
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (err) { setLoginError("Falha na autenticação."); }
  };

  const handleBypass = () => {
    setIsPreviewBypass(true);
    setUser({ displayName: "Admin Master", email: MASTER_EMAIL });
    setView('welcome');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsPreviewBypass(false);
    setView('login');
  };

  const handleEnterHub = () => {
    if (isMaster || isPreviewBypass || isDeptManager) setView('selection');
    else setView('crud'); 
  };

  const openModal = (emp = null) => {
    if (emp) { 
      setEditingEmployee(emp); 
      setFormData({ 
          ...emp, 
          managerId: emp.managerId || '', 
          allocations: (emp.allocations && emp.allocations.length > 0) ? emp.allocations : [{ squad: emp.squad || SQUADS[0], percent: 100 }] 
      }); 
    } else { 
      setEditingEmployee(null); 
      setFormData({ 
        nome: '', email: '', cargo: '', modeloTrabalho: 'CLT', senioridade: 'Júnior', salario: '', ultimaPromocao: '', 
        managerId: (isMaster || isPreviewBypass) ? '' : (currentEmployeeProfile?.id || ''), allocations: [{ squad: SQUADS[0], percent: 100 }]
      }); 
    }
    setIsModalOpen(true);
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

  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const data = { ...formData, salario: Number(formData.salario), updatedAt: new Date().toISOString() };
    try {
      if (editingEmployee) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', editingEmployee.id), data, { merge: true });
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'employees'), data);
      setIsModalOpen(false);
    } catch (err) { console.error(err); }
  };

  const deleteEmployee = async (id) => {
    if (!auth.currentUser) return;
    if (window.confirm("Excluir colaborador?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', id));
  };

  // --- Handlers de Configuração de Gestores ---
  const handleAddManager = async () => {
    if (!newManagerEmail) return;
    const currentEmails = deptManagers[selectedDeptForConfig] || [];
    if (currentEmails.includes(newManagerEmail)) return alert("Email já cadastrado.");
    
    const updated = { ...deptManagers, [selectedDeptForConfig]: [...currentEmails, newManagerEmail] };
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'department_managers'), updated);
      setNewManagerEmail('');
    } catch (err) { console.error(err); }
  };

  const handleRemoveManager = async (emailToRemove) => {
    const currentEmails = deptManagers[selectedDeptForConfig] || [];
    const updated = { ...deptManagers, [selectedDeptForConfig]: currentEmails.filter(e => e !== emailToRemove) };
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'department_managers'), updated);
    } catch (err) { console.error(err); }
  };

  // --- Budget Handlers ---
  const openBudgetModal = (item = null) => {
    if (item) {
        setEditingBudgetId(item.id);
        const allocations = (item.allocations && item.allocations.length > 0) 
            ? item.allocations 
            : [{ department: item.departamento || DEPARTMENTS[0], percent: 100 }];

        setBudgetForm({
            titulo: item.titulo,
            descricao: item.descricao || '', 
            selectedMonths: [item.mes], 
            status: item.status,
            valorPrevisto: item.valorPrevisto,
            valorRealizado: item.valorRealizado,
            moeda: item.moeda || 'BRL',
            tipoDespesa: item.tipoDespesa || EXPENSE_TYPES[0],
            categoria: item.categoria || CATEGORIES[0],
            allocations: allocations,
            confidencial: item.confidencial || false // Carrega confidencialidade
        });
    } else {
        setEditingBudgetId(null);
        setBudgetForm({
            titulo: '',
            descricao: '', 
            selectedMonths: [],
            status: 'Orçado',
            valorPrevisto: '',
            valorRealizado: '',
            moeda: 'BRL',
            tipoDespesa: EXPENSE_TYPES[0],
            categoria: CATEGORIES[0],
            allocations: [{ department: DEPARTMENTS[0], percent: 100 }],
            confidencial: false
        });
    }
    setIsBudgetModalOpen(true);
  };

  const toggleBudgetMonth = (month) => {
    if (editingBudgetId) {
        setBudgetForm({...budgetForm, selectedMonths: [month]});
    } else {
        const current = [...budgetForm.selectedMonths];
        if (current.includes(month)) {
            setBudgetForm({...budgetForm, selectedMonths: current.filter(m => m !== month)});
        } else {
            setBudgetForm({...budgetForm, selectedMonths: [...current, month]});
        }
    }
  };

  const addBudgetAllocation = () => {
    if (budgetForm.allocations.length >= 5) return;
    setBudgetForm({ ...budgetForm, allocations: [...budgetForm.allocations, { department: DEPARTMENTS[0], percent: 0 }] });
  };

  const removeBudgetAllocation = (index) => {
    const newList = budgetForm.allocations.filter((_, i) => i !== index);
    setBudgetForm({ ...budgetForm, allocations: newList });
  };

  const updateBudgetAllocation = (index, field, value) => {
    const newList = [...budgetForm.allocations];
    newList[index][field] = field === 'percent' ? Number(value) : value;
    setBudgetForm({ ...budgetForm, allocations: newList });
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (budgetForm.selectedMonths.length === 0) return alert("Selecione pelo menos um mês.");
    
    const totalPercent = budgetForm.allocations.reduce((sum, a) => sum + Number(a.percent), 0);
    if (totalPercent !== 100) return alert("A alocação por departamentos deve somar 100%.");

    try {
        if (editingBudgetId) {
            const data = {
                titulo: budgetForm.titulo,
                descricao: budgetForm.descricao,
                mes: budgetForm.selectedMonths[0], 
                status: budgetForm.status,
                valorPrevisto: Number(budgetForm.valorPrevisto),
                valorRealizado: Number(budgetForm.valorRealizado),
                allocations: budgetForm.allocations, 
                moeda: budgetForm.moeda,
                tipoDespesa: budgetForm.tipoDespesa,
                categoria: budgetForm.categoria,
                confidencial: budgetForm.confidencial, // Salva flag
                updatedAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'budget', editingBudgetId), data, { merge: true });
        } else {
            const batchPromises = budgetForm.selectedMonths.map(month => {
                const data = {
                    titulo: budgetForm.titulo,
                    descricao: budgetForm.descricao,
                    mes: month,
                    status: budgetForm.status,
                    valorPrevisto: Number(budgetForm.valorPrevisto),
                    valorRealizado: Number(budgetForm.valorRealizado),
                    allocations: budgetForm.allocations, 
                    moeda: budgetForm.moeda,
                    tipoDespesa: budgetForm.tipoDespesa,
                    categoria: budgetForm.categoria,
                    confidencial: budgetForm.confidencial, // Salva flag
                    createdAt: new Date().toISOString()
                };
                return addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'budget'), data);
            });
            await Promise.all(batchPromises);
        }
        setIsBudgetModalOpen(false);
    } catch (err) {
        console.error("Error saving budget:", err);
    }
  };

  const deleteBudgetItem = async (id) => {
      if (!auth.currentUser) return;
      if (window.confirm("Remover item do orçamento?")) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'budget', id));
      }
  };

  // --- 1:1 Handlers ---
  const open1on1History = (emp) => {
    setSelectedEmpFor1on1(emp);
    setIs1on1ModalOpen(true);
    setIsAdding1on1(false);
    setEditing1on1Id(null);
  };

  const handleStartNew1on1 = (emp = null) => {
    const lastSession = emp ? globalOneOnOnes.filter(o => o.employeeId === emp.id).sort((a,b) => new Date(b.data) - new Date(a.data))[0] : null;
    setForm1on1({
      employeeId: emp?.id || '',
      titulo: '', 
      decisoes: lastSession?.proximaPauta || '', 
      proximaPauta: '', 
      sentimento: 3, 
      status: 'Agendada',
      data: new Date().toISOString().split('T')[0]
    });
    setEditing1on1Id(null);
    setIsAdding1on1(true);
    if (!selectedEmpFor1on1 && emp) setSelectedEmpFor1on1(emp);
  };

  const handleEdit1on1 = (session) => {
    setForm1on1({ ...session });
    setEditing1on1Id(session.id);
    setIsAdding1on1(true);
    if (!selectedEmpFor1on1) setSelectedEmpFor1on1(employees.find(e => e.id === session.employeeId));
  };

  const toggle1on1Status = async (id, currentStatus) => {
    if (!auth.currentUser) return;
    const newStatus = currentStatus === 'Finalizada' ? 'Agendada' : 'Finalizada';
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes', id);
      await updateDoc(docRef, { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (err) { console.error("Erro ao atualizar status:", err); }
  };

  const handleSubmit1on1 = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const record = { ...form1on1, updatedAt: new Date().toISOString() };
    try {
      if (editing1on1Id) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes', editing1on1Id), record, { merge: true });
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes'), { ...record, createdAt: new Date().toISOString() });
      setIsAdding1on1(false);
      setEditing1on1Id(null);
    } catch (err) { console.error(err); }
  };

  const delete1on1 = async (id) => {
    if (!auth.currentUser) return;
    if (window.confirm("Remover este registro de 1:1?")) {
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'oneOnOnes', id)); }
        catch (err) { console.error("Erro ao deletar 1:1:", err); }
    }
  };

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

  const SortableBudgetTh = ({ label, sortKey, align = 'left', center = false }) => {
    const isActive = budgetSortConfig.key === sortKey;
    return (
      <th className={`px-6 py-4 cursor-pointer hover:bg-[#0097A9]/5 transition-colors group ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`} onClick={() => {
        let direction = 'asc';
        if (isActive && budgetSortConfig.direction === 'asc') direction = 'desc';
        setBudgetSortConfig({ key: sortKey, direction });
      }}>
        <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
          <span className={`${isActive ? 'text-[#0097A9]' : ''}`}>{label}</span>
          <div className="flex flex-col opacity-30 group-hover:opacity-100 transition-opacity">
            {isActive && budgetSortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-[#0097A9]" /> : isActive && budgetSortConfig.direction === 'desc' ? <ChevronDown size={14} className="text-[#0097A9]" /> : <ArrowUpDown size={14} />}
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
        <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl relative overflow-hidden text-center animate-in fade-in duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0097A9]/10 rounded-full -mr-16 -mt-16" />
          <div className="flex flex-col items-center mb-10">
            <ArkmedsLogo className="h-12 text-[#0097A9] mb-4" />
            <h2 className="text-2xl font-bold text-[#244C5A]">SSO Login</h2>
            <p className="text-slate-400 text-sm">Painel Administrativo Arkmeds</p>
          </div>
          <div className="space-y-4">
            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-[#244C5A] font-bold py-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-6 h-6" /> Entrar com Google</button>
            {isPreviewEnv && <button onClick={handleBypass} className="w-full text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-[#0097A9] py-2 flex items-center justify-center gap-2 transition-all"><FlaskConical size={12} /> Ignorar SSO (Bypass Preview)</button>}
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
                      <div className="w-24 h-24 bg-[#FFC72C] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,199,44,0.4)]"><Rocket size={48} className="text-[#244C5A] animate-bounce" /></div>
                      <h2 className="text-4xl font-black text-white mb-4 italic">Bem-vindo!</h2>
                      <p className="text-white/60 mb-10 leading-relaxed text-lg font-medium">Sua identidade foi autenticada. Clique abaixo para entrar no ecossistema de gestão da Arkmeds.</p>
                      <button onClick={handleEnterHub} className="w-full bg-[#FFC72C] text-[#244C5A] font-black py-6 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl uppercase tracking-tighter flex items-center justify-center gap-3">Entrar no Talent Hub <ChevronRight size={24} /></button>
                  </div>
                  <button onClick={handleLogout} className="mt-12 text-white/30 hover:text-white/60 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto"><LogOut size={14}/> Sair da Conta</button>
              </div>
          </div>
      );
  }

  if (view === 'selection' && (isMaster || isPreviewBypass || isDeptManager)) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-8 text-left animate-in slide-in-from-bottom-4 duration-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="max-w-4xl w-full">
            <div className="flex justify-between items-end mb-12 text-slate-700">
                <div><ArkmedsLogo className="text-[#0097A9] mb-6 h-10" /><h1 className="text-4xl font-black text-[#244C5A] mb-2 text-left">Olá, {user?.displayName?.split(' ')[0] || "Admin"}</h1><p className="text-slate-500 text-lg font-medium text-left">Escolha uma frente de gestão:</p></div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors flex items-center gap-2 mb-2"><LogOut size={20}/> Sair</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-700">
                <div onClick={() => setView('home')} className="bg-white p-12 rounded-[40px] shadow-xl border-2 border-transparent hover:border-[#FFC72C] transition-all cursor-pointer group hover:-translate-y-2 duration-300">
                    <div className="w-20 h-20 bg-[#FFC72C]/10 rounded-3xl flex items-center justify-center text-[#244C5A] mb-8 group-hover:rotate-12 transition-transform"><TrendingUp size={40} /></div>
                    <h3 className="text-2xl font-black text-[#244C5A] mb-4 text-left">Gestão de Orçamento</h3>
                    <p className="text-slate-400 leading-relaxed mb-8 text-sm text-left">Área de planejamento estratégico financeiro e acompanhamento de fluxo de caixa corporativo.</p>
                    <div className="flex items-center text-[#0097A9] font-black uppercase text-xs tracking-widest gap-2 text-left">Acessar Orçamento <ChevronRight size={16}/></div>
                </div>
                <div onClick={() => setView('crud')} className="bg-[#244C5A] p-12 rounded-[40px] shadow-xl border-2 border-transparent hover:border-[#0097A9] transition-all cursor-pointer group hover:-translate-y-2 duration-300 text-white">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-[#FFC72C] mb-8 group-hover:rotate-12 transition-transform"><Users size={40} /></div>
                    <h3 className="text-2xl font-black mb-4 text-left">Gestão de Pessoas</h3>
                    <p className="text-white/50 leading-relaxed mb-8 text-sm text-left">Controle de talentos, rateio por squad, provisionamento de encargos e agenda de 1:1.</p>
                    <div className="flex items-center text-[#FFC72C] font-black uppercase text-xs tracking-widest gap-2 text-left">Entrar no Talent Hub <ChevronRight size={16}/></div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (view === 'oneOnOnes') {
      return (
        <div className="min-h-screen bg-[#F8FAFB] text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <nav className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm text-slate-700">
                <div className="flex items-center gap-6">
                    <ArkmedsLogo className="text-[#0097A9]" />
                    <button onClick={() => setView('crud')} className="flex items-center gap-2 text-slate-400 hover:text-[#0097A9] font-bold text-sm transition-all bg-slate-50 px-4 py-2 rounded-xl text-left"><ChevronLeft size={18}/> Voltar ao Talent Hub</button>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => { setForm1on1({employeeId: '', titulo: '', decisoes: '', proximaPauta: '', sentimento: 3, status: 'Agendada', data: TODAY_STR}); setIsAdding1on1(true); }} className="bg-[#FFC72C] text-[#244C5A] px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2"><PlusCircle size={18}/> Agendar Nova 1:1</button>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors"><LogOut size={20}/></button>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#244C5A] p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl min-h-[400px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={100}/></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#FFC72C] mb-2 text-left">Agenda de Hoje</p>
                        <h2 className="text-3xl font-black mb-6 text-left">{formatDate(TODAY_STR)}</h2>
                        <div className="space-y-4 relative z-10">
                            {oneOnOneModuleData.todaySessions.length === 0 ? (
                                <p className="text-white/40 italic text-sm text-left">Nenhuma reunião para hoje.</p>
                            ) : oneOnOneModuleData.todaySessions.map(s => {
                                const emp = employees.find(e => e.id === s.employeeId);
                                const isDone = s.status === 'Finalizada';
                                return (
                                    <div key={s.id} className={`group bg-white/10 hover:bg-white/20 p-4 rounded-2xl border border-white/5 transition-all flex items-center justify-between ${isDone ? 'opacity-50' : ''}`}>
                                        <div className="cursor-pointer flex-1 text-left" onClick={() => handleEdit1on1(s)}>
                                            <p className={`font-bold text-sm ${isDone ? 'line-through text-white/50' : ''}`}>{emp?.nome || 'Colaborador'}</p>
                                            <p className="text-[10px] text-white/50">{s.titulo}</p>
                                        </div>
                                        <button onClick={() => toggle1on1Status(s.id, s.status)} className={`p-2 rounded-xl transition-all ${isDone ? 'bg-[#FFC72C] text-[#244C5A]' : 'bg-white/10 text-white hover:bg-white/30'}`}>
                                            {isDone ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-8">
                    <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 min-h-[600px] text-slate-700">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-[#244C5A] flex items-center gap-3 text-left"><History className="text-[#0097A9]"/> Histórico Global</h3>
                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-left">{oneOnOneModuleData.relevantSessions.length} SESSÕES</div>
                        </div>
                        <div className="space-y-4">
                            {oneOnOneModuleData.relevantSessions.map(s => {
                                const emp = employees.find(e => e.id === s.employeeId);
                                const sent = SENTIMENTS.find(sent => sent.value === s.sentimento) || SENTIMENTS[2];
                                const isDone = s.status === 'Finalizada';
                                return (
                                    <div key={s.id} className="group bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 p-6 rounded-3xl transition-all flex items-center justify-between text-left">
                                        <div className="flex items-center gap-6 text-left">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-[#0097A9]'}`}>
                                                {isDone ? <CheckCircle2 size={24}/> : <sent.icon size={24}/>}
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2 mb-1 text-left text-slate-700">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFC72C]/10 text-[#244C5A]'}`}>{s.status || 'Agendada'}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[10px] font-black text-[#0097A9] uppercase">{formatDate(s.data)}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{emp?.nome}</span>
                                                </div>
                                                <h4 className={`font-bold text-[#244C5A] text-left ${isDone ? 'line-through text-slate-400' : ''}`}>{s.titulo}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all text-left">
                                            <button onClick={() => toggle1on1Status(s.id, s.status)} className={`p-2 rounded-xl ${isDone ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}>
                                                {isDone ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                                            </button>
                                            <button onClick={() => handleEdit1on1(s)} className="p-2 text-slate-400 hover:text-[#0097A9] hover:bg-slate-100 rounded-xl"><Edit3 size={18}/></button>
                                            <button onClick={() => delete1on1(s.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
            {isAdding1on1 && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#244C5A]/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden text-left border border-white/20 text-slate-700">
                        <div className="bg-[#0097A9] p-8 flex justify-between items-center text-white">
                            <h2 className="text-2xl font-black flex items-center gap-3 text-left"><MessageSquare/> {editing1on1Id ? 'Editar' : 'Agendar'} 1:1</h2>
                            <button onClick={() => setIsAdding1on1(false)} className="hover:rotate-90 transition-transform"><X size={32}/></button>
                        </div>
                        <form onSubmit={handleSubmit1on1} className="p-10 space-y-6 text-slate-700">
                            <div className="grid grid-cols-2 gap-6 text-left">
                                <div className="col-span-2 text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 text-left">Colaborador</label>
                                    <select required value={form1on1.employeeId} onChange={e => setForm1on1({...form1on1, employeeId: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] font-bold text-[#244C5A] text-left">
                                        <option value="">Selecione o liderado...</option>
                                        {visibleEmployees.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 text-left">Título da Conversa</label>
                                    <input required value={form1on1.titulo} onChange={e => setForm1on1({...form1on1, titulo: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] font-bold text-left" />
                                </div>
                                <div className="text-left"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 text-left">Data</label><input type="date" required value={form1on1.data} onChange={e => setForm1on1({...form1on1, data: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-left"/></div>
                                <div className="text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 text-left">Status</label>
                                    <select value={form1on1.status} onChange={e => setForm1on1({...form1on1, status: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] font-bold text-[#244C5A] text-left">
                                        <option value="Agendada">Agendada</option>
                                        <option value="Finalizada">Finalizada</option>
                                    </select>
                                </div>
                                <div className="col-span-2 text-left">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 text-left">Sentimento</label>
                                    <div className="flex justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100 text-left">
                                        {SENTIMENTS.map(s => <button key={s.value} type="button" onClick={() => setForm1on1({...form1on1, sentimento: s.value})} className={`p-2 rounded-xl transition-all ${form1on1.sentimento === s.value ? `${s.bg} ${s.color} shadow-sm scale-110` : 'text-slate-300'}`}><s.icon size={20}/></button>)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-left"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 text-left">Decisões e Notas</label><textarea required value={form1on1.decisoes} onChange={e => setForm1on1({...form1on1, decisoes: e.target.value})} rows="3" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm resize-none text-left"></textarea></div>
                            <div className="text-left"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 text-left">Próxima Pauta</label><textarea value={form1on1.proximaPauta} onChange={e => setForm1on1({...form1on1, proximaPauta: e.target.value})} rows="2" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm resize-none text-left" placeholder="O que discutir no próximo encontro?"></textarea></div>
                            <button type="submit" className="w-full bg-[#244C5A] text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-2 text-left"><Save size={20} text-left/> {editing1on1Id ? 'Atualizar' : 'Salvar'} Registro</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
      );
  }

  if (view === 'home' && (isMaster || isPreviewBypass || isDeptManager)) {
      return (
        <div className="min-h-screen bg-[#F8FAFB] text-left pb-20" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <nav className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm text-slate-700 sticky top-0 z-30">
                <div className="flex items-center gap-6"><ArkmedsLogo className="text-[#0097A9]" /><button onClick={() => setView('selection')} className="flex items-center gap-2 text-slate-400 hover:text-[#0097A9] font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl text-left"><ChevronLeft size={18}/> Voltar ao Menu</button></div>
                <div className="flex items-center gap-4">
                    {/* Botão de Configuração de Gestores (Apenas Admin) */}
                    {isMaster && (
                      <button 
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2"
                        title="Configurar Gestores"
                      >
                        <Settings size={18}/>
                      </button>
                    )}
                    <button onClick={() => openBudgetModal()} className="bg-[#FFC72C] text-[#244C5A] px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2"><PlusCircle size={18}/> Novo Item</button>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors"><LogOut size={20}/></button>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto p-10">
                <div className="bg-[#244C5A] text-white p-10 rounded-[40px] shadow-2xl mb-12 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 text-[#FFC72C] mb-2 uppercase text-[10px] font-black tracking-widest"><TrendingUp size={16}/> Financeiro</div>
                            <h1 className="text-4xl font-black mb-2">Gestão de Orçamento</h1>
                            <p className="text-white/60">Acompanhamento de previsões e realizações mensais.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-[#FFC72C] uppercase tracking-widest">Total Previsto (R$)</p>
                                <p className="text-2xl font-black">{formatCurrency(budgetStats.totalPrevisto, 'BRL')}</p>
                                {budgetStats.totalPrevisto > 0 && <p className="text-[10px] text-white/30 italic mt-1 font-bold">Consolidado @ 5.5</p>}
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-[#0097A9] uppercase tracking-widest">Total Realizado (R$)</p>
                                <p className="text-2xl font-black">{formatCurrency(budgetStats.totalRealizado, 'BRL')}</p>
                            </div>
                        </div>
                    </div>
                    {/* Gráfico de Barras */}
                    <BudgetBarChart data={chartData} maxValue={chartMaxValue} />
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[#244C5A] flex items-center gap-2"><ListFilter size={18}/> Itens do Orçamento</h3>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">{filteredBudgetItems.length}</div>
                        </div>
                        
                        {/* Filtros */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <select 
                                    value={budgetFilterMonth} 
                                    onChange={(e) => setBudgetFilterMonth(e.target.value)}
                                    className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none hover:border-[#0097A9] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Todos os Meses</option>
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="relative">
                                <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <select 
                                    value={budgetFilterDept} 
                                    onChange={(e) => setBudgetFilterDept(e.target.value)}
                                    className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none hover:border-[#0097A9] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">{isMaster ? "Todos Deptos." : "Meus Deptos. (Todos)"}</option>
                                    {/* Lista todas as opções se for Master, senão lista apenas as permitidas */}
                                    {(isMaster ? DEPARTMENTS : myManagedDepts).map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="relative">
                                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <select 
                                    value={budgetFilterStatus} 
                                    onChange={(e) => setBudgetFilterStatus(e.target.value)}
                                    className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none hover:border-[#0097A9] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Todos Status</option>
                                    {BUDGET_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            
                            {(budgetFilterMonth || budgetFilterDept || budgetFilterStatus) && (
                                <button 
                                    onClick={() => { setBudgetFilterMonth(''); setBudgetFilterDept(''); setBudgetFilterStatus(''); }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Limpar Filtros"
                                >
                                    <X size={16}/>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-slate-700">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b">
                                    <SortableBudgetTh label="Descrição" sortKey="titulo" />
                                    <SortableBudgetTh label="Mês" sortKey="mes" />
                                    <SortableBudgetTh label="Depto." sortKey="departamento" />
                                    <SortableBudgetTh label="Status" sortKey="status" center />
                                    <SortableBudgetTh label="Valor Previsto" sortKey="valorPrevisto" align="right" />
                                    <SortableBudgetTh label="Valor Realizado" sortKey="valorRealizado" align="right" />
                                    <SortableBudgetTh label="Saldo" sortKey="saldo" align="right" />
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBudgetItems.length === 0 ? (
                                    <tr><td colSpan="8" className="p-12 text-center text-slate-400 italic">Nenhum item orçamentário encontrado.</td></tr>
                                ) : (
                                    filteredBudgetItems.map(item => {
                                        const saldo = (Number(item.valorRealizado || 0) - Number(item.valorPrevisto || 0));
                                        const hasMultipleDepts = item.allocations && item.allocations.length > 1;
                                        const mainDept = item.allocations && item.allocations.length > 0 ? item.allocations[0].department : (item.departamento || 'N/A');
                                        
                                        return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#244C5A]">{item.titulo}</div>
                                                <div className="text-[9px] font-bold text-slate-300 uppercase">ID: {item.id.slice(0,6)}</div>
                                            </td>
                                            <td className="px-6 py-4"><span className="text-xs font-bold bg-[#0097A9]/5 text-[#0097A9] px-3 py-1 rounded-lg">{item.mes}</span></td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md ${hasMultipleDepts ? 'bg-purple-50 text-purple-600 border-purple-100' : ''}`}>
                                                    {hasMultipleDepts ? 'Rateio Múltiplo' : mainDept}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                                                    item.status === 'Realizado' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.status === 'Cancelado' ? 'bg-red-50 text-red-500' :
                                                    item.status === 'Extra' ? 'bg-purple-50 text-purple-600' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>{item.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-600">{formatCurrency(item.valorPrevisto, item.moeda)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-[#244C5A]">{formatCurrency(item.valorRealizado, item.moeda)}</td>
                                            <td className={`px-6 py-4 text-right font-bold ${saldo > 0 ? 'text-red-500' : saldo < 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                {formatCurrency(saldo, item.moeda)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => openBudgetModal(item)} className="p-2 text-slate-400 hover:text-[#0097A9] hover:bg-slate-100 rounded-lg"><Edit3 size={16}/></button>
                                                    <button onClick={() => deleteBudgetItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL CONFIGURAÇÃO DE GESTORES (ADMIN ONLY) */}
            {isSettingsModalOpen && isMaster && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#244C5A]/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden text-left border border-white/20 text-slate-700">
                  <div className="bg-[#244C5A] p-8 flex justify-between items-center text-white">
                      <h2 className="text-xl font-black flex items-center gap-3"><Settings/> Configurar Gestores</h2>
                      <button onClick={() => setIsSettingsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
                  </div>
                  <div className="p-8 space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Departamento</label>
                      <select 
                        value={selectedDeptForConfig} 
                        onChange={(e) => setSelectedDeptForConfig(e.target.value)}
                        className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] font-bold text-[#244C5A]"
                      >
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <label className="text-[10px] font-black uppercase text-slate-400 block mb-4 tracking-widest">Gestores Atuais</label>
                       <div className="space-y-2 mb-4">
                          {(deptManagers[selectedDeptForConfig] || []).length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Nenhum gestor vinculado.</p>
                          ) : (
                            (deptManagers[selectedDeptForConfig] || []).map(email => (
                              <div key={email} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-600">{email}</span>
                                <button onClick={() => handleRemoveManager(email)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                              </div>
                            ))
                          )}
                       </div>
                       
                       <div className="flex gap-2">
                          <input 
                            type="email" 
                            placeholder="novo.gestor@arkmeds.com" 
                            className="flex-1 p-3 text-xs border rounded-xl outline-none focus:border-[#0097A9]"
                            value={newManagerEmail}
                            onChange={(e) => setNewManagerEmail(e.target.value)}
                          />
                          <button onClick={handleAddManager} className="bg-[#0097A9] text-white p-3 rounded-xl hover:brightness-110"><Plus size={16}/></button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL ORÇAMENTO */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#244C5A]/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden text-left border border-white/20 text-slate-700">
                        <div className="bg-[#0097A9] p-8 flex justify-between items-center text-white">
                            <h2 className="text-2xl font-black flex items-center gap-3"><Wallet/> {editingBudgetId ? 'Editar Item' : 'Novo Lançamento'}</h2>
                            <button onClick={() => setIsBudgetModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={32}/></button>
                        </div>
                        <form onSubmit={handleBudgetSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Título da Despesa</label>
                                    <input required value={budgetForm.titulo} onChange={e => setBudgetForm({...budgetForm, titulo: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] font-bold text-[#244C5A]" placeholder="Ex: Licença de Software" />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Descrição Detalhada</label>
                                    <textarea value={budgetForm.descricao} onChange={e => setBudgetForm({...budgetForm, descricao: e.target.value})} rows="2" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-sm text-slate-700 resize-none" placeholder="Detalhes adicionais sobre a despesa..." />
                                </div>

                                {/* COMPONENTE DE ALOCAÇÃO DE DEPARTAMENTOS */}
                                <div className="col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left">
                                    <div className="flex items-center justify-between mb-4 text-left text-slate-700">
                                        <div className="flex items-center gap-2 text-left">
                                            <Layers size={18} className="text-[#0097A9] text-left"/>
                                            <label className="text-[10px] font-black uppercase text-[#244C5A] tracking-widest text-left">Departamentos (Max 5)</label>
                                        </div>
                                        <button type="button" onClick={addBudgetAllocation} disabled={budgetForm.allocations.length >= 5} className="text-[10px] font-black uppercase text-[#0097A9] hover:bg-[#0097A9]/10 px-3 py-1.5 rounded-xl disabled:opacity-30 text-left">+ Add Departamento</button>
                                    </div>
                                    <div className="space-y-3 text-left">
                                        {budgetForm.allocations.map((alloc, index) => (
                                            <div key={index} className="flex items-center gap-3 animate-in slide-in-from-left duration-200 text-left">
                                                <div className="flex-1 text-left">
                                                    <select value={alloc.department} onChange={e => updateBudgetAllocation(index, 'department', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm text-left text-slate-700">
                                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-24 relative text-left">
                                                    <input type="number" value={alloc.percent} onChange={e => updateBudgetAllocation(index, 'percent', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm pr-8 font-bold text-[#0097A9] text-left text-slate-700" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 text-left">%</span>
                                                </div>
                                                {budgetForm.allocations.length > 1 && (
                                                    <button type="button" onClick={() => removeBudgetAllocation(index)} className="text-slate-300 hover:text-red-500 text-left">
                                                        <MinusCircle size={20} className="text-left"/>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-left text-slate-700">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-left">Total</span>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${budgetForm.allocations.reduce((sum, a) => sum + Number(a.percent), 0) === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'} text-left text-slate-700`}>
                                            <span className="text-sm font-black text-left">{budgetForm.allocations.reduce((sum, a) => sum + Number(a.percent), 0)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Moeda</label>
                                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
                                        {CURRENCIES.map(c => (
                                            <button 
                                                key={c.value}
                                                type="button"
                                                onClick={() => setBudgetForm({...budgetForm, moeda: c.value})}
                                                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                                                    budgetForm.moeda === c.value
                                                    ? 'bg-[#0097A9] text-white shadow-md'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                            >
                                                {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Tipo de Despesa</label>
                                    <select value={budgetForm.tipoDespesa} onChange={e => setBudgetForm({...budgetForm, tipoDespesa: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-slate-700">
                                        {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Categoria</label>
                                    <select value={budgetForm.categoria} onChange={e => setBudgetForm({...budgetForm, categoria: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-slate-700">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Checkbox Confidencial (Apenas Admin) */}
                                {isMaster && (
                                  <div className="col-span-2 flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                                      <input 
                                        type="checkbox" 
                                        id="confidencialCheck" 
                                        checked={budgetForm.confidencial}
                                        onChange={(e) => setBudgetForm({...budgetForm, confidencial: e.target.checked})}
                                        className="w-5 h-5 accent-red-600"
                                      />
                                      <label htmlFor="confidencialCheck" className="text-sm font-bold text-red-800 flex items-center gap-2 cursor-pointer">
                                        <Lock size={16}/> Item Confidencial (Invisível para Gestores)
                                      </label>
                                  </div>
                                )}
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Mês de Referência (Múltipla Seleção)</label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {MONTHS.map(m => (
                                        <button 
                                            key={m} 
                                            type="button" 
                                            onClick={() => toggleBudgetMonth(m)}
                                            className={`text-[10px] font-bold uppercase py-2 rounded-xl transition-all border ${
                                                budgetForm.selectedMonths.includes(m) 
                                                ? 'bg-[#0097A9] text-white border-[#0097A9] shadow-md transform scale-105' 
                                                : 'bg-white text-slate-400 border-slate-200 hover:border-[#0097A9] hover:text-[#0097A9]'
                                            }`}
                                        >
                                            {m.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                                {!editingBudgetId && <p className="text-[10px] text-slate-400 mt-2 italic">* Selecionar múltiplos meses criará itens individuais para cada mês.</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Valor Previsto</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                            {budgetForm.moeda === 'USD' ? '$' : 'R$'}
                                        </span>
                                        <input required type="number" step="0.01" value={budgetForm.valorPrevisto} onChange={e => setBudgetForm({...budgetForm, valorPrevisto: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] font-bold text-slate-700" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Valor Realizado</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                            {budgetForm.moeda === 'USD' ? '$' : 'R$'}
                                        </span>
                                        <input type="number" step="0.01" value={budgetForm.valorRealizado} onChange={e => setBudgetForm({...budgetForm, valorRealizado: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] font-bold text-[#244C5A]" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {BUDGET_STATUS.map(status => (
                                        <button 
                                            key={status} 
                                            type="button" 
                                            onClick={() => setBudgetForm({...budgetForm, status})}
                                            className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase transition-all border ${
                                                budgetForm.status === status
                                                ? 'bg-[#FFC72C] text-[#244C5A] border-[#FFC72C] shadow-sm'
                                                : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#244C5A] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-[#0097A9] transition-all flex items-center justify-center gap-2">
                                <Save size={20}/> {editingBudgetId ? 'Atualizar Item' : 'Salvar Lançamentos'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
      <nav className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm text-slate-700">
          <div className="flex items-center gap-6"><ArkmedsLogo className="text-[#0097A9]" />{(isMaster || isPreviewBypass) && (<button onClick={() => setView('selection')} className="flex items-center gap-2 text-slate-400 hover:text-[#0097A9] font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl text-left"><LayoutDashboard size={18}/> Menu Principal</button>)}</div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSalaries(!showSalaries)} className={`p-2 rounded-xl transition-all ${showSalaries ? 'bg-[#FFC72C] text-[#244C5A]' : 'bg-slate-100 text-slate-400'}`}>{showSalaries ? <Eye size={20}/> : <EyeOff size={20}/>}</button>
            <div className="text-right hidden md:block text-slate-700"><p className="text-xs font-bold text-[#244C5A]">{user?.displayName || "Convidado"}</p><p className="text-[10px] text-slate-400 uppercase font-black">{isMaster ? "Acesso Master" : "Acesso Gestor"}</p></div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-bold transition-colors"><LogOut size={20}/></button>
          </div>
        </nav>

      <div className="bg-[#244C5A] text-white pt-10 pb-24 px-8 text-left">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-left">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-4 text-left"><Users size={32} className="text-[#FFC72C]"/> Talent Hub</h1>
          <div className="flex items-center gap-4 text-left">
              <button onClick={() => setView('oneOnOnes')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all border border-white/5 text-left"><MessageSquare size={20} className="text-[#FFC72C] text-left"/> Agenda de 1:1s</button>
              <button onClick={() => openModal()} className="bg-[#FFC72C] text-[#244C5A] px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-left"><UserPlus size={20} text-left/> Novo Registro</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto -mt-12 px-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom duration-500 text-slate-700 text-left">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-transparent text-left"><Users className="text-[#0097A9] mb-6 text-left" size={32} /><h3 className="text-3xl font-bold text-[#244C5A] text-left">{loading ? "..." : stats.total}</h3><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-left">Colaboradores</p></div>
            <div className="bg-[#0097A9] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-between text-left"><div className="absolute top-0 right-0 p-4 opacity-10 text-left"><UserCheck size={80} text-left/></div><TrendingUp className="text-[#FFC72C] mb-6 text-left" size={32} /><div><h3 className="text-2xl font-bold text-left">{loading ? "..." : formatCurrency(stats.sumCLT)}</h3><p className="text-white/50 font-bold uppercase text-[9px] tracking-widest text-left">Folha CLT (Prov.)</p></div></div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden flex flex-col justify-between text-left"><div className="absolute top-0 right-0 p-4 opacity-5 text-[#244C5A] text-left"><Building2 size={80} text-left/></div><Wallet className="text-[#0097A9] mb-6 text-left" size={32} /><div><h3 className="text-2xl font-bold text-[#244C5A] text-left">{loading ? "..." : formatCurrency(stats.sumPJ)}</h3><p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest text-left">Folha PJ (Real)</p></div></div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden flex flex-col justify-between text-left"><div className="absolute top-0 right-0 p-4 opacity-5 text-[#244C5A] text-left"><GraduationCap size={80} text-left/></div><PlusCircle className="text-[#FFC72C] mb-6 text-left" size={32} /><div><h3 className="text-2xl font-bold text-[#244C5A] text-left">{loading ? "..." : formatCurrency(stats.sumEstagio)}</h3><p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest text-left">Estágios (Prov.)</p></div></div>
          </div>

          <section className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 mb-12 text-slate-700 text-left">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 text-left">
                <div className="text-left"><div className="flex items-center gap-2 text-[#0097A9] mb-1 uppercase text-[10px] font-black tracking-widest text-left"><PieChart size={14}/> Orçamentos</div><h2 className="text-2xl font-black text-[#244C5A] text-left">Previsão Mensal por Squad</h2></div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-6 text-left"><div className="flex items-center gap-3 text-left text-slate-700"><div className="p-2 bg-[#0097A9]/10 rounded-xl text-[#0097A9] text-left"><Percent size={18}/></div><div className="text-left"><label className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter text-left">Encargos CLT</label><div className="flex items-center gap-2 text-left"><input type="number" value={cltChargePercent} onChange={(e) => setCltChargePercent(Number(e.target.value))} className="w-16 bg-transparent font-black text-[#244C5A] outline-none border-b-2 border-transparent focus:border-[#0097A9] transition-all text-sm text-left"/><span className="text-[#244C5A] font-bold text-sm text-left">%</span></div></div></div><div className="w-px h-8 bg-slate-200 text-left" /><div className="text-left"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-left">Total Provisionado</p><p className="text-lg font-black text-[#0097A9] text-left">{formatCurrency(stats.totalPayroll)}</p></div></div>
             </div>
             <div className="space-y-6 max-w-5xl text-left">
                   {stats.squadStats.map((s, idx) => (
                      <div key={s.name} className="group text-left"><div className="flex justify-between items-end mb-2 text-left"><div><span className="text-[9px] font-black text-slate-300 uppercase mr-2 text-left">0{idx + 1}</span><span className="text-sm font-bold text-[#244C5A] group-hover:text-[#0097A9] transition-colors text-left">{s.name}</span></div><div className="text-right text-left"><p className="text-xs font-black text-[#244C5A] text-left">{formatCurrency(s.total)}</p><p className="text-[9px] font-bold text-[#FFC72C] text-left">{s.percent.toFixed(1)}%</p></div></div><div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden text-left"><div className="h-full bg-[#0097A9] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,151,169,0.2)] text-left" style={{ width: `${s.percent}%` }}/></div></div>
                   ))}
             </div>
          </section>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 text-slate-700 text-left">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 text-left">
            <div className="relative w-1/3 text-left"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-left" size={18} /><input type="text" placeholder="Filtrar colaboradores..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm text-left text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase text-left">{sortedAndFilteredEmployees.length} REGISTROS</div>
          </div>
          <div className="overflow-x-auto text-left">
            <table className="w-full text-left text-slate-700">
              <thead><tr className="bg-slate-50 text-[#244C5A] text-[10px] font-bold uppercase tracking-widest border-b text-left"><SortableTh label="Colaborador" sortKey="nome" /><SortableTh label="Squads / Alocação" sortKey="squad" /><SortableTh label="Salário Nominal" sortKey="salario" align="right" /><SortableTh label="Meses s/ Promo" sortKey="mesesPromocao" align="right" /><th className="px-8 py-5 text-right text-left">Ações</th></tr></thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-left">
                {sortedAndFilteredEmployees.map(emp => {
                  const manager = employees.find(e => e.id === emp.managerId);
                  const allocations = (emp.allocations && emp.allocations.length > 0) ? emp.allocations : [{ squad: emp.squad || 'Sem Squad', percent: 100 }];
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-all group text-left text-slate-700">
                      <td className="px-8 py-5 text-left"><div className="flex items-center gap-4 text-left"><div className="w-10 h-10 bg-[#0097A9]/10 text-[#0097A9] rounded-xl flex items-center justify-center font-bold text-lg text-left">{emp.nome?.charAt(0)}</div><div className="text-left"><p className="font-bold text-[#244C5A] text-left">{emp.nome}</p><p className="text-[10px] text-slate-400 font-bold uppercase mb-1 text-left">{emp.senioridade} • {emp.modeloTrabalho}</p>{manager && <div className="flex items-center gap-1 text-[9px] text-[#0097A9] font-black uppercase tracking-tighter text-left"><GitBranch size={10} text-left/> Reporta a: {manager.nome}</div>}</div></div></td>
                      <td className="px-8 py-5 text-sm text-left"><div className="space-y-1.5 text-left">{allocations.map((a, i) => (<div key={i} className="flex items-center gap-2 text-left"><span className="text-[#0097A9] font-bold text-xs text-left">{a.squad}</span><span className="text-slate-300 text-[9px] font-black text-left">{a.percent}%</span></div>))}<p className="text-slate-500 text-[10px] italic pt-1 mt-1 line-clamp-1 text-left">{emp.cargo}</p></div></td>
                      <td className="px-8 py-5 text-right font-bold text-[#244C5A] text-left">{formatCurrency(emp.salario)}</td>
                      <td className="px-8 py-5 text-right text-left"><span className={`text-sm font-bold text-left ${getMonthsSince(emp.ultimaPromocao) > 12 ? 'text-orange-500' : 'text-slate-700'}`}>{getMonthsSince(emp.ultimaPromocao)} meses</span></td>
                      <td className="px-8 py-5 text-right text-left"><div className="flex justify-end gap-1 text-left">
                        <button onClick={() => open1on1History(emp)} className="p-2 text-slate-400 hover:text-[#0097A9] rounded-lg transition-all text-left" title="Histórico de 1:1"><MessageSquare size={18} text-left/></button>
                        {(isMaster || isPreviewBypass || (currentEmployeeProfile && emp.managerId === currentEmployeeProfile.id)) && (
                            <>
                              <button onClick={() => openModal(emp)} className="p-2 text-slate-400 hover:text-[#244C5A] hover:bg-slate-200 rounded-lg text-left" title="Editar"><Edit3 size={18} text-left/></button>
                              <button onClick={() => deleteEmployee(emp.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg text-left" title="Excluir"><Trash2 size={18} text-left/></button>
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

      {/* MODAL 1:1 DENTRO DO TALENT HUB */}
      {is1on1ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#244C5A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300 text-left">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20 text-left text-slate-700">
            <div className="bg-[#0097A9] p-8 flex justify-between items-start text-white shrink-0 text-left"><div><div className="flex items-center gap-2 text-[#FFC72C] mb-2 uppercase text-[10px] font-black tracking-[0.2em] text-left"><Clock size={14} text-left/> Performance</div><h2 className="text-3xl font-black text-left">1:1 Histórico • {selectedEmpFor1on1?.nome}</h2></div><button onClick={() => setIs1on1ModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all text-left"><X size={24} text-left/></button></div>
            <div className="flex flex-1 overflow-hidden text-left">
               <div className="w-1/2 border-r border-slate-100 flex flex-col bg-slate-50/30 text-slate-700 text-left">
                  <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-white text-left"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Sessões</span><button onClick={() => handleStartNew1on1(selectedEmpFor1on1)} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-[#FFC72C] text-[#244C5A] shadow-md text-left">Nova 1:1</button></div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
                    {specificOneOnOnes.map((item) => {
                        const sent = SENTIMENTS.find(s => s.value === item.sentimento) || SENTIMENTS[2];
                        const isDone = item.status === 'Finalizada';
                        return (<div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md group text-left text-slate-700"><div className="flex justify-between items-start mb-3 text-left"><div><div className="flex items-center gap-2 mb-1 text-left"><span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFC72C]/10 text-[#244C5A]'} text-left`}>{item.status || 'Agendada'}</span><span className="text-[10px] font-bold text-[#0097A9] uppercase text-left">{formatDate(item.data)}</span></div><h4 className={`font-bold text-[#244C5A] text-left ${isDone ? 'line-through text-slate-400' : ''}`}>{item.titulo}</h4></div><div className={`p-2 rounded-xl ${sent.bg} ${sent.color} text-left`} title={sent.label}><sent.icon size={18} text-left/></div></div><div className="text-xs text-slate-600 line-clamp-2 mb-4 whitespace-pre-wrap text-left">{item.decisoes}</div><div className="flex justify-between items-center pt-3 border-t border-slate-50 text-left"><div className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 text-left"><Calendar size={10} text-left/> {item.proximaPauta ? 'Pauta futura' : 'Sem pauta'}</div><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all text-left text-slate-700"><button onClick={() => toggle1on1Status(item.id, item.status)} className="p-1.5 text-slate-400 hover:text-emerald-600 text-left"><CheckCircle2 size={14} text-left/></button><button onClick={() => handleEdit1on1(item)} className="p-1.5 text-slate-400 hover:text-[#0097A9] text-left"><Edit3 size={14} text-left/></button><button onClick={() => delete1on1(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 text-left"><Trash2 size={14} text-left/></button></div></div></div>);
                    })}
                  </div>
               </div>
               <div className="w-1/2 overflow-y-auto bg-white p-10 text-slate-700 text-left">
                 {isAdding1on1 ? (
                   <form onSubmit={handleSubmit1on1} className="space-y-6 animate-in slide-in-from-right duration-300 text-left">
                     <h3 className="text-xl font-bold text-[#244C5A] flex items-center gap-2 text-left">{editing1on1Id ? 'Editar Sessão' : 'Registrar Conversa'}</h3>
                     <div className="grid grid-cols-2 gap-4 text-left"><div className="col-span-2 text-left"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest text-left">Título</label><input required value={form1on1.titulo} onChange={e => setForm1on1({...form1on1, titulo: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-left text-slate-700" /></div><div className="text-left"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest text-left">Data</label><input type="date" required value={form1on1.data} onChange={e => setForm1on1({...form1on1, data: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#0097A9] text-left text-slate-700"/></div><div className="text-left"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest text-left">Sentimento</label><div className="flex justify-between bg-slate-50 p-2 rounded-2xl border text-left">{SENTIMENTS.map(s => <button key={s.value} type="button" onClick={() => setForm1on1({...form1on1, sentimento: s.value})} className={`p-2 rounded-xl transition-all ${form1on1.sentimento === s.value ? `${s.bg} ${s.color} shadow-sm scale-110` : 'text-slate-300'} text-left`}><s.icon size={20} text-left/></button>)}</div></div></div>
                     <div className="text-left text-slate-700"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest text-left">Decisões</label><textarea required value={form1on1.decisoes} onChange={e => setForm1on1({...form1on1, decisoes: e.target.value})} rows="6" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#0097A9] text-sm resize-none text-left"></textarea></div>
                     <div className="text-left text-slate-700"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest text-left">Pauta Futura</label><textarea value={form1on1.proximaPauta} onChange={e => setForm1on1({...form1on1, proximaPauta: e.target.value})} rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0097A9] text-sm resize-none text-left" placeholder="O que deve ser discutido no próximo encontro?"></textarea></div>
                     <button type="submit" className="w-full bg-[#244C5A] text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-[#0097A9] transition-all flex items-center justify-center gap-2 text-left"><Save size={20} text-left/> {editing1on1Id ? 'Atualizar' : 'Salvar'} Registro</button>
                   </form>
                 ) : <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center text-left"><MessageSquare size={48} className="opacity-10 mb-4 text-left"/><p className="text-sm text-left">Selecione uma sessão ou crie uma nova.</p></div>}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FUNCIONÁRIO (EXISTENTE) */}
      {isModalOpen && (isMaster || isPreviewBypass || currentEmployeeProfile) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#244C5A]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-slate-700 text-left">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left border border-white/10 text-slate-700 text-left">
            <div className="bg-[#0097A9] p-6 flex justify-between items-center text-white shrink-0 text-left"><h2 className="text-xl font-bold flex items-center gap-3 text-left text-left"><UserPlus text-left/> {editingEmployee ? 'Editar' : 'Novo'} Colaborador</h2><button onClick={() => setIsModalOpen(false)} className="text-left"><X text-left/></button></div>
            <form onSubmit={handleSubmitEmployee} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto text-left text-slate-700 text-left">
              <div className="col-span-2 text-left"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest text-left">Nome Completo</label><input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-left text-slate-700" /></div>
              <div className="col-span-2 text-left"><label className="text-[10px] font-bold uppercase text-[#0097A9] block mb-2 tracking-widest text-left">E-mail Corporativo</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-[#0097A9]/5 border-2 border-[#0097A9]/10 rounded-2xl outline-none focus:border-[#0097A9] text-left text-slate-700" /></div>
              <div className="col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left"><div className="flex items-center justify-between mb-4 text-left text-slate-700"><div className="flex items-center gap-2 text-left"><Layers size={18} className="text-[#0097A9] text-left"/><label className="text-[10px] font-black uppercase text-[#244C5A] tracking-widest text-left">Squads (Max 5)</label></div><button type="button" onClick={addAllocation} disabled={formData.allocations.length >= 5} className="text-[10px] font-black uppercase text-[#0097A9] hover:bg-[#0097A9]/10 px-3 py-1.5 rounded-xl disabled:opacity-30 text-left">+ Add Squad</button></div><div className="space-y-3 text-left">
                    {formData.allocations.map((alloc, index) => (<div key={index} className="flex items-center gap-3 animate-in slide-in-from-left duration-200 text-left"><div className="flex-1 text-left"><select value={alloc.squad} onChange={e => updateAllocation(index, 'squad', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm text-left text-slate-700">{SQUADS.map(s => <option key={s} value={s}>{s}</option>)}</select></div><div className="w-24 relative text-left"><input type="number" value={alloc.percent} onChange={e => updateAllocation(index, 'percent', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm pr-8 font-bold text-[#0097A9] text-left text-slate-700" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 text-left">%</span></div>{formData.allocations.length > 1 && (<button type="button" onClick={() => removeAllocation(index)} className="text-slate-300 hover:text-red-500 text-left"><MinusCircle size={20} text-left/></button>)}</div>))}
                </div><div className="mt-4 flex items-center justify-between border-t pt-3 text-left text-slate-700"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-left">Total</span><div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${formData.allocations.reduce((sum, a) => sum + Number(a.percent), 0) === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'} text-left text-slate-700`}><span className="text-sm font-black text-left">{formData.allocations.reduce((sum, a) => sum + Number(a.percent), 0)}%</span></div></div></div>
              <div className="col-span-2 text-left text-slate-700"><label className="text-[10px] font-bold uppercase text-[#0097A9] flex items-center gap-2 mb-2 tracking-widest text-left"><ShieldCheck size={14} text-left/> Gestor Direto</label><select value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} disabled={!(isMaster || isPreviewBypass)} className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] ${!(isMaster || isPreviewBypass) ? 'opacity-50' : ''} text-left text-slate-700`}><option value="">Sem Gestor Direto</option>{employees.filter(e => e.id !== editingEmployee?.id).map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
              <div className="col-span-2 grid grid-cols-2 gap-4 text-left text-slate-700">
                  <div className="text-left text-slate-700"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest text-left">Cargo</label><input required value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-left text-slate-700" /></div>
                  <div className="text-left text-slate-700"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest text-left">Contrato</label><select value={formData.modeloTrabalho} onChange={e => setFormData({...formData, modeloTrabalho: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-left text-slate-700"><option value="CLT">CLT</option><option value="PJ">PJ</option><option value="Estagiário">Estagiário</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-2 text-left text-slate-700">
                  <div className="text-left text-slate-700"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest text-left">Senioridade</label><select value={formData.senioridade} onChange={e => setFormData({...formData, senioridade: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-left text-slate-700"><option value="Estagiário">Estagiário</option><option value="Júnior">Júnior</option><option value="Pleno">Pleno</option><option value="Sênior">Sênior</option><option value="Lead">Lead</option></select></div>
                  <div className="text-left text-slate-700"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest text-left">Salário Nominal (R$)</label><input required type="number" step="0.01" value={formData.salario} onChange={e => setFormData({...formData, salario: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-left text-slate-700" /></div>
              </div>
              <div className="col-span-2 text-left text-slate-700"><label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest text-left">Data Última Promoção</label><input type="date" value={formData.ultimaPromocao} onChange={e => setFormData({...formData, ultimaPromocao: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#0097A9] text-left text-slate-700" /></div>
            </form>
            <div className="p-8 bg-slate-50 border-t flex gap-4 text-left text-slate-700 justify-center items-center"><button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-all text-center">Cancelar</button><button onClick={handleSubmitEmployee} disabled={formData.allocations.reduce((sum, a) => sum + Number(a.percent), 0) !== 100} className="flex-[2] bg-[#FFC72C] text-[#244C5A] font-bold py-4 rounded-2xl shadow-xl hover:brightness-95 transition-all disabled:opacity-30 text-center">Salvar Registro</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;