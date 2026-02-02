import { useState } from 'react';
import { Client, Shipment } from '../types';
import { cn } from '../utils/cn';

interface ClientsProps {
  clients: Client[];
  shipments: Shipment[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdateClient: (id: string, client: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
}

export function Clients({ clients, shipments, onAddClient, onUpdateClient, onDeleteClient }: ClientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    status: 'active' as Client['status']
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientShipments = (clientId: string) => {
    return shipments.filter(s => s.clientId === clientId);
  };

  const getClientStats = (clientId: string) => {
    const clientShipments = getClientShipments(clientId);
    return {
      totalShipments: clientShipments.length,
      totalRevenue: clientShipments.reduce((sum, s) => sum + s.amount, 0)
    };
  };

  const handleAddClick = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      contactPerson: client.contactPerson,
      phone: client.phone,
      email: client.email,
      address: client.address,
      notes: client.notes,
      status: client.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onUpdateClient(editingClient.id, formData);
    } else {
      onAddClient(formData);
    }
    setShowModal(false);
  };

  const statusColors = {
    active: 'bg-emerald-500/10 text-emerald-600',
    inactive: 'bg-slate-500/10 text-slate-600',
    potential: 'bg-blue-500/10 text-blue-600'
  };

  const statusLabels = {
    active: 'Активный',
    inactive: 'Неактивный',
    potential: 'Потенциальный'
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">База клиентов</h1>
          <p className="text-slate-500 mt-1">Управляйте контактами и историей взаимодействий</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить клиента
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Clients List */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или контакту..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredClients.map(client => {
              const stats = getClientStats(client.id);
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                    selectedClient?.id === client.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-transparent bg-slate-50 hover:border-slate-200'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{client.name}</h3>
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColors[client.status])}>
                          {statusLabels[client.status]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{client.contactPerson}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">{stats.totalShipments} отгрузок</p>
                      <p className="text-xs text-slate-500">{(stats.totalRevenue / 1000).toFixed(0)}K ₽</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredClients.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>Клиенты не найдены</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {!selectedClient ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p>Выберите клиента из списка</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusColors[selectedClient.status])}>
                  {statusLabels[selectedClient.status]}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(selectedClient)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      onDeleteClient(selectedClient.id);
                      setSelectedClient(null);
                    }}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedClient.name}</h2>
              <p className="text-slate-500 mb-6">{selectedClient.contactPerson}</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Телефон</p>
                    <p className="font-medium text-slate-800">{selectedClient.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-800">{selectedClient.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Адрес</p>
                    <p className="font-medium text-slate-800">{selectedClient.address}</p>
                  </div>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Заметки</p>
                  <p className="text-sm text-slate-700">{selectedClient.notes}</p>
                </div>
              )}

              {/* Client shipments history */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">История отгрузок</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getClientShipments(selectedClient.id).length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Нет отгрузок</p>
                  ) : (
                    getClientShipments(selectedClient.id)
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(shipment => (
                        <div key={shipment.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {new Date(shipment.date).toLocaleDateString('ru-RU')}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{shipment.products}</p>
                          </div>
                          <p className="text-sm font-semibold text-slate-800">{shipment.amount.toLocaleString('ru-RU')} ₽</p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingClient ? 'Редактировать клиента' : 'Новый клиент'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название компании</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder='ООО "Компания"'
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Контактное лицо</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="+7 (XXX) XXX-XX-XX"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="email@company.ru"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Адрес</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="г. Москва, ул. Примерная, 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Client['status'] })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="active">Активный</option>
                  <option value="potential">Потенциальный</option>
                  <option value="inactive">Неактивный</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Заметки</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Дополнительная информация о клиенте..."
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
                  {editingClient ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
