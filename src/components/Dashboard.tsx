import { Client, Shipment, Task, Deal } from '../types';
import { cn } from '../utils/cn';

interface DashboardProps {
  clients: Client[];
  shipments: Shipment[];
  tasks: Task[];
  deals: Deal[];
  onTaskComplete: (id: string) => void;
}

export function Dashboard({ clients, shipments, tasks, deals, onTaskComplete }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const todayShipments = shipments.filter(s => s.date === today);
  const todayTasks = tasks.filter(t => t.dueDate === today && !t.completed);
  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
  
  const totalPipeline = activeDeals.reduce((sum, d) => sum + d.amount, 0);
  const monthShipments = shipments.filter(s => s.date.startsWith(today.slice(0, 7)));
  const monthRevenue = monthShipments.reduce((sum, s) => sum + s.amount, 0);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Неизвестный клиент';
  };

  const priorityColors = {
    high: 'text-red-500 bg-red-500/10',
    medium: 'text-orange-500 bg-orange-500/10',
    low: 'text-blue-500 bg-blue-500/10'
  };

  const shipmentStatusColors = {
    planned: 'bg-blue-500/10 text-blue-600',
    in_progress: 'bg-yellow-500/10 text-yellow-600',
    shipped: 'bg-purple-500/10 text-purple-600',
    delivered: 'bg-emerald-500/10 text-emerald-600'
  };

  const shipmentStatusLabels = {
    planned: 'Запланировано',
    in_progress: 'В процессе',
    shipped: 'Отгружено',
    delivered: 'Доставлено'
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Добро пожаловать! 👋</h1>
        <p className="text-slate-500 mt-1">Вот что происходит сегодня, {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Отгрузок сегодня</p>
              <p className="text-4xl font-bold mt-2">{todayShipments.length}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Выручка за месяц</p>
              <p className="text-3xl font-bold mt-2">{(monthRevenue / 1000000).toFixed(1)}М ₽</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">В воронке</p>
              <p className="text-3xl font-bold mt-2">{(totalPipeline / 1000000).toFixed(1)}М ₽</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18l-6 8v6l-6 2V12L3 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Активных клиентов</p>
              <p className="text-4xl font-bold mt-2">{clients.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Today's Shipments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Отгрузки сегодня</h2>
            <span className="text-sm text-slate-500">{todayShipments.length} шт</span>
          </div>
          
          {todayShipments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>На сегодня отгрузок нет</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayShipments.map(shipment => (
                <div key={shipment.id} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{getClientName(shipment.clientId)}</h3>
                      <p className="text-sm text-slate-500 mt-1">{shipment.products}</p>
                      {shipment.notes && (
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          {shipment.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={cn('text-xs font-medium px-2 py-1 rounded-full', shipmentStatusColors[shipment.status])}>
                        {shipmentStatusLabels[shipment.status]}
                      </span>
                      <p className="text-lg font-bold text-slate-800 mt-2">{shipment.amount.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Задачи на сегодня</h2>
            <span className="text-sm text-slate-500">{todayTasks.length} шт</span>
          </div>
          
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Все задачи выполнены! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <button
                    onClick={() => onTaskComplete(task.id)}
                    className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-500 transition-colors flex-shrink-0 mt-0.5 group-hover:border-emerald-400 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-800 truncate">{task.title}</h3>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', priorityColors[task.priority])}>
                        {task.priority === 'high' ? 'Важно' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 truncate">{task.description}</p>
                    )}
                    {task.clientId && (
                      <p className="text-xs text-blue-600 mt-1">{getClientName(task.clientId)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Shipments */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Ближайшие отгрузки</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Дата</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Клиент</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Товары</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Сумма</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shipments
                .filter(s => s.date >= today)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 5)
                .map(shipment => (
                  <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <span className={cn(
                        'font-medium',
                        shipment.date === today ? 'text-orange-600' : 'text-slate-700'
                      )}>
                        {new Date(shipment.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-slate-800">{getClientName(shipment.clientId)}</td>
                    <td className="py-4 text-slate-600 text-sm max-w-xs truncate">{shipment.products}</td>
                    <td className="py-4 font-semibold text-slate-800">{shipment.amount.toLocaleString('ru-RU')} ₽</td>
                    <td className="py-4">
                      <span className={cn('text-xs font-medium px-2 py-1 rounded-full', shipmentStatusColors[shipment.status])}>
                        {shipmentStatusLabels[shipment.status]}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
