import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ManagerProfile, Client, Shipment, Deal, ThemeMode } from '../types';

interface ProfileProps {
  profile: ManagerProfile;
  onUpdateProfile: (data: Partial<ManagerProfile>) => void;
  clients: Client[];
  shipments: Shipment[];
  deals: Deal[];
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function Profile({ profile, onUpdateProfile, clients, shipments, deals, theme, onToggleTheme }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  // Экспорт всех данных в Excel
  const handleExportAll = () => {
    const workbook = XLSX.utils.book_new();

    // Клиенты
    const clientsData = clients.map(c => ({
      'Название': c.name,
      'Контактное лицо': c.contactPerson,
      'Телефон': c.phone,
      'Email': c.email,
      'Адрес': c.address,
      'Статус': c.status,
      'ИНН': c.inn || '',
      'Дата создания': c.createdAt
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(clientsData), 'Клиенты');

    // Отгрузки
    const shipmentsData = shipments.map(s => ({
      'Дата': s.date,
      'Клиент': clients.find(c => c.id === s.clientId)?.name || '',
      'Товары': s.products,
      'Сумма': s.amount,
      'Статус': s.status,
      'Заметки': s.notes
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(shipmentsData), 'Отгрузки');

    // Сделки
    const dealsData = deals.map(d => ({
      'Название': d.title,
      'Клиент': clients.find(c => c.id === d.clientId)?.name || '',
      'Сумма': d.amount,
      'Этап': d.stage,
      'Вероятность': d.probability,
      'Дата создания': d.createdAt
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dealsData), 'Сделки');

    XLSX.writeFile(workbook, 'makel_crm_export.xlsx');
  };

  // Статистика менеджера
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalShipments: shipments.length,
    totalRevenue: shipments.reduce((sum, s) => sum + s.amount, 0),
    wonDeals: deals.filter(d => d.stage === 'won').length,
    wonAmount: deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.amount, 0),
    daysWorking: Math.floor((new Date().getTime() - new Date(profile.startDate).getTime()) / 86400000)
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Личный кабинет</h1>
        <p className="text-slate-500 mt-1">Настройки профиля и экспорт данных</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Профиль */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{profile.name}</h2>
                <p className="text-slate-500">{profile.position}</p>
                <p className="text-sm text-slate-400 mt-1">В компании {stats.daysWorking} дней</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
            >
              {isEditing ? 'Отмена' : 'Редактировать'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ФИО</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Должность</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600">
                Сохранить
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-800">{profile.email}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Телефон</p>
                <p className="font-medium text-slate-800">{profile.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Настройки */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Настройки</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-medium text-slate-800">Тёмная тема</p>
                <p className="text-sm text-slate-500">Для работы вечером</p>
              </div>
              <button
                onClick={onToggleTheme}
                className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-orange-500' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <button
              onClick={handleExportAll}
              className="w-full flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <div className="text-left">
                <p className="font-medium">Экспорт всех данных</p>
                <p className="text-xs text-emerald-600">Клиенты, отгрузки, сделки в Excel</p>
              </div>
            </button>

            <div className="p-4 bg-blue-50 text-blue-700 rounded-xl">
              <p className="font-medium mb-1">🔗 Интеграции (в планах)</p>
              <ul className="text-sm space-y-1">
                <li>• 1С: Предприятие</li>
                <li>• СБИС</li>
                <li>• Контур</li>
                <li>• Заказы с сайта</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика за всё время */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-6">Ваша статистика за всё время</h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-slate-400 text-sm">Всего клиентов</p>
            <p className="text-3xl font-bold mt-1">{stats.totalClients}</p>
            <p className="text-sm text-emerald-400 mt-1">{stats.activeClients} активных</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Отгрузок выполнено</p>
            <p className="text-3xl font-bold mt-1">{stats.totalShipments}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Общая выручка</p>
            <p className="text-3xl font-bold mt-1">{(stats.totalRevenue / 1000000).toFixed(2)} М ₽</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Выигранных сделок</p>
            <p className="text-3xl font-bold mt-1">{stats.wonDeals}</p>
            <p className="text-sm text-emerald-400 mt-1">{(stats.wonAmount / 1000000).toFixed(2)} М ₽</p>
          </div>
        </div>
      </div>

      {/* Инструкция по запуску */}
      <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
        <h3 className="font-bold text-orange-800 mb-3">🖥️ Как запустить на компьютере или GitHub</h3>
        <div className="text-sm text-orange-700 space-y-2">
          <p><strong>Вариант 1 - GitHub Pages (рекомендуется):</strong></p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Скачай проект (кнопка Download)</li>
            <li>Создай репозиторий на GitHub</li>
            <li>Залей папку <code className="bg-orange-100 px-1 rounded">dist</code> в репозиторий</li>
            <li>Settings → Pages → Deploy from branch</li>
            <li>Получи ссылку на приложение!</li>
          </ol>
          <p className="mt-3"><strong>Вариант 2 - Локально:</strong></p>
          <p>Открой файл <code className="bg-orange-100 px-1 rounded">dist/index.html</code> в браузере</p>
        </div>
      </div>
    </div>
  );
}
