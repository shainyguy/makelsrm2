import { useState, useMemo } from 'react';
import { Client, Interaction } from '../types';
import { cn } from '../utils/cn';

interface InteractionsProps {
  interactions: Interaction[];
  clients: Client[];
  onAddInteraction: (interaction: Omit<Interaction, 'id'>) => void;
  onDeleteInteraction: (id: string) => void;
}

export function Interactions({ interactions, clients, onAddInteraction, onDeleteInteraction }: InteractionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [filterClient, setFilterClient] = useState('');
  const [filterType, setFilterType] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'call' as Interaction['type'],
    date: today,
    notes: '',
    result: '',
    duration: 0
  });

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Неизвестный';
  };

  // Клиенты без контакта более 30 дней
  const inactiveClients = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return clients.filter(client => {
      if (client.status !== 'active') return false;
      const clientInteractions = interactions.filter(i => i.clientId === client.id);
      if (clientInteractions.length === 0) return true;
      const lastContact = clientInteractions.sort((a, b) => b.date.localeCompare(a.date))[0];
      return new Date(lastContact.date) < thirtyDaysAgo;
    }).map(client => {
      const clientInteractions = interactions.filter(i => i.clientId === client.id);
      const lastContact = clientInteractions.length > 0 
        ? clientInteractions.sort((a, b) => b.date.localeCompare(a.date))[0]
        : null;
      const daysSinceContact = lastContact 
        ? Math.floor((new Date().getTime() - new Date(lastContact.date).getTime()) / 86400000)
        : 999;
      return { ...client, daysSinceContact };
    });
  }, [clients, interactions]);

  const filteredInteractions = useMemo(() => {
    return interactions
      .filter(i => !filterClient || i.clientId === filterClient)
      .filter(i => !filterType || i.type === filterType)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [interactions, filterClient, filterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInteraction(formData);
    setShowModal(false);
    setFormData({
      clientId: '',
      type: 'call',
      date: today,
      notes: '',
      result: '',
      duration: 0
    });
  };

  const typeIcons: Record<Interaction['type'], React.ReactNode> = {
    call: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    meeting: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    email: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    message: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  };

  const typeColors: Record<Interaction['type'], string> = {
    call: 'bg-blue-500/10 text-blue-600',
    meeting: 'bg-purple-500/10 text-purple-600',
    email: 'bg-emerald-500/10 text-emerald-600',
    message: 'bg-orange-500/10 text-orange-600'
  };

  const typeLabels: Record<Interaction['type'], string> = {
    call: 'Звонок',
    meeting: 'Встреча',
    email: 'Email',
    message: 'Сообщение'
  };

  // Статистика
  const stats = useMemo(() => {
    const thisMonth = today.slice(0, 7);
    const monthInteractions = interactions.filter(i => i.date.startsWith(thisMonth));
    return {
      calls: monthInteractions.filter(i => i.type === 'call').length,
      meetings: monthInteractions.filter(i => i.type === 'meeting').length,
      emails: monthInteractions.filter(i => i.type === 'email').length,
      total: monthInteractions.length
    };
  }, [interactions, today]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">История взаимодействий</h1>
          <p className="text-slate-500 mt-1">Журнал звонков, встреч и переписок</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить контакт
        </button>
      </div>

      {/* Статистика за месяц */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">Звонков</p>
          <p className="text-3xl font-bold mt-1">{stats.calls}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">Встреч</p>
          <p className="text-3xl font-bold mt-1">{stats.meetings}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white">
          <p className="text-emerald-100 text-sm">Email</p>
          <p className="text-3xl font-bold mt-1">{stats.emails}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-orange-100 text-sm">Всего за месяц</p>
          <p className="text-3xl font-bold mt-1">{stats.total}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Список взаимодействий */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {/* Фильтры */}
          <div className="flex gap-4 mb-6">
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
            >
              <option value="">Все клиенты</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
            >
              <option value="">Все типы</option>
              <option value="call">Звонки</option>
              <option value="meeting">Встречи</option>
              <option value="email">Email</option>
              <option value="message">Сообщения</option>
            </select>
          </div>

          {/* Список */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredInteractions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>Нет записей</p>
              </div>
            ) : (
              filteredInteractions.map(interaction => (
                <div key={interaction.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', typeColors[interaction.type])}>
                    {typeIcons[interaction.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{getClientName(interaction.clientId)}</h3>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', typeColors[interaction.type])}>
                        {typeLabels[interaction.type]}
                      </span>
                      {interaction.duration && (
                        <span className="text-xs text-slate-500">{interaction.duration} мин</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{interaction.notes}</p>
                    {interaction.result && (
                      <p className="text-sm text-emerald-600">Результат: {interaction.result}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(interaction.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteInteraction(interaction.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Клиенты без контакта */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Требуют внимания
          </h2>
          <p className="text-sm text-slate-500 mb-4">Клиенты без контакта более 30 дней</p>
          
          {inactiveClients.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Все клиенты на связи! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inactiveClients.map(client => (
                <div key={client.id} className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h3 className="font-semibold text-slate-800">{client.name}</h3>
                  <p className="text-sm text-slate-500">{client.contactPerson}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-red-600 font-medium">
                      {client.daysSinceContact === 999 ? 'Никогда не связывались' : `${client.daysSinceContact} дней назад`}
                    </span>
                    <button
                      onClick={() => {
                        setFormData({ ...formData, clientId: client.id });
                        setShowModal(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Связаться
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Новый контакт</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Клиент</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  required
                >
                  <option value="">Выберите клиента</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Тип</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Interaction['type'] })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  >
                    <option value="call">Звонок</option>
                    <option value="meeting">Встреча</option>
                    <option value="email">Email</option>
                    <option value="message">Сообщение</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Дата</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              {(formData.type === 'call' || formData.type === 'meeting') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Длительность (мин)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Результат</label>
                <input
                  type="text"
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  placeholder="Итог разговора/встречи"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
