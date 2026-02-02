import { useState, useMemo } from 'react';
import { ViewType, Client, Shipment, Task, Deal, Interaction, Product, Goal, ManagerProfile, ThemeMode } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { initialClients, initialShipments, initialTasks, initialDeals, initialInteractions, initialProducts, initialGoals, initialProfile } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { Clients } from './components/Clients';
import { Deals } from './components/Deals';
import { Tasks } from './components/Tasks';
import { Analytics } from './components/Analytics';
import { Interactions } from './components/Interactions';
import { Goals } from './components/Goals';
import { Products } from './components/Products';
import { Profile } from './components/Profile';
import { cn } from './utils/cn';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [theme, setTheme] = useLocalStorage<ThemeMode>('makel-theme', 'light');
  
  // Data with localStorage persistence
  const [clients, setClients] = useLocalStorage<Client[]>('makel-clients', initialClients);
  const [shipments, setShipments] = useLocalStorage<Shipment[]>('makel-shipments', initialShipments);
  const [tasks, setTasks] = useLocalStorage<Task[]>('makel-tasks', initialTasks);
  const [deals, setDeals] = useLocalStorage<Deal[]>('makel-deals', initialDeals);
  const [interactions, setInteractions] = useLocalStorage<Interaction[]>('makel-interactions', initialInteractions);
  const [products, setProducts] = useLocalStorage<Product[]>('makel-products', initialProducts);
  const [goals] = useLocalStorage<Goal[]>('makel-goals', initialGoals);
  const [profile, setProfile] = useLocalStorage<ManagerProfile>('makel-profile', initialProfile);

  const today = new Date().toISOString().split('T')[0];

  // Stats for sidebar
  const stats = useMemo(() => ({
    todayTasks: tasks.filter(t => t.dueDate === today && !t.completed).length,
    todayShipments: shipments.filter(s => s.date === today).length,
    activeDeals: deals.filter(d => !['won', 'lost'].includes(d.stage)).length,
    reminders: 0
  }), [tasks, shipments, deals, today]);

  // Client handlers
  const handleAddClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: today
    };
    setClients(prev => [...prev, newClient]);
  };

  const handleUpdateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...clientData } : c));
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Удалить клиента?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  // Shipment handlers
  const handleAddShipment = (shipmentData: Omit<Shipment, 'id'>) => {
    const newShipment: Shipment = {
      ...shipmentData,
      id: generateId()
    };
    setShipments(prev => [...prev, newShipment]);
  };

  const handleUpdateShipment = (id: string, shipmentData: Partial<Shipment>) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, ...shipmentData } : s));
  };

  const handleDeleteShipment = (id: string) => {
    if (confirm('Удалить отгрузку?')) {
      setShipments(prev => prev.filter(s => s.id !== id));
    }
  };

  // Task handlers
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: today
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (id: string, taskData: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...taskData } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
  };

  // Deal handlers
  const handleAddDeal = (dealData: Omit<Deal, 'id' | 'createdAt'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: generateId(),
      createdAt: today
    };
    setDeals(prev => [...prev, newDeal]);
  };

  const handleUpdateDeal = (id: string, dealData: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...dealData } : d));
  };

  const handleDeleteDeal = (id: string) => {
    if (confirm('Удалить сделку?')) {
      setDeals(prev => prev.filter(d => d.id !== id));
    }
  };

  // Interaction handlers
  const handleAddInteraction = (data: Omit<Interaction, 'id'>) => {
    const newInteraction: Interaction = {
      ...data,
      id: generateId()
    };
    setInteractions(prev => [...prev, newInteraction]);
  };

  const handleDeleteInteraction = (id: string) => {
    setInteractions(prev => prev.filter(i => i.id !== id));
  };

  // Product handlers
  const handleAddProduct = (data: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...data,
      id: generateId()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Удалить товар?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleImportProducts = (importedProducts: Omit<Product, 'id'>[]) => {
    const newProducts = importedProducts.map(p => ({
      ...p,
      id: generateId()
    }));
    setProducts(prev => [...prev, ...newProducts]);
  };

  // Profile handlers
  const handleUpdateProfile = (data: Partial<ManagerProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            clients={clients}
            shipments={shipments}
            tasks={tasks}
            deals={deals}
            onTaskComplete={handleTaskComplete}
          />
        );
      case 'calendar':
        return (
          <Calendar
            shipments={shipments}
            clients={clients}
            onAddShipment={handleAddShipment}
            onUpdateShipment={handleUpdateShipment}
            onDeleteShipment={handleDeleteShipment}
          />
        );
      case 'clients':
        return (
          <Clients
            clients={clients}
            shipments={shipments}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'deals':
        return (
          <Deals
            deals={deals}
            clients={clients}
            onAddDeal={handleAddDeal}
            onUpdateDeal={handleUpdateDeal}
            onDeleteDeal={handleDeleteDeal}
          />
        );
      case 'tasks':
        return (
          <Tasks
            tasks={tasks}
            clients={clients}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'analytics':
        return (
          <Analytics
            clients={clients}
            shipments={shipments}
            deals={deals}
          />
        );
      case 'interactions':
        return (
          <Interactions
            interactions={interactions}
            clients={clients}
            onAddInteraction={handleAddInteraction}
            onDeleteInteraction={handleDeleteInteraction}
          />
        );
      case 'goals':
        return (
          <Goals
            goals={goals}
            shipments={shipments}
            interactions={interactions}
            clients={clients}
          />
        );
      case 'products':
        return (
          <Products
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onImportProducts={handleImportProducts}
          />
        );
      case 'profile':
        return (
          <Profile
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            clients={clients}
            shipments={shipments}
            deals={deals}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen transition-colors",
      theme === 'dark' 
        ? "bg-slate-900" 
        : "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50"
    )}>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        stats={stats}
        theme={theme}
      />
      <main className={cn(
        "flex-1 overflow-auto transition-colors",
        theme === 'dark' && "[&_*]:text-slate-100 [&_.bg-white]:bg-slate-800 [&_.bg-slate-50]:bg-slate-700 [&_.border-slate-100]:border-slate-700 [&_.text-slate-800]:text-slate-100 [&_.text-slate-500]:text-slate-400 [&_.text-slate-600]:text-slate-300 [&_.text-slate-700]:text-slate-200"
      )}>
        {renderView()}
      </main>
    </div>
  );
}
