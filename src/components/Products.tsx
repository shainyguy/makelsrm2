import { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Product } from '../types';
import { cn } from '../utils/cn';

interface ProductsProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onImportProducts: (products: Omit<Product, 'id'>[]) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export function Products({ products, onAddProduct, onDeleteProduct, onImportProducts }: ProductsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
    minStock: 0,
    unit: 'шт'
  });

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => !selectedCategory || p.category === selectedCategory)
      .filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [products, searchQuery, selectedCategory]);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Расчет скидки по объему
  const getDiscount = (total: number) => {
    if (total >= 1000000) return 15;
    if (total >= 500000) return 10;
    if (total >= 200000) return 5;
    return 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = getDiscount(cartTotal);
  const cartFinalTotal = cartTotal * (1 - discount / 100);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(formData);
    setShowModal(false);
    setFormData({ sku: '', name: '', category: '', price: 0, stock: 0, minStock: 0, unit: 'шт' });
  };

  // Импорт из Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

      const importedProducts: Omit<Product, 'id'>[] = json.map(row => ({
        sku: String(row['Артикул'] || row['sku'] || row['SKU'] || ''),
        name: String(row['Название'] || row['name'] || row['Name'] || ''),
        category: String(row['Категория'] || row['category'] || row['Category'] || 'Без категории'),
        price: Number(row['Цена'] || row['price'] || row['Price'] || 0),
        stock: Number(row['Остаток'] || row['stock'] || row['Stock'] || 0),
        minStock: Number(row['Мин. остаток'] || row['minStock'] || row['MinStock'] || 0),
        unit: String(row['Ед. изм.'] || row['unit'] || row['Unit'] || 'шт')
      })).filter(p => p.sku && p.name);

      if (importedProducts.length > 0) {
        onImportProducts(importedProducts);
        alert(`Импортировано ${importedProducts.length} товаров`);
      } else {
        alert('Не удалось импортировать товары. Проверьте формат файла.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Экспорт в Excel
  const handleExport = () => {
    const data = products.map(p => ({
      'Артикул': p.sku,
      'Название': p.name,
      'Категория': p.category,
      'Цена': p.price,
      'Остаток': p.stock,
      'Мин. остаток': p.minStock,
      'Ед. изм.': p.unit
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');
    XLSX.writeFile(workbook, 'makel_products.xlsx');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Каталог товаров</h1>
          <p className="text-slate-500 mt-1">База товаров MAKEL с ценами и остатками</p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Импорт Excel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Экспорт
          </button>
          <button
            onClick={() => setShowCart(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Калькулятор
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить
          </button>
        </div>
      </div>

      {/* Предупреждения о низком остатке */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold">Низкий остаток: {lowStockProducts.length} позиций</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.slice(0, 5).map(p => (
              <span key={p.id} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {p.name} ({p.stock} {p.unit})
              </span>
            ))}
            {lowStockProducts.length > 5 && (
              <span className="text-xs text-red-600">+{lowStockProducts.length - 5} ещё</span>
            )}
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или артикулу..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
        >
          <option value="">Все категории</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Таблица товаров */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Артикул</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Название</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Категория</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">Цена</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">Остаток</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-6 py-4">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-sm text-slate-600">{product.sku}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-slate-800">
                  {product.price.toLocaleString('ru-RU')} ₽
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={cn(
                    'font-medium',
                    product.stock <= product.minStock ? 'text-red-600' : 'text-slate-800'
                  )}>
                    {product.stock} {product.unit}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="В калькулятор"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Скидки */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
        <h3 className="font-bold text-orange-800 mb-3">Система скидок по объёму заказа</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">5%</span>
            <span className="text-sm text-orange-700">от 200 000 ₽</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center text-orange-800 font-bold text-sm">10%</span>
            <span className="text-sm text-orange-700">от 500 000 ₽</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">15%</span>
            <span className="text-sm text-orange-700">от 1 000 000 ₽</span>
          </div>
        </div>
      </div>

      {/* Модальное окно корзины */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Калькулятор заказа</h3>
              <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Добавьте товары в калькулятор</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.product.name}</p>
                        <p className="text-sm text-slate-500">{item.product.price.toLocaleString('ru-RU')} ₽ / {item.product.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.product.id, Number(e.target.value))}
                          className="w-16 text-center px-2 py-1 rounded-lg border"
                        />
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold text-slate-800 w-32 text-right">
                        {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Сумма:</span>
                    <span className="font-medium">{cartTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Скидка {discount}%:</span>
                      <span>-{((cartTotal * discount) / 100).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold">
                    <span>Итого:</span>
                    <span className="text-orange-600">{cartFinalTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>

                <button
                  onClick={() => setCart([])}
                  className="w-full mt-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                >
                  Очистить
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно добавления */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Добавить товар</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Артикул</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ед. изм.</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Категория</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  list="categories"
                  required
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Цена</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Остаток</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Мин.</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">
                  Отмена
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600">
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
