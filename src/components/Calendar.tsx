import { useState } from 'react';
import { Client, Shipment } from '../types';
import { cn } from '../utils/cn';

interface CalendarProps {
  shipments: Shipment[];
  clients: Client[];
  onAddShipment: (shipment: Omit<Shipment, 'id'>) => void;
  onUpdateShipment: (id: string, shipment: Partial<Shipment>) => void;
  onDeleteShipment: (id: string) => void;
}

export function Calendar({ shipments, clients, onAddShipment, onUpdateShipment, onDeleteShipment }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    products: '',
    amount: 0,
    notes: '',
    status: 'planned' as Shipment['status']
  });

  const today = new Date().toISOString().split('T')[0];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const startDay = firstDayOfMonth.getDay() || 7;
  const daysInMonth = lastDayOfMonth.getDate();
  
  const days: (number | null)[] = [];
  for (let i = 1; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getShipmentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return shipments.filter(s => s.date === dateStr);
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Неизвестный';
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleAddClick = () => {
    setEditingShipment(null);
    setFormData({
      clientId: clients[0]?.id || '',
      products: '',
      amount: 0,
      notes: '',
      status: 'planned'
    });
    setShowModal(true);
  };

  const handleEditClick = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setFormData({
      clientId: shipment.clientId,
      products: shipment.products,
      amount: shipment.amount,
      notes: shipment.notes,
      status: shipment.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShipment) {
      onUpdateShipment(editingShipment.id, formData);
    } else if (selectedDate) {
      onAddShipment({
        ...formData,
        date: selectedDate
      });
    }
    setShowModal(false);
  };

  const statusColors = {
    planned: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-emerald-500'
  };

  const statusLabels = {
    planned: 'Запланировано',
    in_progress: 'В процессе',
    shipped: 'Отгружено',
    delivered: 'Доставлено'
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const selectedShipments = selectedDate ? shipments.filter(s => s.date === selectedDate) : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Календарь отгрузок</h1>
          <p className="text-slate-500 mt-1">Планируйте и отслеживайте все отгрузки</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Сегодня
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase py-2">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-24" />;
              }
              
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayShipments = getShipmentsForDay(day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'h-24 p-2 rounded-xl border-2 transition-all text-left flex flex-col',
                    isToday ? 'border-orange-300 bg-orange-50' : 'border-transparent hover:border-slate-200',
                    isSelected && 'border-blue-500 bg-blue-50'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    isToday ? 'text-orange-600' : 'text-slate-700'
                  )}>
                    {day}
                  </span>
                  <div className="flex-1 overflow-hidden mt-1 space-y-1">
                    {dayShipments.slice(0, 2).map(shipment => (
                      <div
                        key={shipment.id}
                        className={cn('text-xs text-white px-1.5 py-0.5 rounded truncate', statusColors[shipment.status])}
                      >
                        {getClientName(shipment.clientId).slice(0, 15)}
                      </div>
                    ))}
                    {dayShipments.length > 2 && (
                      <span className="text-xs text-slate-500">+{dayShipments.length - 2}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              {selectedDate 
                ? new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                : 'Выберите дату'
              }
            </h2>
            {selectedDate && (
              <button
                onClick={handleAddClick}
                className="p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          {!selectedDate ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Кликните на день в календаре</p>
            </div>
          ) : selectedShipments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>Нет отгрузок на этот день</p>
              <button
                onClick={handleAddClick}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                + Добавить отгрузку
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedShipments.map(shipment => (
                <div key={shipment.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{getClientName(shipment.clientId)}</h3>
                      <p className="text-sm text-slate-500 mt-1">{shipment.products}</p>
                      <p className="text-lg font-bold text-slate-800 mt-2">{shipment.amount.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <span className={cn('text-xs text-white px-2 py-1 rounded-full', statusColors[shipment.status])}>
                      {statusLabels[shipment.status]}
                    </span>
                  </div>
                  {shipment.notes && (
                    <p className="text-xs text-orange-600 mt-3 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {shipment.notes}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditClick(shipment)}
                      className="flex-1 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => onDeleteShipment(shipment.id)}
                      className="flex-1 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingShipment ? 'Редактировать отгрузку' : 'Новая отгрузка'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Клиент</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  required
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Товары</label>
                <textarea
                  value={formData.products}
                  onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="Розетки (100 шт), Выключатели (50 шт)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Сумма (₽)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Shipment['status'] })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="planned">Запланировано</option>
                  <option value="in_progress">В процессе</option>
                  <option value="shipped">Отгружено</option>
                  <option value="delivered">Доставлено</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Заметка</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="Доставка до 14:00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
                >
                  {editingShipment ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
