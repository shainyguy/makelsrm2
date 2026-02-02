import { Client, Shipment, Task, Deal, Interaction, Product, Goal, ManagerProfile, Reminder } from '../types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const initialClients: Client[] = [
  {
    id: '1',
    name: 'ООО "СтройМаркет"',
    contactPerson: 'Иванов Петр Сергеевич',
    phone: '+7 (495) 123-45-67',
    email: 'ivanov@stroymarket.ru',
    address: 'г. Москва, ул. Строителей, 15',
    notes: 'Крупный клиент, заказывает регулярно',
    createdAt: '2024-01-15',
    status: 'active',
    birthday: '1985-03-15',
    contractEndDate: '2025-12-31',
    inn: '7701234567',
    coordinates: { lat: 55.7558, lng: 37.6173 }
  },
  {
    id: '2',
    name: 'ТД "Электрика Плюс"',
    contactPerson: 'Сидорова Анна Михайловна',
    phone: '+7 (812) 987-65-43',
    email: 'sidorova@elektrika.ru',
    address: 'г. Санкт-Петербург, пр. Ленина, 42',
    notes: 'Предпочитает безналичный расчет',
    createdAt: '2024-02-20',
    status: 'active',
    birthday: '1990-07-22',
    contractEndDate: '2025-06-30',
    inn: '7802345678',
    coordinates: { lat: 59.9343, lng: 30.3351 }
  },
  {
    id: '3',
    name: 'ИП Козлов А.В.',
    contactPerson: 'Козлов Алексей Владимирович',
    phone: '+7 (343) 555-12-34',
    email: 'kozlov@mail.ru',
    address: 'г. Екатеринбург, ул. Мира, 8',
    notes: 'Новый клиент, первый заказ',
    createdAt: '2024-11-01',
    status: 'potential',
    inn: '6601234567',
    coordinates: { lat: 56.8389, lng: 60.6057 }
  }
];

export const initialShipments: Shipment[] = [
  {
    id: '1',
    clientId: '1',
    date: formatDate(today),
    products: 'Розетки MAKEL (500 шт), Выключатели (300 шт)',
    amount: 450000,
    status: 'planned',
    notes: 'Доставка до 14:00'
  },
  {
    id: '2',
    clientId: '2',
    date: formatDate(new Date(today.getTime() + 86400000)),
    products: 'Автоматы защиты (200 шт), Распред. коробки (150 шт)',
    amount: 320000,
    status: 'planned',
    notes: ''
  },
  {
    id: '3',
    clientId: '1',
    date: formatDate(new Date(today.getTime() + 86400000 * 3)),
    products: 'Кабель-каналы (1000 м)',
    amount: 180000,
    status: 'planned',
    notes: 'Согласовать время с клиентом'
  },
  {
    id: '4',
    clientId: '1',
    date: formatDate(new Date(today.getTime() - 86400000 * 30)),
    products: 'Розетки MAKEL (200 шт)',
    amount: 180000,
    status: 'delivered',
    notes: ''
  },
  {
    id: '5',
    clientId: '2',
    date: formatDate(new Date(today.getTime() - 86400000 * 15)),
    products: 'Автоматы 16А (100 шт)',
    amount: 95000,
    status: 'delivered',
    notes: ''
  }
];

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Позвонить в СтройМаркет',
    description: 'Уточнить детали следующего заказа',
    clientId: '1',
    dueDate: formatDate(today),
    priority: 'high',
    completed: false,
    createdAt: formatDate(today)
  },
  {
    id: '2',
    title: 'Подготовить коммерческое предложение',
    description: 'КП для нового клиента ИП Козлов',
    clientId: '3',
    dueDate: formatDate(new Date(today.getTime() + 86400000)),
    priority: 'medium',
    completed: false,
    createdAt: formatDate(today)
  },
  {
    id: '3',
    title: 'Проверить остатки на складе',
    description: 'Автоматы 16А и 25А',
    dueDate: formatDate(today),
    priority: 'low',
    completed: false,
    createdAt: formatDate(today)
  }
];

export const initialDeals: Deal[] = [
  {
    id: '1',
    clientId: '1',
    title: 'Годовой контракт на поставку',
    amount: 5000000,
    stage: 'contract',
    probability: 90,
    createdAt: '2024-10-01',
    notes: 'Финальное согласование условий'
  },
  {
    id: '2',
    clientId: '2',
    title: 'Расширение ассортимента',
    amount: 1200000,
    stage: 'proposal',
    probability: 60,
    createdAt: '2024-11-10',
    notes: 'Ждем ответ по КП'
  },
  {
    id: '3',
    clientId: '3',
    title: 'Первый заказ',
    amount: 250000,
    stage: 'negotiation',
    probability: 40,
    createdAt: '2024-11-20',
    notes: 'Обсуждаем условия'
  }
];

