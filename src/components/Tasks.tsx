import { useState } from 'react';
import { Client, Task } from '../types';
import { cn } from '../utils/cn';

interface TasksProps {
  tasks: Task[];
  clients: Client[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export function Tasks({ tasks, clients, onAddTask, onUpdateTask, onDeleteTask }: TasksProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as Task['priority'],
    completed: false
  });

  const today = new Date().toISOString().split('T')[0];

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    switch (filter) {
      case 'today':
        filtered = filtered.filter(t => t.dueDate === today && !t.completed);
        break;
      case 'upcoming':
        filtered = filtered.filter(t => t.dueDate > today && !t.completed);
        break;
      case 'completed':
        filtered = filtered.filter(t => t.completed);
        break;
      default:
        filtered = filtered.filter(t => !t.completed);
    }
    
    return filtered.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    return clients.find(c => c.id === clientId)?.name;
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      clientId: '',
      dueDate: today,
      priority: 'medium',
      completed: false
    });
    setShowModal(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      clientId: task.clientId || '',
      dueDate: task.dueDate,
      priority: task.priority,
      completed: task.completed
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      clientId: formData.clientId || undefined
    };
    if (editingTask) {
      onUpdateTask(editingTask.id, submitData);
    } else {
      onAddTask(submitData);
    }
    setShowModal(false);
  };

  const handleToggleComplete = (task: Task) => {
    onUpdateTask(task.id, { completed: !task.completed });
  };

  const priorityColors = {
    high: 'text-red-500 bg-red-500/10 border-red-200',
    medium: 'text-orange-500 bg-orange-500/10 border-orange-200',
    low: 'text-blue-500 bg-blue-500/10 border-blue-200'
  };

  const priorityLabels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  };

  const filters = [
    { id: 'all', label: 'Активные', count: tasks.filter(t => !t.completed).length },
    { id: 'today', label: 'На сегодня', count: tasks.filter(t => t.dueDate === today && !t.completed).length },
    { id: 'upcoming', label: 'Предстоящие', count: tasks.filter(t => t.dueDate > today && !t.completed).length },
    { id: 'completed', label: 'Выполненные', count: tasks.filter(t => t.completed).length }
  ] as const;

  const isOverdue = (date: string) => date < today;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Задачи</h1>
          <p className="text-slate-500 mt-1">Организуйте свою работу и ничего не забывайте</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новая задача
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/20">
          <p className="text-orange-100 text-sm font-medium">На сегодня</p>
          <p className="text-4xl font-bold mt-2">{tasks.filter(t => t.dueDate === today && !t.completed).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-6 text-white shadow-xl shadow-red-500/20">
          <p className="text-red-100 text-sm font-medium">Просрочено</p>
          <p className="text-4xl font-bold mt-2">{tasks.filter(t => isOverdue(t.dueDate) && !t.completed).length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
          <p className="text-blue-100 text-sm font-medium">Предстоящие</p>
          <p className="text-4xl font-bold mt-2">{tasks.filter(t => t.dueDate > today && !t.completed).length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
          <p className="text-emerald-100 text-sm font-medium">Выполнено</p>
          <p className="text-4xl font-bold mt-2">{tasks.filter(t => t.completed).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === f.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {f.label}
              <span className={cn(
                'ml-2 px-1.5 py-0.5 rounded-full text-xs',
                filter === f.id ? 'bg-white/20' : 'bg-slate-200'
              )}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {getFilteredTasks().length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>Нет задач в этой категории</p>
            </div>
          ) : (
            getFilteredTasks().map(task => (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border-2 transition-all',
                  task.completed
                    ? 'bg-slate-50 border-slate-100'
                    : isOverdue(task.dueDate)
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                )}
              >
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors',
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300 hover:border-emerald-500'
                  )}
                >
                  {task.completed && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      'font-semibold',
                      task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                    )}>
                      {task.title}
                    </h3>
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full border',
                      priorityColors[task.priority]
                    )}>
                      {priorityLabels[task.priority]}
                    </span>
                    {isOverdue(task.dueDate) && !task.completed && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500 text-white">
                        Просрочено
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className={cn(
                      'text-sm mt-1',
                      task.completed ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2">
                    <span className={cn(
                      'text-xs flex items-center gap-1',
                      task.dueDate === today ? 'text-orange-600' : isOverdue(task.dueDate) && !task.completed ? 'text-red-600' : 'text-slate-500'
                    )}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                    {getClientName(task.clientId) && (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {getClientName(task.clientId)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingTask ? 'Редактировать задачу' : 'Новая задача'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="Позвонить клиенту"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="Дополнительные детали..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Клиент (необязательно)</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="">Без привязки к клиенту</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Срок</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Приоритет</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  >
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </div>
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
                  {editingTask ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
