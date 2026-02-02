import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Client, Shipment, Deal } from '../types';

interface AnalyticsProps {
  clients: Client[];
  shipments: Shipment[];
  deals: Deal[];
}

export function Analytics({ clients, shipments, deals }: AnalyticsProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Данные по месяцам за последние 6 месяцев
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const monthShipments = shipments.filter(s => s.date.startsWith(monthStr));
      const revenue = monthShipments.reduce((sum, s) => sum + s.amount, 0);
      
      data.push({
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        revenue: revenue,
        shipments: monthShipments.length
      });
    }
    return data;
  }, [shipments, currentMonth, currentYear]);

  // Топ-10 клиентов по выручке
  const topClients = useMemo(() => {
    const clientRevenue: Record<string, number> = {};
    shipments.forEach(s => {
      clientRevenue[s.clientId] = (clientRevenue[s.clientId] || 0) + s.amount;
    });
    
    return Object.entries(clientRevenue)
      .map(([clientId, revenue]) => ({
        name: clients.find(c => c.id === clientId)?.name || 'Неизвестный',
        revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [clients, shipments]);

  // Сравнение периодов
  const periodComparison = useMemo(() => {
    const thisMonth = today.toISOString().slice(0, 7);
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    const thisMonthRevenue = shipments
      .filter(s => s.date.startsWith(thisMonth))
      .reduce((sum, s) => sum + s.amount, 0);
    
    const lastMonthRevenue = shipments
      .filter(s => s.date.startsWith(lastMonth))
      .reduce((sum, s) => sum + s.amount, 0);

    const change = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    return { thisMonthRevenue, lastMonthRevenue, change };
  }, [shipments, currentMonth, currentYear, today]);

  // Воронка продаж
  const funnelData = useMemo(() => {
    const stages = [
      { id: 'lead', name: 'Лиды', color: '#64748b' },
      { id: 'negotiation', name: 'Переговоры', color: '#3b82f6' },
      { id: 'proposal', name: 'КП отправлено', color: '#8b5cf6' },
      { id: 'contract', name: 'Договор', color: '#f97316' },
      { id: 'won', name: 'Выиграно', color: '#10b981' },
    ];

    return stages.map(stage => ({
      name: stage.name,
      value: deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + d.amount, 0),
      count: deals.filter(d => d.stage === stage.id).length,
      color: stage.color
    }));
  }, [deals]);

  // Прогноз выполнения плана
  const planForecast = useMemo(() => {
    const monthPlan = 3000000;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = today.getDate();
    const thisMonth = today.toISOString().slice(0, 7);
    
    const currentRevenue = shipments
      .filter(s => s.date.startsWith(thisMonth))
      .reduce((sum, s) => sum + s.amount, 0);

    const dailyAverage = currentRevenue / currentDay;
    const forecast = dailyAverage * daysInMonth;
    const completion = (currentRevenue / monthPlan * 100).toFixed(1);

    return { monthPlan, currentRevenue, forecast, completion, dailyAverage };
  }, [shipments, currentMonth, currentYear, today]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Аналитика</h1>
        <p className="text-slate-500 mt-1">Отчёты и статистика продаж</p>
      </div>

      {/* Сравнение периодов */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Этот месяц</p>
          <p className="text-2xl font-bold text-slate-800">
            {(periodComparison.thisMonthRevenue / 1000000).toFixed(2)} М ₽
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Прошлый месяц</p>
          <p className="text-2xl font-bold text-slate-800">
            {(periodComparison.lastMonthRevenue / 1000000).toFixed(2)} М ₽
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Изменение</p>
          <p className={`text-2xl font-bold ${Number(periodComparison.change) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {Number(periodComparison.change) >= 0 ? '+' : ''}{periodComparison.change}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <p className="text-orange-100 text-sm mb-1">Выполнение плана</p>
          <p className="text-3xl font-bold">{planForecast.completion}%</p>
          <div className="mt-2 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all" 
              style={{ width: `${Math.min(Number(planForecast.completion), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-2 gap-6">
        {/* Продажи по месяцам */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Продажи по месяцам</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(v) => `${(v/1000000).toFixed(1)}М`} />
              <Tooltip 
                formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Выручка']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Прогноз */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Прогноз выполнения плана</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">План на месяц</span>
                <span className="font-semibold text-slate-800">{(planForecast.monthPlan / 1000000).toFixed(1)} М ₽</span>
              </div>
              <div className="bg-slate-100 rounded-full h-4">
                <div className="bg-slate-300 rounded-full h-4" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Текущая выручка</span>
                <span className="font-semibold text-emerald-600">{(planForecast.currentRevenue / 1000000).toFixed(2)} М ₽</span>
              </div>
              <div className="bg-slate-100 rounded-full h-4">
                <div 
                  className="bg-emerald-500 rounded-full h-4 transition-all" 
                  style={{ width: `${Math.min(planForecast.currentRevenue / planForecast.monthPlan * 100, 100)}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Прогноз на конец месяца</span>
                <span className={`font-semibold ${planForecast.forecast >= planForecast.monthPlan ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {(planForecast.forecast / 1000000).toFixed(2)} М ₽
                </span>
              </div>
              <div className="bg-slate-100 rounded-full h-4">
                <div 
                  className={`rounded-full h-4 transition-all ${planForecast.forecast >= planForecast.monthPlan ? 'bg-emerald-400' : 'bg-orange-400'}`}
                  style={{ width: `${Math.min(planForecast.forecast / planForecast.monthPlan * 100, 100)}%` }} 
                />
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-500">
                Средняя выручка в день: <span className="font-semibold text-slate-800">{(planForecast.dailyAverage / 1000).toFixed(0)}K ₽</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Топ клиентов и воронка */}
      <div className="grid grid-cols-2 gap-6">
        {/* Топ-10 клиентов */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Топ-10 клиентов по выручке</h2>
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < 3 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{client.name}</p>
                  <div className="bg-slate-100 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-orange-500 rounded-full h-1.5" 
                      style={{ width: `${(client.revenue / (topClients[0]?.revenue || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-semibold text-slate-800 whitespace-nowrap">
                  {(client.revenue / 1000).toFixed(0)}K ₽
                </span>
              </div>
            ))}
            {topClients.length === 0 && (
              <p className="text-center text-slate-400 py-8">Нет данных об отгрузках</p>
            )}
          </div>
        </div>

        {/* Воронка продаж */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Воронка продаж</h2>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={funnelData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${(Number(value)/1000000).toFixed(2)} М ₽`]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {funnelData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.count} сделок</p>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {(item.value / 1000000).toFixed(2)}М
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Тренд отгрузок */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Количество отгрузок по месяцам</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="shipments" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
