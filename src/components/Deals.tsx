import { useState } from 'react';
import { Client, Deal } from '../types';
import { cn } from '../utils/cn';

interface DealsProps {
  deals: Deal[];
  clients: Client[];
  onAddDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  onUpdateDeal: (id: string, deal: Partial<Deal>) => void;
  onDeleteDeal: (id: string) => void;
}

const stages: { id: Deal['stage']; label: string; color: string }[] = [
  { id: 'lead', label: 'Лид', color: 'bg-slate-500' },
  { id: 'negotiation', label: 'Переговоры', color: 'bg-blue-500' },
  { id: 'proposal', label: 'КП отправлено', color: 'bg-purple-500' },
  { id: 'contract', label: 'Договор', color: 'bg-orange-500' },
  { id: 'won', label: 'Выиграно', color: 'bg-emerald-500' },
  { id: 'lost', label: 'Проиграно', color: 'bg-red-500' }
];

export function Deals({ deals, clients, onAddDeal, onUpdateDeal, onDeleteDeal }: DealsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    amount: 0,
    stage: 'lead' as Deal['stage'],
    probability: 20,
    notes: ''
  });

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Неизвестный';
  };

  const getDealsForStage = (stage: Deal['stage']) => {
    return deals.filter(d => d.stage === stage);
  };

  const getStageTotal = (stage: Deal['stage']) => {
    return getDealsForStage(stage).reduce((sum, d) => sum + d.amount, 0);
  };

  const handleAddClick = () => {
    setEditingDeal(null);
    setFormData({
      clientId: clients[0]?.id || '',
      title: '',
      amount: 0,
      stage: 'lead',
      probability: 20,
      notes: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      clientId: deal.clientId,
      title: deal.title,
      amount: deal.amount,
      stage: deal.stage,
      probability: deal.probability,
      notes: deal.notes
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeal) {
      onUpdateDeal(editingDeal.id, formData);
    } else {
      onAddDeal(formData);
    }
    setShowModal(false);
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: Deal['stage']) => {
    if (draggedDeal) {
      const stageIndex = stages.findIndex(s => s.id === stage);
      const probability = stageIndex === 0 ? 20 : stageIndex === 1 ? 40 : stageIndex === 2 ? 60 : stageIndex === 3 ? 80 : stageIndex === 4 ? 100 : 0;
      onUpdateDeal(draggedDeal.id, { stage, probability });
      setDraggedDeal(null);
    }
  };

  const activeStages = stages.filter(s => !['won', 'lost'].includes(s.id));
  const closedStages = stages.filter(s => ['won', 'lost'].includes(s.id));

  const totalPipeline = deals
    .filter(d => !['won', 'lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.amount, 0);

  const weightedPipeline = deals
    .filter(d => !['won', 'lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.amount * (d.probability / 100), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Воронка продаж</h1>
          <p className="text-slate-500 mt-1">Отслеживайте сделки на каждом этапе</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новая сделка
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">В воронке</p>
          <p className="text-2xl font-bold text-slate-800">{(totalPipeline / 1000000).toFixed(2)} М ₽</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Взвешенная сумма</p>
          <p className="text-2xl font-bold text-emerald-600">{(weightedPipeline / 1000000).toFixed(2)} М ₽</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Активных сделок</p>
          <p className="text-2xl font-bold text-blue-600">{deals.filter(d => !['won', 'lost'].includes(d.stage)).length}</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Активные сделки</h2>
        <div className="grid grid-cols-4 gap-4">
          {activeStages.map(stage => (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
              className="bg-slate-50 rounded-xl p-4 min-h-[400px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                  <h3 className="font-semibold text-slate-800">{stage.label}</h3>
                </div>
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                  {getDealsForStage(stage.id).length}
                </span>
              </div>
              
              <p className="text-sm text-slate-500 mb-4">
                {(getStageTotal(stage.id) / 1000).toFixed(0)}K ₽
              </p>

              <div className="space-y-3">
                {getDealsForStage(stage.id).map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    className="bg-white rounded-xl p-4 shadow-sm cursor-move hover:shadow-md transition-shadow border border-slate-100"
                  >
                    <h4 className="font-medium text-slate-800 mb-1">{deal.title}</h4>
                    <p className="text-sm text-slate-500 mb-2">{getClientName(deal.clientId)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-800">
                        {deal.amount.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {deal.probability}%
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditClick(deal)}
                        className="flex-1 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => onDeleteDeal(deal.id)}
                        className="flex-1 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closed Deals */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {closedStages.map(stage => (
          <div
            key={stage.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
            className={cn(
              'rounded-2xl p-6 shadow-sm border',
              stage.id === 'won' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={cn('w-3 h-3 rounded-full', stage.color)} />
              <h3 className="font-semibold text-slate-800">{stage.label}</h3>
              <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full ml-auto">
                {getDealsForStage(stage.id).length}
              </span>
            </div>
            
            <p className="text-lg font-bold text-slate-800 mb-4">
              {(getStageTotal(stage.id) / 1000000).toFixed(2)} М ₽
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {getDealsForStage(stage.id).map(deal => (
                <div key={deal.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800">{deal.title}</p>
                    <p className="text-sm text-slate-500">{getClientName(deal.clientId)}</p>
                  </div>
                  <p className="font-bold text-slate-800">{deal.amount.toLocaleString('ru-RU')} ₽</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingDeal ? 'Редактировать сделку' : 'Новая сделка'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="Годовой контракт"
                  required
                />
              </div>

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
                <label className="block text-sm font-medium text-slate-700 mb-1">Сумма (₽)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Этап</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as Deal['stage'] })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Вероятность %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Заметки</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                  rows={2}
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
                  {editingDeal ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