export const initialInteractions: Interaction[] = [
  {
    id: '1',
    clientId: '1',
    type: 'call',
    date: formatDate(new Date(today.getTime() - 86400000 * 2)),
    notes: 'Обсудили условия нового контракта',
    result: 'Клиент заинтересован',
    duration: 15
  },
  {
    id: '2',
    clientId: '1',
    type: 'meeting',
    date: formatDate(new Date(today.getTime() - 86400000 * 7)),
    notes: 'Встреча в офисе клиента',
    result: 'Подписали предварительное соглашение',
    duration: 60
  },
  {
    id: '3',
    clientId: '2',
    type: 'email',
    date: formatDate(new Date(today.getTime() - 86400000)),
    notes: 'Отправил обновленный прайс-лист',
    result: 'Ожидаем ответ'
  },
  {
    id: '4',
    clientId: '3',
    type: 'call',
    date: formatDate(new Date(today.getTime() - 86400000 * 3)),
    notes: 'Первый контакт, представил компанию',
    result: 'Запросили КП',
    duration: 10
  }
];

export const initialProducts: Product[] = [
  { id: '1', sku: 'MKL-R-001', name: 'Розетка MAKEL одинарная', category: 'Розетки', price: 450, stock: 1500, minStock: 200, unit: 'шт' },
  { id: '2', sku: 'MKL-R-002', name: 'Розетка MAKEL двойная', category: 'Розетки', price: 680, stock: 800, minStock: 100, unit: 'шт' },
  { id: '3', sku: 'MKL-R-003', name: 'Розетка MAKEL с заземлением', category: 'Розетки', price: 520, stock: 1200, minStock: 150, unit: 'шт' },
  { id: '4', sku: 'MKL-V-001', name: 'Выключатель MAKEL одноклавишный', category: 'Выключатели', price: 380, stock: 2000, minStock: 300, unit: 'шт' },
  { id: '5', sku: 'MKL-V-002', name: 'Выключатель MAKEL двухклавишный', category: 'Выключатели', price: 520, stock: 1500, minStock: 200, unit: 'шт' },
  { id: '6', sku: 'MKL-A-016', name: 'Автомат защиты 16А', category: 'Автоматы', price: 890, stock: 500, minStock: 100, unit: 'шт' },
  { id: '7', sku: 'MKL-A-025', name: 'Автомат защиты 25А', category: 'Автоматы', price: 950, stock: 350, minStock: 80, unit: 'шт' },
  { id: '8', sku: 'MKL-A-032', name: 'Автомат защиты 32А', category: 'Автоматы', price: 1100, stock: 280, minStock: 60, unit: 'шт' },
  { id: '9', sku: 'MKL-K-001', name: 'Кабель-канал 16х16', category: 'Кабель-каналы', price: 45, stock: 5000, minStock: 500, unit: 'м' },
  { id: '10', sku: 'MKL-K-002', name: 'Кабель-канал 25х25', category: 'Кабель-каналы', price: 65, stock: 3500, minStock: 400, unit: 'м' },
  { id: '11', sku: 'MKL-RK-001', name: 'Распределительная коробка 100х100', category: 'Коробки', price: 180, stock: 800, minStock: 100, unit: 'шт' },
  { id: '12', sku: 'MKL-RK-002', name: 'Распределительная коробка 150х150', category: 'Коробки', price: 250, stock: 600, minStock: 80, unit: 'шт' },
];

export const initialGoals: Goal[] = [
  {
    id: '1',
    title: 'План продаж на месяц',
    type: 'revenue',
    target: 3000000,
    current: 950000,
    period: 'month',
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))
  },
  {
    id: '2',
    title: 'Количество отгрузок',
    type: 'shipments',
    target: 30,
    current: 12,
    period: 'month',
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))
  },
  {
    id: '3',
    title: 'Новые клиенты',
    type: 'clients',
    target: 5,
    current: 2,
    period: 'month',
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))
  },
  {
    id: '4',
    title: 'Звонки клиентам',
    type: 'calls',
    target: 100,
    current: 45,
    period: 'month',
    startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))
  }
];

export const initialProfile: ManagerProfile = {
  name: 'Александр Петров',
  position: 'Менеджер по работе с клиентами',
  email: 'a.petrov@makel.ru',
  phone: '+7 (495) 999-88-77',
  startDate: '2023-03-01'
};

export const initialReminders: Reminder[] = [];
