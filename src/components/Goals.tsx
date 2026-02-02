import { Goal, Shipment, Interaction, Client } from '../types';
import { cn } from '../utils/cn';

interface GoalsProps {
  goals: Goal[];
  shipments: Shipment[];
  interactions: Interaction[];
  clients: Client[];
}

export function Goals({ goals, shipments, interactions, clients }: GoalsProps) {
  const today = new Date();
  const thisMonth = today.toISOString().slice(0, 7);

  // Автоматически обновляем прогресс
  const goalsWithProgress = goals.map(goal => {
    let current = goal.current;
    
    if (goal.period === 'month' && goal.startDate.startsWith(thisMonth.slice(0, 7))) {
      switch (goal.type) {
        case 'revenue':
          current = shipments
            .filter(s => s.date >= goal.startDate && s.date <= goal.endDate)
            .reduce((sum, s) => sum + s.amount, 0);
          break;
        case 'shipments':
          current = shipments.filter(s => s.date >= goal.startDate && s.date <= goal.endDate).length;
          break;
        case 'clients':
          current = clients.filter(c => c.createdAt >= goal.startDate && c.createdAt <= goal.endDate).length;
          break;
        case 'calls':
          current = interactions.filter(i => i.type === 'call' && i.date >= goal.startDate && i.date <= goal.endDate).length;
          break;
        case 'meetings':
          current = interactions.filter(i => i.type === 'meeting' && i.date >= goal.startDate && i.date <= goal.endDate).length;
          break;
      }
    }

    const progress = Math.min((current / goal.target) * 100, 100);
    const daysLeft = Math.max(0, Math.ceil((new Date(goal.endDate).getTime() - today.getTime()) / 86400000));
    const daysTotal = Math.ceil((new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / 86400000);
    const daysPassed = daysTotal - daysLeft;
    const expectedProgress = (daysPassed / daysTotal) * 100;
    const onTrack = progress >= expectedProgress * 0.9;

    return { ...goal, current, progress, daysLeft, onTrack };
  });

  const typeLabels: Record<Goal['type'], string> = {
    revenue: 'Выручка',
    shipments: 'Отгрузки',
    clients: 'Новые клиенты',
    calls: 'Звонки',
    meetings: 'Встречи'
  };

  const typeIcons: Record<Goal['type'], React.ReactNode> = {
    revenue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    shipments: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    clients: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    calls: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    meetings: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  };

  const typeColors: Record<Goal['type'], string> = {
    revenue: 'from-emerald-400 to-emerald-600',
    shipments: 'from-blue-400 to-blue-600',
    clients: 'from-purple-400 to-purple-600',
    calls: 'from-orange-400 to-orange-600',
    meetings: 'from-pink-400 to-pink-600'
  };

  const formatValue = (type: Goal['type'], value: number) => {
    if (type === 'revenue') {
      return `${(value / 1000000).toFixed(2)} М ₽`;
    }
    return value.toString();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Цели и KPI</h1>
        <p className="text-slate-500 mt-1">Отслеживайте выполнение планов</p>
      </div>

      {/* Общий прогресс */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-bold mb-6">Общий прогресс за месяц</h2>
        <div className="grid grid-cols-4 gap-6">
          {goalsWithProgress.map(goal => (
            <div key={goal.id} className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/10"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${goal.progress * 2.51} 251`}
                    className={goal.onTrack ? 'text-emerald-400' : 'text-orange-400'}
                  />
                </svg>
                <span className="absolute text-2xl font-bold">{goal.progress.toFixed(0)}%</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">{typeLabels[goal.type]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Детальные карточки */}
      <div className="grid grid-cols-2 gap-6">
        {goalsWithProgress.map(goal => (
          <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', typeColors[goal.type])}>
                  {typeIcons[goal.type]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{goal.title}</h3>
                  <p className="text-sm text-slate-500">{typeLabels[goal.type]}</p>
                </div>
              </div>
              <span className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                goal.onTrack ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
              )}>
                {goal.onTrack ? 'По плану' : 'Отстаём'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Прогресс</span>
                  <span className="font-semibold text-slate-800">
                    {formatValue(goal.type, goal.current)} / {formatValue(goal.type, goal.target)}
                  </span>
                </div>
                <div className="bg-slate-100 rounded-full h-3">
                  <div 
                    className={cn('rounded-full h-3 transition-all bg-gradient-to-r', typeColors[goal.type])}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Осталось дней</span>
                <span className={cn('font-medium', goal.daysLeft <= 7 ? 'text-red-600' : 'text-slate-800')}>
                  {goal.daysLeft}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Выполнено</span>
                <span className={cn('font-bold text-lg', goal.progress >= 100 ? 'text-emerald-600' : 'text-slate-800')}>
                  {goal.progress.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Советы */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-2">💡 Рекомендации</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          {goalsWithProgress.filter(g => !g.onTrack).map(goal => (
            <li key={goal.id}>
              • {goal.type === 'revenue' && 'Увеличьте средний чек или количество сделок'}
              {goal.type === 'calls' && 'Запланируйте больше звонков на эту неделю'}
              {goal.type === 'meetings' && 'Назначьте дополнительные встречи с клиентами'}
              {goal.type === 'clients' && 'Активнее работайте с потенциальными клиентами'}
              {goal.type === 'shipments' && 'Ускорьте обработку текущих заказов'}
            </li>
          ))}
          {goalsWithProgress.every(g => g.onTrack) && (
            <li>Отличная работа! Все показатели в норме. Продолжайте в том же духе! 🚀</li>
          )}
        </ul>
      </div>
    </div>
  );
}
