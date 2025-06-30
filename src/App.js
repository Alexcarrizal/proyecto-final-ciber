import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Monitor, Gamepad2, Wifi, Plus, X, Trash2, Save, Ban, DollarSign, Users, Gift, AlertTriangle, Star, ShoppingCart, Settings, Printer, ListOrdered, Barcode, ArrowDown, ArrowUp, CreditCard, Banknote, Landmark, Edit, Download, Upload, Percent, TrendingUp, TrendingDown, Inbox, Lock, Unlock, FileText, CalendarDays, Award, Smartphone, Phone, Lightbulb, Droplets, WifiIcon, ShieldCheck, LogOut, UserPlus, Film, HelpCircle, ChevronsRight, Eye, EyeOff, Send, BarChart3, PiggyBank, Briefcase, FileSpreadsheet, Building, RefreshCw, MoreVertical } from 'lucide-react';

// --- HOOK PERSONALIZADO PARA PERSISTENCIA ---
const useStickyState = (defaultValue, key) => {
    const [value, setValue] = useState(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch { return defaultValue; }
    });
    useEffect(() => {
        try { window.localStorage.setItem(key, JSON.stringify(value)); }
        catch (e) { console.error(`Error guardando en localStorage key=”${key}”:`, e); }
    }, [key, value]);
    return [value, setValue];
};

// --- DATOS INICIALES (FALLBACK) ---
const initialModules = [{ id: 1, name: 'PC-01', type: 'Internet', status: 'disponible', startTime: null, elapsedTime: 0, clientId: null, products: [], fixedTime: 0, isFree: false }];
const initialRates = [
    { name: 'Tarifa General PC', appliesTo: 'Internet', brackets: [{ from: 1, to: 10, price: 5.00 }, { from: 11, to: 20, price: 10.00 }, { from: 21, to: 30, price: 15.00 }, { from: 31, to: 60, price: 25.00 }] },
    { name: 'Tarifa General Consola', appliesTo: 'Consola', brackets: [{ from: 1, to: 30, price: 30.50 }, { from: 31, to: 60, price: 50.00 }] },
    { name: 'Consola 2 Controles', appliesTo: 'Consola2C', brackets: [{ from: 1, to: 30, price: 40.00 }, { from: 31, to: 60, price: 65.00 }] },
    { name: 'Tarifa Wifi', appliesTo: 'Wifi', brackets: [{ from: 1, to: 10, price: 5.00 }, { from: 11, to: 20, price: 10.00 }, { from: 21, to: 30, price: 15.00 }, { from: 31, to: 60, price: 25.00 }] }
];
const initialClients = [{ id: 1, name: 'Cliente de Muestra', phone: '5512345678', points: 12 }];
const initialProducts = [
    { id: 1, barcode: '75010001', name: 'Refresco de Cola 600ml', costPrice: 8.50, salePrice: 15.00, category: 'Bebidas', warranty: 'N/A', discount: 0 },
    { id: 2, barcode: '75010002', name: 'Papas Fritas Sabor Queso', costPrice: 12.00, salePrice: 18.00, category: 'Botanas', warranty: 'N/A', discount: 10 },
];
const initialProductCategories = ['Bebidas', 'Botanas', 'Dulces', 'Servicios', 'Accesorios'];
const initialSales = [];
const initialCashMovements = [];
const initialRegisterStatus = { isOpen: false, initialCash: 0, date: null };
const initialUsers = [];
const initialAllocations = [
    { id: 1, name: 'Sueldo', percentage: 50, balance: 0, destinationCardId: null },
    { id: 2, name: 'Renta', percentage: 20, balance: 0, destinationCardId: null },
    { id: 3, name: 'Inversión', percentage: 15, balance: 0, destinationCardId: null },
];
const initialDebitCards = [];
const initialCreditCards = [];
const initialStreamingPlatforms = [{ id: 1, name: 'Netflix', price: 150 }, { id: 2, name: 'Spotify', price: 99 }];
const initialCarriers = {
    'Telcel': [10, 15, 20, 30, 50, 80, 100, 150, 200, 500], 'Movistar': [10, 15, 20, 30, 50, 100, 120, 150], 'AT&T': [10, 15, 20, 30, 50, 100, 150, 200], 'Unefon': [10, 15, 20, 30, 50, 100, 150, 200], 'Virgin Mobile': [10, 15, 20, 30, 50, 100, 150], 'Bait': [10, 20, 30, 50, 100, 125, 200], 'Diri': [10, 20, 30, 50, 100, 147, 200], 'CFE TEIT': [30, 50, 100, 150, 200], 'Pillofon': [20, 30, 50, 100, 159, 200]
};
const initialTramites = [
    {id: 1, name: 'Impresión B/N', costPrice: 0.5, salePrice: 2.00},
    {id: 2, name: 'Impresión Color', costPrice: 2.0, salePrice: 5.00},
    {id: 3, name: 'Escaneo de Documentos', costPrice: 0, salePrice: 3.00}
];
const initialDistributors = ['Kaetus', 'Go play', 'MFC', 'Tele Latino'];
const initialStreamingSales = [];
const initialDistributionHistory = [];


// --- ICONOS ---
const iconMap = { Internet: <Monitor className="w-8 h-8 mx-auto" />, Consola: <Gamepad2 className="w-8 h-8 mx-auto" />, Consola2C: <div className="flex justify-center items-center gap-1"><Gamepad2 className="w-7 h-7" /><Users className="w-5 h-5" /></div>, Wifi: <Wifi className="w-8 h-8 mx-auto" /> };

// --- FUNCIONES DE LÓGICA Y UTILIDADES ---
const calculateTimeCost = (elapsedMinutes, moduleType, rates, isFree) => { if (isFree) return 0; const r = rates.find(r => r.appliesTo === moduleType); if (!r || elapsedMinutes <= 0) return 0; const sb = [...r.brackets].sort((a, b) => a.to - b.to); let c = 0; for (const b of sb) { if (elapsedMinutes <= b.to) { c = b.price; break; } } if (c === 0 && elapsedMinutes > 0) { const mb = sb[sb.length - 1]; if (mb) { const h = Math.floor(elapsedMinutes / 60); const rm = elapsedMinutes % 60; let rc = 0; for (const b of sb) { if (rm <= b.to) { rc = b.price; break; } } return (h * mb.price) + rc; } } return c; };
const formatTime = (seconds) => { const h = Math.floor(seconds / 3600).toString().padStart(2, '0'); const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0'); const s = Math.floor(seconds % 60).toString().padStart(2, '0'); return `${h}:${m}:${s}`; };
const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;
const calculateDailyTotals = (sales, cashMovements, date) => {
    if (!date) return { cashSalesTotal: 0, cardSalesTotal: 0, mercadoPagoSalesTotal: 0, transferSalesTotal: 0, miscIncome: 0, miscExpenses: 0, productProfit: 0, totalTimeSales: 0, grossProfit: 0, todayMovements: [], todaySales: [], streamingSalesTotal: 0, recargasSalesTotal: 0, servicesSalesTotal: 0, tramitesSalesTotal: 0 };
    const todaySales = sales.filter(sale => new Date(sale.date).toISOString().substring(0, 10) === date);
    const todayMovements = cashMovements.filter(mov => new Date(mov.date).toISOString().substring(0, 10) === date);
    
    const cashSalesTotal = todaySales.filter(s => s.paymentMethod === 'Efectivo').reduce((sum, sale) => sum + sale.total, 0);
    const cardSalesTotal = todaySales.filter(s => s.paymentMethod === 'Tarjeta').reduce((sum, sale) => sum + sale.total, 0);
    const mercadoPagoSalesTotal = todaySales.filter(s => s.paymentMethod === 'Mercado Pago').reduce((sum, sale) => sum + sale.total, 0);
    const transferSalesTotal = todaySales.filter(s => s.paymentMethod === 'Transferencia').reduce((sum, sale) => sum + sale.total, 0);
    
    const miscIncome = todayMovements.filter(m => m.type === 'Ingreso' && !m.category).reduce((sum, m) => sum + m.amount, 0);
    const miscExpenses = todayMovements.filter(m => m.type === 'Egreso').reduce((sum, m) => sum + m.amount, 0);

    const streamingSalesTotal = todayMovements.filter(m => m.type === 'Ingreso' && m.category === 'Streaming').reduce((sum, m) => sum + m.amount, 0);
    const recargasSalesTotal = todayMovements.filter(m => m.type === 'Ingreso' && m.category === 'Recargas').reduce((sum, m) => sum + m.amount, 0);
    const servicesSalesTotal = todayMovements.filter(m => m.type === 'Ingreso' && m.category === 'Servicios').reduce((sum, m) => sum + m.amount, 0);
    const tramitesSalesTotal = todayMovements.filter(m => m.type === 'Ingreso' && m.category === 'Trámites').reduce((sum, m) => sum + m.amount, 0);
    
    const totalSalesProfit = todaySales.reduce((sum, sale) => {
        const saleProfit = sale.items.reduce((itemSum, item) => itemSum + ((item.salePrice - (item.costPrice || 0)) * (item.qty || 1)), 0);
        return sum + saleProfit;
    }, 0);
    
    // La ganancia bruta no incluye recargas ni ventas de streaming, ya que son solo un pase de dinero.
    const grossProfit = totalSalesProfit + miscIncome + servicesSalesTotal + tramitesSalesTotal - miscExpenses;
    
    return { cashSalesTotal, cardSalesTotal, mercadoPagoSalesTotal, transferSalesTotal, miscIncome, miscExpenses, totalSalesProfit, grossProfit, todayMovements, todaySales, streamingSalesTotal, recargasSalesTotal, servicesSalesTotal, tramitesSalesTotal };
};

// --- COMPONENTES MODALES Y DE UI ---
const OpenRegisterModal = ({ onOpen, onCancel, isMandatory = false }) => {
    const [amount, setAmount] = useState('');
    const handleFormSubmit = (e) => { e.preventDefault(); const parsedAmount = parseFloat(amount); if (isNaN(parsedAmount) || parsedAmount < 0) { alert("Por favor, ingrese un monto válido."); return; } onOpen(parsedAmount); };
    return (<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"><form onSubmit={handleFormSubmit} className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md text-center"><Unlock className="w-16 h-16 text-cyan-400 mx-auto mb-4" /><h3 className="text-2xl font-bold text-white mb-4">Aperturar Caja</h3><p className="text-gray-300 mb-6">{isMandatory ? "Debes aperturar la caja para iniciar tu sesión de trabajo." : "Ingrese el monto inicial en efectivo (fondo) para comenzar el día."}</p><div className="relative mb-6"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-gray-700 text-white text-center text-3xl p-3 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" autoFocus /></div><div className="flex justify-center gap-4">{!isMandatory && (<button type="button" onClick={onCancel} className="py-2 px-6 bg-gray-600 hover:bg-gray-500 rounded-lg transition">Cancelar</button>)}<button type="submit" className="py-2 px-6 bg-green-600 hover:bg-green-500 rounded-lg transition">Aperturar</button></div></form></div>);
};
const ConfirmCloseRegisterModal = ({ expectedCash, onConfirm, onCancel }) => {
    const denominations = { bills: [1000, 500, 200, 100, 50, 20], coins: [10, 5, 2, 1, 0.5] };
    const [counts, setCounts] = useState({});
    const handleCountChange = (value, denom) => { setCounts(prev => ({...prev, [denom]: parseInt(value) || 0 })); };
    const totalCounted = Object.entries(counts).reduce((total, [denom, count]) => total + (parseFloat(denom) * count), 0);
    const difference = totalCounted - expectedCash;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-3xl text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-6">Cerrar y Arquear Caja</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div className="bg-gray-900 p-4 rounded-lg"><p className="text-gray-400">Total en Sistema</p><p className="text-3xl font-bold text-cyan-300">{formatCurrency(expectedCash)}</p></div>
                        <div className="bg-gray-900 p-4 rounded-lg"><p className="text-gray-400">Total Contado</p><p className="text-3xl font-bold text-green-300">{formatCurrency(totalCounted)}</p></div>
                        <div className={`p-4 rounded-lg ${difference === 0 ? 'bg-gray-700' : difference > 0 ? 'bg-green-800/50' : 'bg-red-800/50'}`}><p className="text-gray-400">Diferencia</p><p className={`text-3xl font-bold ${difference === 0 ? 'text-white' : difference > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(difference)}</p></div>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-cyan-300 mb-2">Calculadora de Efectivo</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-60 overflow-y-auto pr-2">
                        {denominations.bills.map(d => (<div key={d} className="flex items-center gap-2"><span className="w-16 text-right font-bold">{formatCurrency(d)}</span><span className="text-gray-400">x</span><input type="number" onChange={e => handleCountChange(e.target.value, d)} className="w-full bg-gray-700 p-1 rounded-md text-center" /></div>))}
                        {denominations.coins.map(d => (<div key={d} className="flex items-center gap-2"><span className="w-16 text-right font-bold">{formatCurrency(d)}</span><span className="text-gray-400">x</span><input type="number" onChange={e => handleCountChange(e.target.value, d)} className="w-full bg-gray-700 p-1 rounded-md text-center" /></div>))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-8">
                    <button onClick={onCancel} className="py-2 px-6 bg-gray-600 hover:bg-gray-500 rounded-lg transition">Cancelar</button>
                    <button onClick={() => onConfirm(totalCounted)} className="py-2 px-6 bg-red-600 hover:bg-red-500 rounded-lg transition flex items-center gap-2"><Lock /> Confirmar y Cerrar</button>
                </div>
            </div>
        </div>
    );
};
const AddModuleModal = ({ onSave, onCancel }) => { const [name, setName] = useState(''); const [type, setType] = useState('Internet'); const handleSave = () => { if (name.trim()) onSave(name, type); else alert('Por favor, ingrese un nombre para el módulo.'); }; return (<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"><div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md animate-fade-in-scale"><div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold text-cyan-300">Agregar Nuevo Módulo</h3><button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-700 transition"><X className="w-6 h-6 text-gray-400" /></button></div><div className="space-y-4"><div><label htmlFor="module-name" className="block text-sm font-medium text-gray-300 mb-1">Nombre del Módulo</label><input id="module-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: PC-05, PS5-02" className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div><div><label htmlFor="module-type" className="block text-sm font-medium text-gray-300 mb-1">Tipo de Módulo</label><select id="module-type" value={type} onChange={e => setType(e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"><option value="Internet">PC / Internet</option><option value="Consola">Consola (1 Control)</option><option value="Consola2C">Consola (2 Controles)</option><option value="Wifi">Wi-Fi</option></select></div></div><div className="mt-6 flex justify-end gap-4"><button onClick={onCancel} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition">Cancelar</button><button onClick={handleSave} className="py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg transition flex items-center gap-2"><Plus className="w-5 h-5" /> Agregar</button></div></div></div>); }
const ConfirmDeleteModal = ({ title, message, onConfirm, onCancel, confirmText = 'Eliminar', confirmIcon = <Trash2 className="w-5 h-5" />, confirmColor = 'red' }) => {
    const colorClasses = { red: 'bg-red-600 hover:bg-red-500', blue: 'bg-blue-600 hover:bg-blue-500', green: 'bg-green-600 hover:bg-green-500' };
    return (<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"><div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md animate-fade-in-scale text-center"><AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" /><h3 className="text-2xl font-bold text-white mb-2">{title}</h3><p className="text-gray-300 mb-6">{message}</p><div className="flex justify-center gap-4"><button onClick={onCancel} className="py-2 px-6 bg-gray-600 hover:bg-gray-500 rounded-lg transition">Cancelar</button><button onClick={onConfirm} className={`py-2 px-6 ${colorClasses[confirmColor]} rounded-lg transition flex items-center gap-2`}>{confirmIcon} {confirmText}</button></div></div></div>);
};
const AddProductModal = ({ onSave, onCancel, productToEdit, categories }) => { 
    const [product, setProduct] = useState(productToEdit || {id: null, barcode: '', name: '', costPrice: 0, salePrice: 0, category: '', warranty: 'N/A', discount: 0}); 
    const profit = product.salePrice - product.costPrice; 
    const margin = product.salePrice > 0 ? (profit / product.salePrice) * 100 : 0; 
    const handleChange = (e) => { 
        const { name, value, type } = e.target; 
        let processedValue = value;
        if (name === 'name' && value) {
            processedValue = value.charAt(0).toUpperCase() + value.slice(1);
        }
        setProduct(p => ({...p, [name]: type === 'number' ? parseFloat(processedValue) || 0 : processedValue})); 
    }; 
    const handleSubmit = (e) => { e.preventDefault(); onSave(product); }; 
    return (<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-2xl animate-fade-in-scale"><h3 className="text-2xl font-bold text-cyan-300 mb-6">{productToEdit ? 'Editar' : 'Nuevo'} Producto</h3><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-400 mb-1">Código de Barras</label><input type="text" name="barcode" value={product.barcode} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md"/></div><div><label className="block text-sm text-gray-400 mb-1">Categoría</label><input type="text" name="category" value={product.category} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" list="product-categories" autoComplete="off"/><datalist id="product-categories">{categories.map(cat => <option key={cat} value={cat} />)}</datalist></div></div><div><label className="block text-sm text-gray-400 mb-1">Descripción del Producto</label><input type="text" name="name" value={product.name} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" required/></div><div className="grid grid-cols-2 md:grid-cols-5 gap-4"><div><label className="block text-sm text-gray-400 mb-1">P. Costo</label><input type="number" step="0.01" name="costPrice" value={product.costPrice} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md"/></div><div><label className="block text-sm text-gray-400 mb-1">P. Venta</label><input type="number" step="0.01" name="salePrice" value={product.salePrice} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md"/></div><div><label className="block text-sm text-gray-400 mb-1">Descuento (%)</label><input type="number" step="1" name="discount" value={product.discount} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md"/></div><div><label className="block text-sm text-gray-400 mb-1">Ganancia</label><input type="text" value={formatCurrency(profit)} className="w-full bg-gray-900 p-2 rounded-md text-green-400" readOnly/></div><div><label className="block text-sm text-gray-400 mb-1">Margen</label><input type="text" value={`${margin.toFixed(2)}%`} className="w-full bg-gray-900 p-2 rounded-md text-cyan-400" readOnly/></div></div><div><label className="block text-sm text-gray-400 mb-1">Garantía</label><input type="text" name="warranty" value={product.warranty} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md"/></div><div className="mt-6 flex justify-end gap-4"><button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg">Cancelar</button><button type="submit" className="py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg">Guardar</button></div></form></div></div>); };
const FinalizeSaleModal = ({ total, clients, onConfirm, onCancel }) => {
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [chargeCommission, setChargeCommission] = useState(true);
    const [installments, setInstallments] = useState(0);

    const baseCommissionRate = 0.036 * 1.16; // 3.6% + IVA
    const installmentRates = { 3: 0.0489, 6: 0.0779, 9: 0.1039, 12: 0.1289 }; // Tasas de financiamiento + IVA

    let commission = 0;
    let financingCost = 0;
    
    if (paymentMethod === 'Mercado Pago' || paymentMethod === 'Tarjeta') {
        if (installments > 0 && paymentMethod === 'Mercado Pago') {
            financingCost = total * (installmentRates[installments] || 0);
        } else {
            commission = total * baseCommissionRate;
        }
    }

    const totalToPay = total + financingCost + (chargeCommission && installments === 0 ? commission : 0);
    
    const handleConfirm = () => {
        const saleDetails = {
            paymentMethod,
            clientId: selectedClientId,
            total: totalToPay,
            commission: chargeCommission && installments === 0 ? commission : 0,
            financingCost: financingCost,
            installments: installments > 0 ? installments : null,
        };
        onConfirm(saleDetails);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in-scale">
                <h3 className="text-2xl font-bold text-cyan-300 mb-6">Confirmar Venta</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Cliente</label>
                        <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600">
                            <option value="">Venta al Público</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Método de Pago</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button onClick={() => { setPaymentMethod('Efectivo'); setInstallments(0); }} className={`p-2 rounded-md flex items-center justify-center gap-2 ${paymentMethod === 'Efectivo' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'}`}><Banknote/>Efectivo</button>
                            <button onClick={() => { setPaymentMethod('Tarjeta'); setInstallments(0); }} className={`p-2 rounded-md flex items-center justify-center gap-2 ${paymentMethod === 'Tarjeta' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'}`}><CreditCard/>Tarjeta</button>
                            <button onClick={() => setPaymentMethod('Mercado Pago')} className={`p-2 rounded-md flex items-center justify-center gap-2 ${paymentMethod === 'Mercado Pago' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'}`}><Smartphone/>M. Pago</button>
                            <button onClick={() => { setPaymentMethod('Transferencia'); setInstallments(0); }} className={`p-2 rounded-md flex items-center justify-center gap-2 ${paymentMethod === 'Transferencia' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'}`}><Landmark/>Transf.</button>
                        </div>
                    </div>

                    {(paymentMethod === 'Tarjeta' || paymentMethod === 'Mercado Pago') && (
                        <div className="p-4 bg-gray-700/50 rounded-lg space-y-2 mt-4">
                            {paymentMethod === 'Mercado Pago' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-300">Meses sin Intereses</label>
                                    <select value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} className="w-full bg-gray-600 p-2 mt-1 rounded-md">
                                        <option value="0">Pago en una sola exhibición</option>
                                        <option value="3">3 Meses</option>
                                        <option value="6">6 Meses</option>
                                        <option value="9">9 Meses</option>
                                        <option value="12">12 Meses</option>
                                    </select>
                                </div>
                            )}

                            {installments > 0 ? (
                                <>
                                    <div className="flex justify-between text-gray-300"><span>Costo por Financiamiento:</span><span className="text-yellow-400">{formatCurrency(financingCost)}</span></div>
                                    <p className="text-xs text-center text-gray-400">El cliente pagará {formatCurrency((total + financingCost) / installments)} por {installments} meses.</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-gray-300"><span>Comisión ({ (baseCommissionRate * 100).toFixed(2) }%):</span><span className="text-yellow-400">{formatCurrency(commission)}</span></div>
                                    <div className="flex items-center justify-end gap-2 text-sm"><label htmlFor="charge-commission">Cobrar comisión al cliente</label><input type="checkbox" id="charge-commission" checked={chargeCommission} onChange={() => setChargeCommission(!chargeCommission)} className="form-checkbox h-5 w-5 text-cyan-500 bg-gray-800 rounded focus:ring-cyan-500" /></div>
                                </>
                            )}
                        </div>
                    )}
                     
                    <div className="text-center mt-6 border-t-2 border-dashed border-gray-600 pt-4"><p className="text-lg text-gray-400">Total a Pagar</p><p className="text-5xl font-bold text-green-400">{formatCurrency(totalToPay)}</p></div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="py-2 px-6 bg-gray-600 hover:bg-gray-500 rounded-lg">Cancelar</button>
                    <button type="button" onClick={handleConfirm} className="py-2 px-6 bg-cyan-600 hover:bg-cyan-500 rounded-lg">Confirmar y Cobrar</button>
                </div>
            </div>
        </div>
    );
};
const ManageAllocationsModal = ({ initialAllocations, onSave, onCancel, debitCards, creditCards }) => {
    const [tempAllocations, setTempAllocations] = useState(initialAllocations);
    const handleFieldChange = (id, field, value) => {
        setTempAllocations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    };
    const handleAdd = () => { setTempAllocations(prev => [...prev, { id: Date.now(), name: 'Nuevo Apartado', percentage: 0, balance: 0, destinationCardId: null }]); };
    const handleRemove = (id) => { setTempAllocations(prev => prev.filter(a => a.id !== id)); };
    const handleSave = () => { const totalPercentage = tempAllocations.reduce((sum, a) => sum + parseFloat(a.percentage || 0), 0); if (totalPercentage > 100) { alert(`El porcentaje total (${totalPercentage}%) no puede superar el 100%.`); return; } onSave(tempAllocations); };
    return (<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl"><h3 className="text-2xl font-bold text-cyan-300 mb-4">Administrar Apartados de Ganancia</h3><div className="space-y-2 max-h-96 overflow-y-auto pr-2">{tempAllocations.map(alloc => (<div key={alloc.id} className="grid grid-cols-12 items-center gap-2 bg-gray-700 p-2 rounded-md"><input type="text" value={alloc.name} onChange={e => handleFieldChange(alloc.id, 'name', e.target.value)} className="bg-gray-600 p-2 rounded-md col-span-4" placeholder="Nombre del apartado" /><div className="flex items-center col-span-2"><input type="number" value={alloc.percentage} onChange={e => handleFieldChange(alloc.id, 'percentage', parseFloat(e.target.value) || 0)} className="bg-gray-600 p-2 rounded-md w-full text-center" placeholder="%"/><span className="text-gray-400 font-bold ml-2">%</span></div><select value={alloc.destinationCardId || ''} onChange={e => handleFieldChange(alloc.id, 'destinationCardId', e.target.value || null)} className="bg-gray-600 p-2 rounded-md col-span-5"><option value="">-- Transferir a... --</option><optgroup label="Cuentas de Débito">{debitCards.map(card => (<option key={`debit-${card.id}`} value={`debit-${card.id}`}>{card.name} ({card.bank})</option>))}</optgroup><optgroup label="Tarjetas de Crédito (para pagar)">{creditCards.map(card => (<option key={`credit-${card.id}`} value={`credit-${card.id}`}>{card.name} ({card.bank})</option>))}</optgroup></select><button onClick={() => handleRemove(alloc.id)} className="text-red-400 hover:text-red-300 p-2 col-span-1 justify-self-end"><Trash2 size={18}/></button></div>))}</div><button onClick={handleAdd} className="mt-4 flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 py-2 px-4 rounded-lg"><Plus size={16}/> Agregar Apartado</button><div className="mt-6 flex justify-end gap-4 border-t border-gray-700 pt-4"><button onClick={onCancel} className="py-2 px-4 bg-gray-600 rounded-lg">Cancelar</button><button onClick={handleSave} className="py-2 px-4 bg-green-600 rounded-lg">Guardar Cambios</button></div></div></div>);
};
const StreamingSaleModal = ({ sale, onSave, onCancel, distributors, platforms }) => {
    const [formData, setFormData] = useState(sale ? { ...sale } : {
        id: null, clientName: '', clientPhone: '', accounts: [],
        distributor: 'Ninguno', expirationDate: '', reports: 0, replenishedDays: 0
    });
    const [accounts, setAccounts] = useState(sale?.accounts || [{
        id: Date.now(), serviceId: '', accountIdentifier: '', password: '', profile: '', pin: ''
    }]);

    const handleClientChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAccountChange = (index, field, value) => {
        const newAccounts = [...accounts];
        newAccounts[index][field] = value;
        setAccounts(newAccounts);
    };

    const handleAddAccount = () => {
        setAccounts(prev => [...prev, { id: Date.now(), serviceId: '', accountIdentifier: '', password: '', profile: '', pin: '' }]);
    };
    
    const handleRemoveAccount = (index) => {
        setAccounts(prev => prev.filter((_, i) => i !== index));
    };
    
    const isCombo = useMemo(() => accounts.length > 1, [accounts]);

    const total = useMemo(() => {
        const baseTotal = accounts.reduce((sum, acc) => {
            const platform = platforms.find(p => p.id == acc.serviceId);
            return sum + (platform ? platform.price : 0);
        }, 0);
        return isCombo ? baseTotal * 0.90 : baseTotal;
    }, [accounts, platforms, isCombo]);
    
    const baseTotal = useMemo(() => {
        return accounts.reduce((sum, acc) => {
            const platform = platforms.find(p => p.id == acc.serviceId);
            return sum + (platform ? platform.price : 0);
        }, 0);
    }, [accounts, platforms]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, accounts, salePrice: total, isCombo });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-3xl animate-fade-in-scale">
                <h3 className="text-2xl font-bold text-cyan-300 mb-6">{sale ? 'Editar' : 'Nueva'} Venta de Streaming</h3>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm text-gray-400 mb-1">Nombre Cliente</label><input type="text" name="clientName" value={formData.clientName} onChange={handleClientChange} className="w-full bg-gray-700 p-2 rounded-md" required /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">Teléfono Cliente (con 52)</label><input type="tel" name="clientPhone" value={formData.clientPhone} onChange={handleClientChange} className="w-full bg-gray-700 p-2 rounded-md" placeholder="525512345678" required /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">Fecha de Vencimiento</label><input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleClientChange} className="w-full bg-gray-700 p-2 rounded-md" required /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">Distribuidor</label><select name="distributor" value={formData.distributor} onChange={handleClientChange} className="w-full bg-gray-700 p-2 rounded-md" required><option value="">Seleccione...</option>{distributors.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    </div>
                    <hr className="border-gray-700"/>
                    
                    {accounts.map((account, index) => (
                        <div key={account.id} className="p-4 bg-gray-900/50 rounded-lg space-y-3 relative">
                           <h4 className="text-lg font-semibold text-cyan-400">Cuenta #{index + 1}</h4>
                            {accounts.length > 1 && <button type="button" onClick={() => handleRemoveAccount(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 p-1"><X size={18}/></button>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Servicio</label>
                                    <select value={account.serviceId} onChange={e => handleAccountChange(index, 'serviceId', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required>
                                        <option value="">Seleccionar plataforma...</option>
                                        {platforms.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><label className="block text-sm text-gray-400 mb-1">Cuenta</label><input type="text" value={account.accountIdentifier} onChange={e => handleAccountChange(index, 'accountIdentifier', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required /></div>
                                <div><label className="block text-sm text-gray-400 mb-1">Contraseña</label><input type="text" value={account.password} onChange={e => handleAccountChange(index, 'password', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required /></div>
                                <div><label className="block text-sm text-gray-400 mb-1">Perfil</label><input type="text" value={account.profile} onChange={e => handleAccountChange(index, 'profile', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" /></div>
                                <div><label className="block text-sm text-gray-400 mb-1">PIN</label><input type="text" value={account.pin} onChange={e => handleAccountChange(index, 'pin', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" /></div>
                            </div>
                        </div>
                    ))}
                    
                    <button type="button" onClick={handleAddAccount} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"><Plus/>Agregar otra cuenta</button>
                    
                     <div className="mt-4 p-4 bg-gray-900/70 rounded-lg space-y-2">
                       {isCombo && (
                            <>
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(baseTotal)}</span>
                                </div>
                                <div className="flex justify-between text-yellow-400">
                                    <span>Descuento Combo (10%)</span>
                                    <span>- {formatCurrency(baseTotal * 0.10)}</span>
                                </div>
                            </>
                       )}
                       <div className="flex justify-between text-white font-bold text-2xl border-t border-gray-600 pt-2 mt-2">
                           <span>Total</span>
                           <span className="text-green-400">{formatCurrency(total)}</span>
                       </div>
                   </div>

                </div>
                <div className="mt-6 flex justify-end gap-4 border-t border-gray-700 pt-4">
                    <button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg">Cancelar</button>
                    <button type="submit" className="py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg">Guardar Venta</button>
                </div>
            </form>
        </div>
    );
};
const RenewStreamingModal = ({ sale, onConfirm, onCancel, platforms }) => {
    const serviceNames = sale.accounts.map(acc => platforms.find(p => p.id == acc.serviceId)?.name || 'N/A').join(' + ');

    const renewalPrice = useMemo(() => {
        const baseTotal = sale.accounts.reduce((sum, acc) => {
            const platform = platforms.find(p => p.id == acc.serviceId);
            return sum + (platform ? platform.price : 0);
        }, 0);
        return sale.isCombo ? baseTotal * 0.90 : baseTotal;
    }, [sale, platforms]);

    const getOneMonthFromToday = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date.toISOString().split('T')[0];
    };
    const [newExpirationDate, setNewExpirationDate] = useState(getOneMonthFromToday());

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(sale.saleId, newExpirationDate, renewalPrice);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in-scale">
                <h3 className="text-2xl font-bold text-cyan-300 mb-2">Renovar Suscripción</h3>
                <p className="text-lg text-white mb-1">Cliente: <span className="font-semibold">{sale.clientName}</span></p>
                <p className="text-md text-gray-300 mb-6">Servicio: {serviceNames}</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nueva Fecha de Vencimiento</label>
                        <input 
                            type="date"
                            value={newExpirationDate}
                            onChange={e => setNewExpirationDate(e.target.value)}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    <div className="p-4 bg-gray-900 rounded-lg text-center">
                        <p className="text-lg text-gray-400">Total a Pagar</p>
                        <p className="text-4xl font-bold text-green-400">{formatCurrency(renewalPrice)}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="py-2 px-6 bg-gray-600 hover:bg-gray-500 rounded-lg">Cancelar</button>
                    <button type="submit" className="py-2 px-6 bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2">
                        <RefreshCw size={18}/> Confirmar Renovación
                    </button>
                </div>
            </form>
        </div>
    );
};
const CardTransactionModal = ({ onSave, onCancel, card, type }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState(type === 'debit' ? 'Gasto' : 'Compra');

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert("Por favor ingrese un monto válido.");
            return;
        }
        onSave({
            cardId: card.id,
            transaction: {
                id: Date.now(),
                date: new Date().toISOString(),
                description,
                amount: parsedAmount,
                type: transactionType
            }
        });
    };
    
    return (<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"><form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md"><h3 className="text-2xl font-bold text-cyan-300 mb-1">Nueva Transacción</h3><p className="text-gray-400 mb-6">para {card.name}</p><div className="space-y-4"><div><label className="block text-sm text-gray-400 mb-1">Tipo de Transacción</label><select value={transactionType} onChange={e => setTransactionType(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md">{type === 'debit' ? (<><option>Gasto</option><option>Depósito</option></>) : (<><option>Compra</option><option>Pago</option></>)}</select></div><div><label className="block text-sm text-gray-400 mb-1">Monto</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required/></div><div><label className="block text-sm text-gray-400 mb-1">Descripción</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required/></div></div><div className="mt-6 flex justify-end gap-4"><button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-600 rounded-lg">Cancelar</button><button type="submit" className="py-2 px-4 bg-green-600 rounded-lg">Guardar</button></div></form></div>);
}

// --- VISTAS ---
const DashboardView = ({ modules, clients, rates, handleModuleClick, setShowAddModuleModal, selectedModuleId }) => ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">{modules.map(m => { const client = clients.find(c => c.id === m.clientId); const timeCost = calculateTimeCost(Math.ceil(m.elapsedTime / 60), m.type, rates, m.isFree); const productCost = m.products.reduce((sum, p) => sum + p.salePrice, 0); const totalCost = timeCost + productCost; let statusColor = 'bg-gray-700 hover:bg-gray-600', statusText = 'Disponible'; if (m.status === 'ocupado') { statusColor = 'bg-blue-800 hover:bg-blue-700 animate-pulse'; statusText = 'Ocupado'; } else if (m.status === 'cobrando') { statusColor = 'bg-yellow-600 hover:bg-yellow-500'; statusText = 'Cobrando'; } let isExceeded = m.status === 'ocupado' && m.fixedTime > 0 && m.elapsedTime > m.fixedTime; if (isExceeded) { statusColor = 'bg-red-800 hover:bg-red-700 animate-pulse'; statusText = `Excedido +${formatTime(m.elapsedTime - m.fixedTime)}`; } return (<div key={m.id} onClick={() => handleModuleClick(m.id)} className={`rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg border-2 ${selectedModuleId === m.id ? 'border-cyan-400' : 'border-gray-600'} ${statusColor}`}><div className="flex justify-between items-center"><h3 className="text-xl font-bold text-white">{m.name}</h3><div className="text-cyan-300">{iconMap[m.type]}</div></div><div className="mt-2 text-center">{m.status !== 'disponible' ? (<>{m.isFree && <div className="text-xs font-bold text-yellow-300 mb-1">HORA GRATIS</div>}<p className={`text-3xl font-mono ${isExceeded ? 'text-red-300' : 'text-green-300'}`}>{formatTime(m.fixedTime > 0 ? Math.max(0, m.fixedTime - m.elapsedTime) : m.elapsedTime)}</p><p className="text-lg text-white mt-1">{formatCurrency(totalCost)}</p>{client && <p className="text-xs text-cyan-300 truncate">{client.name}</p>}</>) : (<p className="text-2xl text-gray-300">Disponible</p>)}</div></div>); })}<div onClick={() => setShowAddModuleModal(true)} className="flex flex-col items-center justify-center rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-dashed border-gray-600 hover:bg-gray-700 hover:border-cyan-400 group"><Plus className="w-12 h-12 text-gray-500 transition-colors group-hover:text-cyan-400" /><p className="mt-2 text-lg font-bold text-gray-400 transition-colors group-hover:text-white">Agregar Módulo</p></div></div> );
const ClientsView = ({ clients, setClients, handleDeleteRequest }) => { 
    const [newName, setNewName] = useState(''); 
    const [newPhone, setNewPhone] = useState(''); 
    const handleAddClient = (e) => { 
        e.preventDefault(); 
        if (!newName.trim()) return alert("El nombre es obligatorio."); 
        setClients(prev => { 
            const newId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1; 
            return [...prev, { id: newId, name: newName, phone: newPhone, points: 0 }]; 
        }); 
        setNewName(''); 
        setNewPhone(''); 
    };

    return (
        <div className="p-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Administrar Clientes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleAddClient} className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-cyan-300">Nuevo Cliente</h3>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Teléfono (Opcional)</label>
                        <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"><Plus/>Agregar Cliente</button>
                </form>
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">Lista de Clientes</h3>
                    <div className="max-h-96 overflow-y-auto pr-2">
                        {clients.length > 0 ? clients.map(client => (
                            <div key={client.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg mb-2">
                                <div>
                                    <p className="font-bold text-white">{client.name}</p>
                                    <p className="text-sm text-gray-400">{client.phone}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-yellow-400"><Star className="w-5 h-5"/> <span className="font-bold text-lg">{client.points}</span></div>
                                    <button onClick={() => handleDeleteRequest('client', client)} className="text-gray-500 hover:text-red-500 transition"><Trash2 className="w-5 h-5"/></button>
                                </div>
                            </div>
                        )) : <p className="text-center text-gray-400">No hay clientes registrados.</p>}
                    </div>
                </div>
            </div>
        </div>
    ); 
};
const ProductsView = ({ products, setProducts, handleDeleteRequest, productCategories, setProductCategories }) => {
    const [showProductModal, setShowProductModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const handleSaveProduct = (productData) => { if (productData.category && !productCategories.includes(productData.category)) { setProductCategories(prev => [...prev, productData.category].sort()); } setProducts(prev => { if (productData.id) { return prev.map(p => p.id === productData.id ? { ...productData } : p); } else { const newId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) + 1 : 1; return [...prev, { id: newId, ...productData }]; } }); setShowProductModal(false); setProductToEdit(null); };
    
    return (<div className="p-6 animate-fade-in">{showProductModal && <AddProductModal onSave={handleSaveProduct} onCancel={() => {setShowProductModal(false); setProductToEdit(null);}} productToEdit={productToEdit} categories={productCategories} />}<div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-white">Administrar Productos</h2><button onClick={() => {setProductToEdit(null); setShowProductModal(true);}} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Plus/>Agregar Producto</button></div><div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-700"><tr><th className="p-3">Código</th><th className="p-3">Descripción</th><th className="p-3">P. Venta</th><th className="p-3">Ganancia</th><th className="p-3">Acciones</th></tr></thead><tbody>{products.map(p => (<tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50"><td className="p-3 font-mono">{p.barcode}</td><td className="p-3">{p.name}</td><td className="p-3 text-green-400">{formatCurrency(p.salePrice)}</td><td className="p-3 text-cyan-400">{formatCurrency(p.salePrice - p.costPrice)}</td><td className="p-3 flex gap-2"><button onClick={() => {setProductToEdit(p); setShowProductModal(true);}} className="text-gray-400 hover:text-yellow-400"><Edit size={20}/></button><button onClick={() => handleDeleteRequest('product', p)} className="text-gray-400 hover:text-red-400"><Trash2 size={20}/></button></td></tr>))}</tbody></table></div></div>);
};
const RatesView = ({ rates: initialRates, setRates: setGlobalRates, setCurrentView }) => {
    const [editableRates, setEditableRates] = useState(JSON.parse(JSON.stringify(initialRates)));
    const handleRateFieldChange = (rateIndex, field, value) => { const newRates = [...editableRates]; newRates[rateIndex][field] = value; setEditableRates(newRates); };
    const handleBracketFieldChange = (rateIndex, bracketIndex, field, value) => { const newRates = [...editableRates]; const numericValue = parseFloat(value); newRates[rateIndex].brackets[bracketIndex][field] = isNaN(numericValue) ? 0 : numericValue; setEditableRates(newRates); };
    const handleAddBracket = (rateIndex) => { const newRates = [...editableRates]; const lastBracket = newRates[rateIndex].brackets[newRates[rateIndex].brackets.length - 1] || { to: 0 }; newRates[rateIndex].brackets.push({ from: lastBracket.to + 1, to: lastBracket.to + 10, price: 0 }); setEditableRates(newRates); };
    const handleRemoveBracket = (rateIndex, bracketIndex) => { const newRates = [...editableRates]; newRates[rateIndex].brackets.splice(bracketIndex, 1); setEditableRates(newRates); };
    const saveRateChanges = () => { for (const rate of editableRates) { for (const bracket of rate.brackets) { if (bracket.from >= bracket.to) { alert(`Error en la tarifa "${rate.name}": El valor "Desde" (${bracket.from}) no puede ser mayor o igual al valor "Hasta" (${bracket.to}).`); return; } if (bracket.price < 0) { alert(`Error en la tarifa "${rate.name}": El precio no puede ser negativo.`); return; } } } setGlobalRates(editableRates); alert("¡Tarifas guardadas!"); setCurrentView('dashboard'); }
    return (<div className="p-6 animate-fade-in"><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-white">Configuración de Tarifas</h2><div className="flex gap-4"><button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"><Ban className="w-5 h-5" /> Cancelar</button><button onClick={saveRateChanges} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition"><Save className="w-5 h-5" /> Guardar Cambios</button></div></div><div className="space-y-6">{editableRates.map((rate, rateIndex) => (<div key={rateIndex} className="bg-gray-800 p-6 rounded-lg shadow-lg"><div className="flex justify-between items-center mb-4"><input type="text" value={rate.name} onChange={e => handleRateFieldChange(rateIndex, 'name', e.target.value)} className="text-xl font-bold text-cyan-300 bg-transparent border-b-2 border-gray-700 focus:outline-none focus:border-cyan-500 w-1/2"/><div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">{iconMap[rate.appliesTo]}<span className="text-white">{rate.appliesTo}</span></div></div><div className="space-y-2"><div className="grid grid-cols-10 gap-x-4 text-gray-400 font-bold px-2"><span className="col-span-3">Desde (min)</span><span className="col-span-3">Hasta (min)</span><span className="col-span-3">Precio</span><span className="col-span-1"></span></div>{rate.brackets.map((bracket, bIndex) => (<div key={bIndex} className="grid grid-cols-10 gap-x-4 items-center p-2 rounded-md hover:bg-gray-700/50"><div className="col-span-3"><input type="number" value={bracket.from} onChange={e => handleBracketFieldChange(rateIndex, bIndex, 'from', e.target.value)} className="bg-gray-900 text-white font-semibold p-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div><div className="col-span-3"><input type="number" value={bracket.to} onChange={e => handleBracketFieldChange(rateIndex, bIndex, 'to', e.target.value)} className="bg-gray-900 text-white font-semibold p-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div><div className="col-span-3 flex items-center"><span className="text-gray-400 mr-2">$</span><input type="number" step="0.01" value={bracket.price} onChange={e => handleBracketFieldChange(rateIndex, bIndex, 'price', e.target.value)} className="bg-gray-900 text-green-300 font-semibold p-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"/></div><div className="col-span-1 justify-self-end"><button onClick={() => handleRemoveBracket(rateIndex, bIndex)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/20"><Trash2 className="w-5 h-5"/></button></div></div>))}</div><button onClick={() => handleAddBracket(rateIndex)} className="mt-4 flex items-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg transition"><Plus className="w-5 h-5 mr-1" /> Agregar Rango</button></div>))}</div></div>);
};
const PointOfSaleView = ({ products, clients, addSale, scriptsLoaded }) => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastSale, setLastSale] = useState(null);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.map(item => item.id === productId ? {...item, qty: item.qty -1} : item).filter(item => item.qty > 0))
    };

    const filteredProducts = searchTerm ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm)) : products;
    const total = cart.reduce((sum, item) => sum + (item.salePrice * (1 - (item.discount || 0) / 100) * item.qty), 0);

    const triggerFinalizeSale = () => {
        if (cart.length === 0) return alert("El carrito está vacío.");
        setShowFinalizeModal(true);
    };

    const executeFinalizeSale = (saleDetails) => {
        const sale = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: cart,
            ...saleDetails
        };
        addSale(sale);
        setLastSale(sale);
        setCart([]);
        setSearchTerm('');
        setShowFinalizeModal(false);
    };

    const generatePdf = (sale) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({orientation: 'portrait', unit: 'mm', format: 'letter'});
        
        const client = clients.find(c => c.id === parseInt(sale.clientId));
        const pageCenterX = doc.internal.pageSize.getWidth() / 2;
        const margin = 20;
        const usableWidth = doc.internal.pageSize.getWidth() - margin * 2;

        // --- PÁGINA 1: NOTA DE VENTA ---
        doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(40, 40, 40); doc.text("Nota de Venta", pageCenterX, 15, { align: "center" });
        doc.setLineWidth(0.5); doc.line(margin, 17, 210 - margin, 17);
        doc.setFontSize(10); doc.setTextColor(100); doc.setFont("helvetica", "normal"); doc.text("Cyber Pc Forever", pageCenterX, 23, { align: "center" });
        doc.setFontSize(9); doc.text(`Venta ID: ${sale.id}`, margin, 33); doc.text(`Fecha: ${new Date(sale.date).toLocaleString()}`, 210 - margin, 33, { align: "right" });
        doc.setLineWidth(0.1); doc.line(margin, 37, 210 - margin, 37);
        let clientY = 43;
        doc.setFontSize(10); doc.setTextColor(40); doc.setFont("helvetica", "bold"); doc.text("Cliente:", margin, clientY);
        doc.setFont("helvetica", "normal"); 
        if (client) {
            doc.text(client.name, margin + 20, clientY);
            if(client.phone) { doc.text(`Tel: ${client.phone}`, margin + 20, clientY + 5); }
        } else {
            doc.text("Venta al Público", margin + 20, clientY);
        }
        doc.line(margin, clientY + 10, 210 - margin, clientY + 10);

        const tableBody = sale.items.map(item => {
            const finalPrice = item.salePrice * (1 - (item.discount || 0) / 100);
            const description = `${item.name}\nCódigo: ${item.barcode || 'N/A'} | Garantía: ${item.warranty || 'N/A'}`;
            return [`${item.qty}x`, description, formatCurrency(item.salePrice), `${item.discount || 0}%`, formatCurrency(item.qty * finalPrice)];
        });
        doc.autoTable({
            startY: clientY + 12,
            margin: { left: margin, right: margin },
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            head: [['Cant', 'Descripción', 'P.U.', 'Desc.', 'Importe']],
            body: tableBody,
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 1) {
                    const cell = data.cell;
                    const text = cell.text[0].split('\n');
                    if (text.length > 1) {
                        doc.setFontSize(9);
                        doc.setFont("helvetica", "bold");
                        doc.text(text[0], cell.x + 2, cell.y + 5);
                        doc.setFontSize(7);
                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(120);
                        doc.text(text[1], cell.x + 2, cell.y + 9);
                        cell.text = [];
                    }
                }
            }
        });
        let finalY = doc.autoTable.previous.finalY;
        if (sale.commission > 0) {
             doc.setFontSize(10); doc.text("Comisión Tarjeta:", 150, finalY + 5); doc.text(formatCurrency(sale.commission), 210 - margin, finalY + 5, { align: "right" });
             finalY += 5;
        }
        if (sale.financingCost > 0) {
             doc.setFontSize(10); doc.text(`Costo Financiamiento (${sale.installments} MSI):`, 150, finalY + 5); doc.text(formatCurrency(sale.financingCost), 210 - margin, finalY + 5, { align: "right" });
             finalY += 5;
        }
        doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("TOTAL:", 150, finalY + 10); doc.text(formatCurrency(sale.total), 210 - margin, finalY + 10, { align: "right" });
        doc.setFontSize(9); doc.setTextColor(150); doc.text("¡Gracias por su compra!", pageCenterX, finalY + 20, { align: "center" });

        // --- PÁGINA 2: PÓLIZA DE GARANTÍA ---
        doc.addPage();
        let yPos = 20;

        doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(30, 30, 30); doc.text("Póliza de Garantía", pageCenterX, yPos, { align: 'center' });
        yPos += 7;
        doc.setLineWidth(0.5); doc.setDrawColor(180, 180, 180); doc.line(margin, yPos, doc.internal.pageSize.getWidth() - margin, yPos);
        yPos += 12;

        const drawSection = (title, points, titleColor) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
            doc.text(title, margin, yPos);
            yPos += 2;
            doc.setLineWidth(0.2);
            doc.setDrawColor(titleColor[0], titleColor[1], titleColor[2]);
            doc.line(margin, yPos, margin + doc.getTextWidth(title) + 2, yPos);
            yPos += 8;
    
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
    
            points.forEach(point => {
                const lines = doc.splitTextToSize(point, usableWidth);
                doc.text(lines, margin, yPos);
                yPos += (lines.length * 4.5) + 3;
            });
            yPos += 5;
        };

        const clausulas = [
            "1. Para hacer valida la garantía, se deberá acreditar fehacientemente la compra mediante la presentación de este documento en original.",
            "2. Si el producto se encuentra dentro del periodo de garantía y ha sido utilizado de manera normal conforme las especificaciones del fabricante, PC FOREVER se comete a reparar y/o reponer las piezas defectuosas sin cargo para el propietario.",
            "3. La responsabilidad de PC FOREVER, se limita única y exclusivamente a la reparación, si corresponde del producto en cuestión, o el cambio físico en caso necesario, sin incurrir en ningún otro tipo de obligación económica o de cualquier otro tipo derivada del mal funcionamiento del mismo.",
            "4. El procedimiento de garantía tratará de resolverse en el menor tiempo posible, sin embargo, este puede tardar de 15 a 30 días hábiles.",
            "5. El tiempo de garantía se especifica en la parte adversa de este documento y varia según el producto.",
            "6. Favor de guardar sus empaques, cajas y/o accesorios para hacer valida la garantía de lo contrario no se podrá hacer valida la misma.",
            "7. En caso de que el producto en garantía no se pueda reparar o no halla en existencia se hará una nota de crédito con el monto de venta para aplicarlo en otro producto."
        ];
        drawSection("CLÁUSULAS", clausulas, [41, 128, 185]);

        const excepciones = [
            "Daños causados por materiales químicos utilizados en su limpieza o mantenimiento.",
            "Partes del producto usadas, maltratadas, decoloradas, o con desgaste natural por uso.",
            "Daños o mal funcionamiento causado o causados por uso distinto para el cual fue creado mal uso, o por realizar reparaciones por personal no autorizado.",
            "En cualquier tipo de Software instalado no hay garantía.",
            "Daños por cuestiones eléctricas, bajones o subidas de voltaje (se recomienda regulador) en caso de equipos electrónicos)."
        ];
        drawSection("SIN EXCEPCIONES: La garantía no aplicará en los siguientes casos", excepciones.map((e, i) => `${i+1}. ${e}`), [200, 0, 0]);

        doc.save(`nota_venta_${sale.id}.pdf`);
    };

    if(lastSale) { return <div className="p-10 text-center animate-fade-in"><h2 className="text-3xl font-bold text-green-400 mb-4">¡Venta Completada!</h2><p className="text-lg mb-6">Total de la venta: {formatCurrency(lastSale.total)}</p><div className="flex justify-center gap-4"><button onClick={() => setLastSale(null)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg">Nueva Venta</button><button onClick={() => generatePdf(lastSale)} disabled={!scriptsLoaded} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed">{scriptsLoaded ? <Printer/> : <RefreshCw className="animate-spin h-5 w-5 mr-2"/>}{scriptsLoaded ? 'Descargar Nota (PDF)' : 'Cargando...'}</button></div></div> }
    
    return (<div className="p-6 animate-fade-in grid grid-cols-3 gap-6 h-[calc(100vh-68px)]">{showFinalizeModal && <FinalizeSaleModal total={total} clients={clients} onConfirm={executeFinalizeSale} onCancel={() => setShowFinalizeModal(false)} />}<div className="col-span-2 flex flex-col"><input type="text" placeholder="Buscar producto por nombre o código de barras..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md mb-4"/><div className="bg-gray-800 p-4 rounded-lg flex-grow overflow-y-auto"><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{filteredProducts.map(p => (<div key={p.id} onClick={() => addToCart(p)} className="bg-gray-700 p-3 rounded-md text-center cursor-pointer hover:bg-cyan-800"><p className="font-bold text-white truncate">{p.name}</p><p className="text-green-400">{formatCurrency(p.salePrice)}</p></div>))}</div></div></div><div className="col-span-1 bg-gray-800 p-4 rounded-lg flex flex-col justify-between"><div><h3 className="text-xl font-bold text-cyan-300 mb-4">Carrito de Venta</h3><div className="flex-grow overflow-y-auto max-h-80 mb-4">{cart.length > 0 ? cart.map(item => (<div key={item.id} className="flex justify-between items-center mb-2 bg-gray-700 p-2 rounded-md"><div><p className="text-white">{item.name}</p><p className="text-sm text-gray-400">{item.qty} x {formatCurrency(item.salePrice)}</p></div><div className="flex items-center gap-2"><p className="text-lg font-bold text-white">{formatCurrency(item.salePrice * (1 - (item.discount || 0) / 100) * item.qty)}</p><button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></button></div></div>)) : <p className="text-center text-gray-400">Carrito vacío</p>}</div></div><div className="border-t border-gray-600 pt-4"><div className="flex justify-between items-center text-2xl font-bold mb-4"><span className="text-white">TOTAL:</span><span className="text-green-400">{formatCurrency(total)}</span></div><button onClick={triggerFinalizeSale} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-lg text-xl">Finalizar Venta</button></div></div></div>);};
const CashBalanceView = ({ sales, cashMovements, addCashMovement, setCashMovements, setSales, registerStatus, setRegisterStatus, currentUser, allocations, setAllocations, dailySavings, lastDistributionDate, setLastDistributionDate, distributionHistory, setDistributionHistory, clients, scriptsLoaded, handleDeleteRequest, addDebitCardTransaction, addCreditCardTransaction, creditCards }) => {
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [movDescription, setMovDescription] = useState('');
    const [movAmount, setMovAmount] = useState('');
    const [movType, setMovType] = useState('Ingreso');
    
    const todayStr = new Date().toISOString().substring(0, 10);
    
    const allTodayTransactions = useMemo(() => {
        const todaySales = sales.filter(s => new Date(s.date).toISOString().substring(0,10) === todayStr);
        const todayMovements = cashMovements.filter(m => new Date(m.date).toISOString().substring(0,10) === todayStr);

        const mappedSales = todaySales.map(s => ({
            id: `sale-${s.id}`,
            date: s.date,
            description: `Venta TPV/Tiempo #${s.id}`,
            amount: s.total,
            type: 'Ingreso',
            originalType: 'sale',
            originalData: s,
        }));

        const mappedMovements = todayMovements.map(m => ({
            id: `movement-${m.id}`,
            date: m.date,
            description: m.description,
            amount: m.amount,
            type: m.type,
            originalType: 'cash_movement',
            originalData: m,
        }));
        
        return [...mappedSales, ...mappedMovements].sort((a,b) => new Date(b.date) - new Date(a.date));
    }, [sales, cashMovements, todayStr]);

    const handleAddMovement = (e) => { e.preventDefault(); if (!movDescription || !movAmount || parseFloat(movAmount) <= 0) { alert("Por favor, ingrese una descripción y un monto válido."); return; } addCashMovement({ id: Date.now(), description: movDescription, amount: parseFloat(movAmount), type: movType, date: new Date().toISOString() }); setMovDescription(''); setMovAmount(''); };
    const handleOpenRegister = (initialAmount) => { setRegisterStatus({ isOpen: true, initialCash: initialAmount, date: todayStr }); setShowOpenModal(false); };
    
    const generateEndOfDayPdf = (reportData) => {
        const { jsPDF } = window.jspdf; 
        const doc = new jsPDF();

        doc.setFontSize(18); doc.text("Reporte de Cierre de Caja", 105, 20, { align: 'center' });
        doc.setFontSize(12); doc.text(`Fecha: ${new Date(reportData.date).toLocaleDateString()}`, 105, 28, { align: 'center' });
        
        let y = 40;
        const addSection = (title, data) => {
            if (data.length === 0) return;
            doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text(title, 14, y); y += 8;
            doc.autoTable({ startY: y, head: [Object.keys(data[0])], body: data.map(Object.values), theme: 'grid' });
            y = doc.autoTable.previous.finalY + 10;
        };
        
        const summaryData = [
            { Métrica: "Fondo Inicial", Valor: formatCurrency(reportData.initialCash) },
            { Métrica: "Ventas en Efectivo (TPV/Tiempo)", Valor: formatCurrency(reportData.cashSalesTotal) },
            { Métrica: "Ventas Streaming (Efectivo)", Valor: formatCurrency(reportData.streamingSalesTotal) },
            { Métrica: "Ventas Recargas (Efectivo)", Valor: formatCurrency(reportData.recargasSalesTotal) },
            { Métrica: "Ventas Servicios y Trámites (Efectivo)", Valor: formatCurrency(reportData.servicesSalesTotal + reportData.tramitesSalesTotal) },
            { Métrica: "Ventas con Tarjeta", Valor: formatCurrency(reportData.cardSalesTotal) },
            { Métrica: "Ventas con Mercado Pago", Valor: formatCurrency(reportData.mercadoPagoSalesTotal) },
            { Métrica: "Ventas por Transferencia", Valor: formatCurrency(reportData.transferSalesTotal) },
            { Métrica: "Otros Ingresos", Valor: formatCurrency(reportData.miscIncome) },
            { Métrica: "Egresos", Valor: formatCurrency(reportData.miscExpenses) },
            { Métrica: "Total en Sistema", Valor: formatCurrency(reportData.expectedCashInBox) },
            { Métrica: "Total Contado", Valor: formatCurrency(reportData.countedCash) },
            { Métrica: "Diferencia", Valor: formatCurrency(reportData.countedCash - reportData.expectedCashInBox) },
            { Métrica: "--- GANANCIA BRUTA (SIN SERVICIOS) ---", Valor: formatCurrency(reportData.grossProfit) },
        ];
        addSection("Resumen del Día", summaryData);

        if(reportData.todaySales.length > 0) addSection("Ventas Detalladas (TPV/Tiempo)", reportData.todaySales.map(s=>({ID: s.id, Total: formatCurrency(s.total), Pago: s.paymentMethod, Cliente: clients.find(c=>c.id === s.clientId)?.name || 'Público'})));
        if(reportData.todayMovements.length > 0) addSection("Movimientos de Caja", reportData.todayMovements.map(m=>({Desc: m.description, Tipo: m.type, Monto: formatCurrency(m.amount)})));
        if(reportData.distributions.length > 0) addSection("Distribución de Ganancia", reportData.distributions.map(d=>({Apartado: allocations.find(a=>a.id === d.id)?.name, Monto: formatCurrency(d.amount)})));

        doc.save(`cierre_caja_${reportData.date}.pdf`);
    };

    const executeCloseRegister = (countedCash) => {
        try {
            const reportDate = registerStatus.date;
            const dailyData = calculateDailyTotals(sales, cashMovements, reportDate);
            const { cashSalesTotal, streamingSalesTotal, recargasSalesTotal, servicesSalesTotal, tramitesSalesTotal, miscIncome, miscExpenses } = dailyData;
            const expectedCashInBox = registerStatus.initialCash + cashSalesTotal + streamingSalesTotal + recargasSalesTotal + servicesSalesTotal + tramitesSalesTotal + miscIncome - miscExpenses;
            
            let todayDistributions = [];
            if (reportDate !== lastDistributionDate) {
                const profitToDistribute = Math.max(0, dailyData.grossProfit - dailySavings);
                todayDistributions = allocations.map(alloc => ({ id: alloc.id, amount: profitToDistribute * (alloc.percentage / 100), destinationCardId: alloc.destinationCardId }));
                
                setAllocations(prevAllocations => prevAllocations.map(alloc => { 
                    const dist = todayDistributions.find(d => d.id === alloc.id);
                    if (dist && dist.amount > 0) {
                        if (dist.destinationCardId) {
                            const [cardType, cardIdStr] = dist.destinationCardId.split('-');
                            const id = parseInt(cardIdStr);
                            if (cardType === 'debit') {
                                addDebitCardTransaction({
                                    cardId: id,
                                    transaction: {
                                        id: Date.now(),
                                        date: new Date().toISOString(),
                                        description: `Transferencia de apartado: ${alloc.name}`,
                                        amount: dist.amount,
                                        type: 'Depósito'
                                    }
                                });
                            } else if (cardType === 'credit') {
                                addCreditCardTransaction({
                                    cardId: id,
                                    transaction: {
                                        id: Date.now(),
                                        date: new Date().toISOString(),
                                        description: `Pago desde apartado: ${alloc.name}`,
                                        amount: dist.amount,
                                        type: 'Pago'
                                    }
                                });
                            }
                        }
                        return { ...alloc, balance: alloc.balance + dist.amount };
                    }
                    return alloc;
                }));

                setDistributionHistory(prev => [...prev, { date: reportDate, distributions: todayDistributions }]);
                setLastDistributionDate(reportDate);
            }
            
            try {
                if (scriptsLoaded) generateEndOfDayPdf({ ...dailyData, date: reportDate, initialCash: registerStatus.initialCash, expectedCashInBox, countedCash, distributions: todayDistributions });
            } catch(e) { console.error("Error al generar PDF:", e); alert("No se pudo generar el reporte en PDF."); }

        } catch (error) {
            console.error("Error general al cerrar la caja:", error);
            alert("Ocurrió un error inesperado al cerrar la caja. Revise la consola para más detalles.");
        } finally {
            const reportDate = registerStatus.date;
            setRegisterStatus({ isOpen: false, initialCash: 0, date: null });
            setSales(prev => prev.filter(s => new Date(s.date).toISOString().substring(0, 10) !== reportDate));
            setCashMovements(prev => prev.filter(m => new Date(m.date).toISOString().substring(0, 10) !== reportDate));
            setShowCloseConfirmModal(false);
        }
    };

    if (!registerStatus.isOpen || registerStatus.date !== todayStr) {
        return (<div className="p-6 animate-fade-in flex flex-col items-center justify-center h-full"><div className="text-center"><Lock className="w-24 h-24 text-gray-600 mx-auto mb-4" /><h1 className="text-3xl font-bold text-white mb-2">Caja Cerrada</h1><p className="text-gray-400 mb-6">Debe aperturar la caja para registrar ventas y movimientos del día.</p><button onClick={() => setShowOpenModal(true)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center gap-2 mx-auto"><Unlock /> Aperturar Caja</button></div>{showOpenModal && <OpenRegisterModal onOpen={handleOpenRegister} onCancel={() => setShowOpenModal(false)} />}</div>);
    }
    
    const { cashSalesTotal, cardSalesTotal, mercadoPagoSalesTotal, transferSalesTotal, miscIncome, miscExpenses, streamingSalesTotal, recargasSalesTotal, servicesSalesTotal, tramitesSalesTotal } = calculateDailyTotals(sales, cashMovements, registerStatus.date);
    const expectedCashInBox = registerStatus.initialCash + cashSalesTotal + streamingSalesTotal + recargasSalesTotal + servicesSalesTotal + tramitesSalesTotal + miscIncome - miscExpenses;

    return (
    <div className="p-6 animate-fade-in">
        {showCloseConfirmModal && <ConfirmCloseRegisterModal expectedCash={expectedCashInBox} onConfirm={executeCloseRegister} onCancel={() => setShowCloseConfirmModal(false)} />}
        <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold text-white">Corte de Caja</h1><button onClick={() => setShowCloseConfirmModal(true)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2" disabled={!scriptsLoaded} title={!scriptsLoaded ? "Cargando dependencias..." : ""}><Lock/> {scriptsLoaded ? 'Cerrar Caja y Repartir' : 'Cargando...'}</button></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"><h3 className="text-xl font-bold text-cyan-300">Registrar Movimiento Manual</h3><form onSubmit={handleAddMovement} className="space-y-3"><div><label className="text-sm text-gray-400">Descripción</label><input type="text" value={movDescription} onChange={e => setMovDescription(e.target.value)} className="w-full bg-gray-700 p-2 mt-1 rounded-md" required/></div><div><label className="text-sm text-gray-400">Monto</label><input type="number" step="0.01" value={movAmount} onChange={e => setMovAmount(e.target.value)} className="w-full bg-gray-700 p-2 mt-1 rounded-md" required/></div><div><label className="text-sm text-gray-400 block mb-2">Tipo</label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setMovType('Ingreso')} className={`py-3 font-semibold rounded-lg flex items-center justify-center gap-2 transition ${ movType === 'Ingreso' ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-gray-600 text-gray-300 hover:bg-gray-500' }`}><ArrowUp className="w-5 h-5" /> Ingreso</button><button type="button" onClick={() => setMovType('Egreso')} className={`py-3 font-semibold rounded-lg flex items-center justify-center gap-2 transition ${ movType === 'Egreso' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-gray-600 text-gray-300 hover:bg-gray-500' }`}><ArrowDown className="w-5 h-5" /> Salida</button></div></div><button type="submit" className={`w-full text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${movType === 'Egreso' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{movType === 'Egreso' ? <TrendingDown/> : <TrendingUp/>} Registrar</button></form></div>
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-cyan-300 mb-4">Resumen de Ingresos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700 p-3 rounded-lg"><p className="text-sm text-gray-400">Fondo Inicial</p><p className="text-2xl font-bold">{formatCurrency(registerStatus.initialCash)}</p></div>
                    <div className="bg-green-800/50 p-3 rounded-lg"><p className="text-sm text-green-300">Ventas TPV/Tiempo</p><p className="text-2xl font-bold text-green-300">{formatCurrency(cashSalesTotal)}</p></div>
                    <div className="bg-red-800/50 p-3 rounded-lg"><p className="text-sm text-red-300">Ventas Streaming</p><p className="text-2xl font-bold text-red-300">{formatCurrency(streamingSalesTotal)}</p></div>
                    <div className="bg-orange-800/50 p-3 rounded-lg"><p className="text-sm text-orange-300">Ventas Recargas</p><p className="text-2xl font-bold text-orange-300">{formatCurrency(recargasSalesTotal)}</p></div>
                    <div className="bg-indigo-800/50 p-3 rounded-lg"><p className="text-sm text-indigo-300">Ventas Servicios</p><p className="text-2xl font-bold text-indigo-300">{formatCurrency(servicesSalesTotal)}</p></div>
                    <div className="bg-pink-800/50 p-3 rounded-lg"><p className="text-sm text-pink-300">Ventas Trámites</p><p className="text-2xl font-bold text-pink-300">{formatCurrency(tramitesSalesTotal)}</p></div>
                    <div className="bg-blue-800/50 p-3 rounded-lg"><p className="text-sm text-blue-300">Vía Transferencia</p><p className="text-2xl font-bold text-blue-300">{formatCurrency(transferSalesTotal)}</p></div>
                    <div className="bg-purple-800/50 p-3 rounded-lg"><p className="text-sm text-purple-300">Vía Tarjeta</p><p className="text-2xl font-bold text-purple-300">{formatCurrency(cardSalesTotal)}</p></div>
                    <div className="bg-teal-800/50 p-3 rounded-lg"><p className="text-sm text-teal-300">Vía M. Pago</p><p className="text-2xl font-bold text-teal-300">{formatCurrency(mercadoPagoSalesTotal)}</p></div>
                     <div className="col-span-2 md:col-span-3 lg:col-span-4 grid grid-cols-2 gap-4">
                        <div className="bg-green-800/30 p-4 rounded-lg"><p className="text-sm text-green-300">(+) Otros Ingresos</p><p className="text-2xl font-bold text-green-300">{formatCurrency(miscIncome)}</p></div>
                        <div className="bg-red-800/30 p-4 rounded-lg"><p className="text-sm text-red-300">(-) Egresos</p><p className="text-2xl font-bold text-red-300">{formatCurrency(miscExpenses)}</p></div>
                    </div>
                </div>
                <div className="mt-4 bg-cyan-800/80 p-6 rounded-lg text-center"><p className="text-lg text-cyan-200">Total en Caja (Sistema)</p><p className="text-4xl font-bold text-white">{formatCurrency(expectedCashInBox)}</p></div>
                <h3 className="text-xl font-bold text-cyan-300 mt-6 mb-2">Detalle de Todos los Movimientos</h3>
                <div className="max-h-48 overflow-y-auto pr-2">{allTodayTransactions.length > 0 ? <table className="w-full text-left"><thead><tr className="border-b border-gray-600"><th className="p-2 text-sm">Hora</th><th className="p-2 text-sm">Descripción</th><th className="p-2 text-sm">Monto</th><th className="p-2 text-sm">Acciones</th></tr></thead><tbody>{allTodayTransactions.map(t => (<tr key={t.id} className="border-b border-gray-700"><td className="p-2 text-xs text-gray-400">{new Date(t.date).toLocaleTimeString()}</td><td className="p-2">{t.description}</td><td className={`p-2 font-semibold ${t.type === 'Egreso' ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(t.amount)}</td><td><button onClick={() => handleDeleteRequest(t.originalType, t.originalData)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16}/></button></td></tr>))}</tbody></table> : <div className="text-center py-6 text-gray-500"><Inbox/><p>No hay movimientos registrados hoy.</p></div>}</div>
            </div>
        </div>
    </div>
    )
}
const ReportsView = ({ sales, products }) => {
    const [period, setPeriod] = useState('week'); // 'week', 'month'

    const bestSellers = React.useMemo(() => {
        const now = new Date(); const startDate = new Date();
        if (period === 'week') startDate.setDate(now.getDate() - 7);
        else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
        const filteredSales = sales.filter(s => new Date(s.date) >= startDate); const productCounts = {};
        filteredSales.forEach(sale => { sale.items.forEach(item => { if (item.id && !item.name.toLowerCase().includes('tiempo')) { productCounts[item.id] = (productCounts[item.id] || 0) + (item.qty || 1); } }); });
        const sorted = Object.entries(productCounts).map(([id, count]) => ({ product: products.find(p => p.id === parseInt(id)), count })).filter(item => item.product).sort((a, b) => b.count - a.count);
        return sorted;
    }, [sales, products, period]);

    return (
        <div className="p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold text-white">Reportes de Ventas</h1><div className="flex gap-2 p-1 bg-gray-800 rounded-lg"><button onClick={() => setPeriod('week')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${period === 'week' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Semana</button><button onClick={() => setPeriod('month')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${period === 'month' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Mes</button></div></div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg"><h2 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2"><Award /> Productos Más Vendidos ({period === 'week' ? 'Últimos 7 días' : 'Últimos 30 días'})</h2>{bestSellers.length > 0 ? (<ul className="space-y-3">{bestSellers.map(({ product, count }, index) => (<li key={product.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg animate-fade-in-scale-fast" style={{animationDelay: `${index * 50}ms`}}><div className="flex items-center gap-4"><span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg ${index < 3 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}>{index + 1}</span><div><p className="font-bold">{product.name}</p><p className="text-sm text-gray-400">Código: {product.barcode}</p></div></div><div className="text-right"><p className="font-bold text-2xl text-green-400">{count}</p><p className="text-sm text-gray-400">unidades vendidas</p></div></li>))}</ul>) : (<div className="text-center py-10 text-gray-500"><Inbox className="w-16 h-16 mx-auto mb-2"/><p>No hay datos de ventas de productos en este período.</p></div>)}</div>
        </div>
    );
};
const ServicesView = ({ carriers, setCarriers, tramites, setTramites, addCashMovement, currentUser, handleDeleteRequest, cashMovements }) => {
    const [activeTab, setActiveTab] = useState('recargas');
    const [result, setResult] = useState(null);
    const [manageMode, setManageMode] = useState(false);
    
    // State for Recargas
    const [phone, setPhone] = useState('');
    const [currentCarrier, setCurrentCarrier] = useState(Object.keys(carriers)[0] || '');
    const [topupAmount, setTopupAmount] = useState(0);
    const [newCarrierName, setNewCarrierName] = useState('');
    const [newCarrierAmounts, setNewCarrierAmounts] = useState('');

    // State for Servicios
    const [service, setService] = useState('CFE');
    const [reference, setReference] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');

    // State for Tramites
    const [newTramiteName, setNewTramiteName] = useState('');
    const [newTramiteCost, setNewTramiteCost] = useState('');
    const [newTramiteSale, setNewTramiteSale] = useState('');

    const services = ['CFE', 'Agua', 'Telmex', 'Internet', 'Gas', 'Gobierno'];
    const currentTopupAmounts = carriers[currentCarrier] || [];

    const recentServiceTransactions = useMemo(() => {
        return cashMovements
            .filter(m => ['Recargas', 'Servicios', 'Trámites'].includes(m.category))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }, [cashMovements]);
    
    const handleAddCarrier = () => { if (!newCarrierName.trim() || !newCarrierAmounts.trim()) { alert('Nombre y montos son requeridos.'); return; } const amountsArray = newCarrierAmounts.split(',').map(a => parseFloat(a.trim())).filter(a => !isNaN(a) && a > 0); if (amountsArray.length === 0) { alert('Ingrese montos válidos separados por comas.'); return; } setCarriers(prev => ({...prev, [newCarrierName]: amountsArray })); setNewCarrierName(''); setNewCarrierAmounts(''); };
    const handleAddTramite = () => { if (!newTramiteName.trim() || !newTramiteSale) { alert('Nombre y precio de venta son requeridos.'); return; } setTramites(prev => [...prev, {id: Date.now(), name: newTramiteName, costPrice: parseFloat(newTramiteCost) || 0, salePrice: parseFloat(newTramiteSale)}]); setNewTramiteName(''); setNewTramiteCost(''); setNewTramiteSale(''); };
    const handleCarrierChange = (e) => { setCurrentCarrier(e.target.value); setTopupAmount(0); };
    
    const handleSellTramite = (tramite) => {
        addCashMovement({
            description: `Venta de trámite: ${tramite.name}`,
            amount: tramite.salePrice,
            type: 'Ingreso',
            category: 'Trámites',
            date: new Date().toISOString()
        });
        setResult({ success: true, message: `Trámite "${tramite.name}" vendido por ${formatCurrency(tramite.salePrice)}.` });
        setTimeout(() => setResult(null), 3000);
    };

    const handleTopUpSubmit = (e) => {
        e.preventDefault();
        if (!phone.trim() || phone.trim().length !== 10 || topupAmount === 0) {
            setResult({ success: false, message: "Por favor, ingrese un número de teléfono de 10 dígitos y seleccione un monto." });
            setTimeout(() => setResult(null), 4000);
            return;
        }
        
        const description = `Recarga ${currentCarrier} de ${formatCurrency(topupAmount)} a ${phone.trim()}`;
        
        addCashMovement({
            description,
            amount: topupAmount,
            type: 'Ingreso',
            category: 'Recargas',
            date: new Date().toISOString()
        });
        
        setResult({ success: true, message: `¡Recarga Exitosa! ${description}` });
        
        setPhone('');
        setTopupAmount(0);
        
        setTimeout(() => setResult(null), 4000);
    };

    const handleServicePaymentSubmit = (e) => {
        e.preventDefault();
        if (!reference.trim() || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            setResult({ success: false, message: "Por favor, ingrese una referencia y un monto válido." });
            setTimeout(() => setResult(null), 4000);
            return;
        }
        
        const amount = parseFloat(paymentAmount);
        const description = `Pago de servicio ${service} por ${formatCurrency(amount)}`;

        addCashMovement({
            description,
            amount,
            type: 'Ingreso',
            category: 'Servicios',
            date: new Date().toISOString()
        });

        setResult({ success: true, message: `¡Pago Exitoso! ${description}` });

        setReference('');
        setPaymentAmount('');
        
        setTimeout(() => setResult(null), 4000);
    };

    return (<div className="p-6 animate-fade-in"><div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold text-white">Venta de Servicios y Trámites</h1>{currentUser.role === 'Administrador' && <button onClick={() => setManageMode(!manageMode)} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${manageMode ? 'bg-red-600' : 'bg-blue-600'}`}>{manageMode ? <Ban/> : <Settings/>} {manageMode ? 'Salir de Admin' : 'Administrar'}</button>}</div>{ manageMode ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800 rounded-lg"><div><h3 className="text-xl font-bold text-cyan-300 mb-2">Administrar Compañías</h3><div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">{Object.keys(carriers).map(name => <div key={name} className="flex justify-between items-center bg-gray-700 p-2 rounded-md"><span>{name}</span><button onClick={() => handleDeleteRequest('carrier', name)} className="text-red-400"><Trash2 size={16}/></button></div>)}</div><div className="flex gap-2 p-2 border-t border-gray-600"><input value={newCarrierName} onChange={e => setNewCarrierName(e.target.value)} placeholder="Nombre" className="bg-gray-600 p-1 rounded-md w-1/3"/><input value={newCarrierAmounts} onChange={e => setNewCarrierAmounts(e.target.value)} placeholder="Montos ej: 10,20,30" className="bg-gray-600 p-1 rounded-md w-2/3"/><button onClick={handleAddCarrier} className="bg-green-500 p-2 rounded-md"><Plus/></button></div></div><div><h3 className="text-xl font-bold text-cyan-300 mb-2">Administrar Trámites</h3><div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">{tramites.map(t => <div key={t.id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md"><span>{t.name} (C: {formatCurrency(t.costPrice)} V: {formatCurrency(t.salePrice)})</span><button onClick={() => handleDeleteRequest('tramite', t)} className="text-red-400"><Trash2 size={16}/></button></div>)}</div><div className="flex gap-2 p-2 border-t border-gray-600"><input value={newTramiteName} onChange={e => setNewTramiteName(e.target.value)} placeholder="Nombre" className="bg-gray-600 p-1 rounded-md w-1/2"/><input type="number" value={newTramiteCost} onChange={e => setNewTramiteCost(e.target.value)} placeholder="Costo" className="bg-gray-600 p-1 rounded-md w-1/4"/><input type="number" value={newTramiteSale} onChange={e => setNewTramiteSale(e.target.value)} placeholder="Venta" className="bg-gray-600 p-1 rounded-md w-1/4"/><button onClick={handleAddTramite} className="bg-green-500 p-2 rounded-md"><Plus/></button></div></div></div>) : (<><div className="flex border-b border-gray-700 mb-6"><button onClick={() => setActiveTab('recargas')} className={`py-3 px-6 text-lg font-semibold transition ${activeTab === 'recargas' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Recargas</button><button onClick={() => setActiveTab('servicios')} className={`py-3 px-6 text-lg font-semibold transition ${activeTab === 'servicios' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Pago de Servicios</button><button onClick={() => setActiveTab('tramites')} className={`py-3 px-6 text-lg font-semibold transition ${activeTab === 'tramites' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Trámites</button></div><div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto"><div className="min-h-[350px]">{activeTab === 'recargas' && (<form onSubmit={handleTopUpSubmit}><h2 className="text-xl font-bold text-cyan-300 mb-4">Recarga de Saldo</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label className="block text-sm text-gray-400 mb-1">Compañía</label><select value={currentCarrier} onChange={handleCarrierChange} className="w-full bg-gray-700 p-2 rounded-md">{Object.keys(carriers).map(c => <option key={c}>{c}</option>)}</select></div><div><label className="block text-sm text-gray-400 mb-1">Teléfono</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" placeholder="10 dígitos"/></div></div><label className="block text-sm text-gray-400 mb-2">Monto</label><div className="grid grid-cols-4 lg:grid-cols-5 gap-2 mb-6">{currentTopupAmounts.map(amount => <button type="button" key={amount} onClick={() => setTopupAmount(amount)} className={`p-4 rounded-md font-bold text-lg transition ${topupAmount === amount ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{formatCurrency(amount)}</button>)}</div><button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg">Realizar Recarga</button></form>)}{activeTab === 'servicios' && (<form onSubmit={handleServicePaymentSubmit}><h2 className="text-xl font-bold text-cyan-300 mb-4">Pago de Servicios</h2><div className="space-y-4 mb-6"><div><label className="block text-sm text-gray-400 mb-1">Servicio</label><select value={service} onChange={e => setService(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md">{services.map(s => <option key={s}>{s}</option>)}</select></div><div><label className="block text-sm text-gray-400 mb-1">Referencia</label><input type="text" value={reference} onChange={e => setReference(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" /></div><div><label className="block text-sm text-gray-400 mb-1">Monto a Pagar</label><input type="number" step="0.01" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"/></div></div><button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg">Realizar Pago</button></form>)}{activeTab === 'tramites' && (<div><h2 className="text-xl font-bold text-cyan-300 mb-4">Venta de Trámites</h2><div className="space-y-2">{tramites.length > 0 ? tramites.map(t => (<div key={t.id} onClick={() => handleSellTramite(t)} className="flex justify-between items-center bg-gray-700 hover:bg-cyan-800 cursor-pointer p-4 rounded-md transition"><span className="text-lg font-semibold">{t.name}</span><span className="text-lg font-bold text-green-400">{formatCurrency(t.salePrice)}</span></div>)) : <p className="text-center text-gray-500 py-4">No hay trámites configurados.</p>}</div></div>)}</div>{result && (<div className={`mt-6 p-4 rounded-lg text-center ${result.success ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>{result.message}</div>)}<div className="mt-8 pt-6 border-t border-gray-700"><h3 className="text-lg font-bold text-cyan-300 mb-4">Últimas Operaciones de Servicios</h3><div className="space-y-2">{recentServiceTransactions.length > 0 ? (recentServiceTransactions.map(tx => (<div key={tx.id} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center text-sm"><div><p className="font-semibold">{tx.description}</p><p className="text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</p></div><span className="font-bold text-green-400">{formatCurrency(tx.amount)}</span></div>))) : (<p className="text-center text-gray-500">No hay operaciones recientes.</p>)}</div></div></div></>)}</div>);
};
const StreamingView = ({ platforms, setPlatforms, distributors, setDistributors, streamingSales, setStreamingSales, currentUser, addCashMovement, handleDeleteRequest, onRenewSale, onReportAccount, onReplenishDay, onRenewClick }) => {
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [saleToEdit, setSaleToEdit] = useState(null);
    const [manageMode, setManageMode] = useState(false);
    const [newPlatformName, setNewPlatformName] = useState('');
    const [newPlatformPrice, setNewPlatformPrice] = useState('');
    const [newDistributorName, setNewDistributorName] = useState('');

    const handleSaveSale = (saleData) => {
        const newSale = {
            ...saleData,
            id: saleData.id || Date.now(),
            reports: saleData.id ? (saleData.reports || 0) : 0,
            replenishedDays: saleData.id ? (saleData.replenishedDays || 0) : 0,
        };
        const movement = {
            description: `Venta Streaming: ${newSale.accounts.map(acc => platforms.find(p=>p.id == acc.serviceId)?.name).join(', ')} a ${newSale.clientName}`,
            amount: newSale.salePrice,
            type: 'Ingreso',
            category: 'Streaming',
            date: new Date().toISOString()
        };
        if(!saleData.id) { // Only add cash movement for new sales
             addCashMovement(movement);
        }
       
        setStreamingSales(prev => {
            const existingIndex = prev.findIndex(s => s.id === newSale.id);
            if (existingIndex > -1) {
                const updatedSales = [...prev];
                updatedSales[existingIndex] = newSale;
                return updatedSales;
            } else {
                return [...prev, newSale];
            }
        });
        setShowSaleModal(false); 
        setSaleToEdit(null);
    };

    const sendWhatsAppMessage = (sale, account) => { const serviceName = platforms.find(p => p.id == account.serviceId)?.name || "Servicio"; const today = new Date(); const expiration = new Date(sale.expirationDate + 'T23:59:59'); const diffTime = expiration - today; const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); let message = `Hola ${sale.clientName}, `; if (diffDays <= 0) message += `te informamos que tu suscripción de ${serviceName} ha vencido. Si deseas renovar, por favor contáctanos. ¡Gracias!`; else message += `te recordamos que a tu suscripción de ${serviceName} le quedan ${diffDays} día(s). Para renovar, por favor contáctanos. ¡Gracias!`; const encodedMessage = encodeURIComponent(message); window.open(`https://wa.me/${sale.clientPhone}?text=${encodedMessage}`, '_blank'); };
    const handleAddPlatform = () => { if (!newPlatformName.trim() || !newPlatformPrice) return; setPlatforms(prev => [...prev, {id: Date.now(), name: newPlatformName, price: parseFloat(newPlatformPrice)}]); setNewPlatformName(''); setNewPlatformPrice(''); };
    const handleAddDistributor = () => { if (!newDistributorName.trim()) return; setDistributors(prev => [...prev, newDistributorName]); setNewDistributorName(''); };

    const flattenedSales = useMemo(() => {
        return streamingSales.map(sale => {
            const mainAccount = sale.accounts[0] || {};
            const accountService = platforms.find(p => p.id == mainAccount.serviceId) || { name: 'N/A' };
            return {
                ...sale, // Pass all original sale properties
                saleId: sale.id, // Ensure saleId is explicitly set
                accountIdentifier: mainAccount.accountIdentifier,
                password: mainAccount.password,
                profile: mainAccount.profile,
                pin: mainAccount.pin,
                accountService,
            };
        }).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
    }, [streamingSales, platforms]);

    return (
    <div className="p-4 md:p-6 animate-fade-in">
        {showSaleModal && <StreamingSaleModal sale={saleToEdit} onSave={handleSaveSale} onCancel={() => { setShowSaleModal(false); setSaleToEdit(null); }} distributors={distributors} platforms={platforms} />}
        <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold text-white">Gestión de Streaming</h1><div className="flex gap-2">{currentUser.role === 'Administrador' && <button onClick={() => setManageMode(!manageMode)} className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition ${manageMode ? 'bg-red-500' : 'bg-blue-600'}`}>{manageMode ? <Ban size={16}/> : <Settings size={16}/>} {manageMode ? 'Salir' : 'Admin'}</button>}<button onClick={() => { setSaleToEdit(null); setShowSaleModal(true); }} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Plus/> Nueva Venta</button></div></div>
        {manageMode ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800 rounded-lg mb-6"><div><h3 className="text-xl font-bold text-cyan-300 mb-2">Plataformas y Precios</h3><div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">{platforms.map(p => <div key={p.id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md"><span>{p.name} - {formatCurrency(p.price)}</span><button onClick={() => handleDeleteRequest('platform', p)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16}/></button></div>)}</div><div className="flex gap-2 p-2 border-t border-gray-600"><input value={newPlatformName} onChange={e => setNewPlatformName(e.target.value)} placeholder="Nombre" className="bg-gray-600 p-1 rounded-md w-2/3"/><input type="number" value={newPlatformPrice} onChange={e => setNewPlatformPrice(e.target.value)} placeholder="Precio" className="bg-gray-600 p-1 rounded-md w-1/3"/><button onClick={handleAddPlatform} className="bg-green-500 p-2 rounded-md"><Plus/></button></div></div><div><h3 className="text-xl font-bold text-cyan-300 mb-2">Distribuidores</h3><div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">{distributors.map(d => <div key={d} className="flex justify-between items-center bg-gray-700 p-2 rounded-md"><span>{d}</span><button onClick={() => handleDeleteRequest('distributor', d)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16}/></button></div>)}</div><div className="flex gap-2 p-2 border-t border-gray-600"><input value={newDistributorName} onChange={e => setNewDistributorName(e.target.value)} placeholder="Nombre distribuidor" className="bg-gray-600 p-1 rounded-md flex-grow"/><button onClick={handleAddDistributor} className="bg-green-500 p-2 rounded-md"><Plus/></button></div></div></div>) : null}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto"><table className="w-full text-left text-sm whitespace-nowrap"><thead className="bg-gray-700"><tr>{['Cliente', 'Servicio', 'Cuenta', 'Contraseña', 'Perfil', 'PIN', 'Vence', 'Días', 'Acciones'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{flattenedSales.map(item => { const today = new Date(); today.setHours(0,0,0,0); const expirationParts = item.expirationDate.split('-'); const expiration = new Date(expirationParts[0], expirationParts[1] - 1, expirationParts[2]); const diffTime = expiration.getTime() - today.getTime(); let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); if (diffTime < 0 && diffDays <=0) diffDays = 0; else if (diffTime > 0 && diffDays <=0) diffDays = 1; let rowClass = 'hover:bg-gray-700/50'; if (diffDays <= 0) rowClass = 'bg-red-800/40 hover:bg-red-700/40'; else if (diffDays <= 5) rowClass = 'bg-yellow-700/40 hover:bg-yellow-600/40'; return (<tr key={item.saleId} className={`border-b border-gray-700 ${rowClass}`}><td className="p-3"><div className="font-bold">{item.clientName}</div><div className="text-xs text-gray-400">{item.clientPhone}</div></td><td className="p-3 font-semibold text-cyan-300">{item.accounts.map(acc => platforms.find(p => p.id == acc.serviceId)?.name || 'N/A').join(' + ')}</td><td className="p-3">{item.accountIdentifier}</td><td className="p-3">{item.password}</td><td className="p-3">{item.profile}</td><td className="p-3">{item.pin}</td><td className="p-3">{new Date(item.expirationDate + 'T00:00:00').toLocaleDateString()}</td><td className="p-3"><span className={`font-bold px-2 py-1 rounded-full text-xs ${diffDays <= 0 ? 'bg-red-500' : diffDays <= 5 ? 'bg-yellow-500 text-black' : 'bg-green-500'}`}>{diffDays}</span></td><td className="p-3 flex gap-2"><button onClick={() => onReportAccount(item.saleId)} className="text-yellow-400 hover:text-yellow-300 p-1 relative" title="Reportar Problema"><AlertTriangle size={18}/><span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{item.reports || 0}</span></button><button onClick={() => onReplenishDay(item.saleId)} className="text-blue-400 hover:text-blue-300 p-1 relative" title="Reponer Días"><CalendarDays size={18}/><span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{item.replenishedDays || 0}</span></button><button onClick={() => onRenewClick(item)} className="text-green-400 hover:text-green-300 p-1" title="Renovar Cuenta"><RefreshCw size={18} /></button><button onClick={() => sendWhatsAppMessage(item, item.accounts[0])} className="text-green-400 hover:text-green-300 p-1" title="Enviar WhatsApp"><Send size={18}/></button><button onClick={() => { setSaleToEdit(streamingSales.find(s => s.id === item.saleId)); setShowSaleModal(true); }} className="text-yellow-400 hover:text-yellow-300 p-1" title="Editar"><Edit size={18}/></button><button onClick={() => handleDeleteRequest('streaming_sale', item)} className="text-red-400 hover:text-red-300 p-1" title="Eliminar"><Trash2 size={18}/></button></td></tr>); })}</tbody></table>{streamingSales.length === 0 && <div className="text-center p-8 text-gray-500">No hay ventas de streaming registradas.</div>}</div>
    </div>);
};
const ModuleControlPanel = ({ module, clients, rates, setModules, setSelectedModuleId, addSale, setClients, products }) => {
    const [sessionClientId, setSessionClientId] = useState(''); const [fixedTimeInput, setFixedTimeInput] = useState(60);
    useEffect(() => { setSessionClientId(module.clientId || ''); }, [module.id, module.clientId]);
    const sessionClient = clients.find(c => c.id === parseInt(sessionClientId));
    if(!module) return null;
    const startSession = (mode, minutes = 0, isFree = false) => { setModules(p => p.map(m => m.id === module.id ? { ...m, status: 'ocupado', startTime: Date.now(), elapsedTime: 0, fixedTime: mode === 'fijo' ? minutes * 60 : 0, clientId: parseInt(sessionClientId) || null, isFree } : m)); setSessionClientId(''); };
    const redeemFreeHour = () => { if (!sessionClient || sessionClient.points < 10) return; setClients(prev => prev.map(c => c.id === sessionClient.id ? { ...c, points: c.points - 10 } : c)); startSession('fijo', 60, true); };
    const stopSession = () => { setModules(p => p.map(m => m.id === module.id ? { ...m, status: 'cobrando' } : m)); };
    const completePayment = () => {
        const timeCost = calculateTimeCost(Math.ceil(module.elapsedTime / 60), module.type, rates, module.isFree);
        let saleItems = [];
        if (timeCost > 0) saleItems.push({ name: `Tiempo ${module.type} (${module.name})`, salePrice: timeCost, costPrice: 0, qty: 1 });
        module.products.forEach(p => { const existingItem = saleItems.find(i => i.id === p.id); if (existingItem) existingItem.qty += 1; else saleItems.push({ ...p, qty: 1 }); });
        const totalCost = saleItems.reduce((sum, item) => sum + item.salePrice * item.qty, 0);
        if (totalCost > 0) { const newSale = { id: Date.now(), date: new Date().toISOString(), items: saleItems, total: totalCost, paymentMethod: 'Efectivo', clientId: module.clientId || null, }; addSale(newSale); }
        if (module.clientId && !module.isFree) { const hours = Math.floor(module.elapsedTime / 3600); if (hours > 0) setClients(prev => prev.map(c => c.id === module.clientId ? { ...c, points: c.points + hours } : c)); } 
        setModules(p => p.map(m => m.id === module.id ? { ...m, status: 'disponible', startTime: null, elapsedTime: 0, clientId: null, products: [], fixedTime: 0, isFree: false } : m)); 
        setSelectedModuleId(null); 
    };
    const handleProductSelectAndAdd = (e) => { const productId = e.target.value; if (!productId) return; const productToAdd = products.find(p => p.id === parseInt(productId)); if (productToAdd) { setModules(prev => prev.map(m => m.id === module.id ? { ...m, products: [...m.products, { ...productToAdd, instanceId: Date.now() }] } : m)); } e.target.value = ""; };
    const handleRemoveProduct = (instanceIdToRemove) => { setModules(prev => prev.map(m => m.id === module.id ? { ...m, products: m.products.filter((p) => p.instanceId !== instanceIdToRemove) } : m)); };
    const { status, name, elapsedTime, isFree, type } = module; const clientForDisplay = clients.find(c => c.id === module.clientId); const timeCost = calculateTimeCost(Math.ceil(elapsedTime / 60), type, rates, isFree); const productCost = module.products.reduce((sum, p) => sum + p.salePrice, 0); const totalCost = timeCost + productCost;
    return (<div className="p-6 bg-gray-800 rounded-lg shadow-2xl animate-fade-in h-full flex flex-col"><div className="flex justify-between items-center mb-4"><h2 className="text-3xl font-bold text-white">{name}</h2><button onClick={() => setSelectedModuleId(null)} className="p-2 rounded-full hover:bg-gray-700 transition"><X className="w-6 h-6 text-gray-400" /></button></div>{status === 'disponible' && (<div className="space-y-4"><div><label className="block text-sm font-medium text-gray-300 mb-1">Asignar Cliente (Opcional)</label><select value={sessionClientId} onChange={e => setSessionClientId(e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"><option value="">Sin cliente</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.points} pts)</option>)}</select></div>{sessionClient && sessionClient.points >= 10 && (<button onClick={redeemFreeHour} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"><Gift/>Canjear 1 Hora Gratis</button>)}<h3 className="text-xl text-cyan-300 pt-2">Iniciar Sesión</h3><button onClick={() => startSession('libre')} className="w-full text-lg bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition">Tiempo Libre</button><div className="flex items-center space-x-2"><input type="number" value={fixedTimeInput} onChange={(e) => setFixedTimeInput(parseInt(e.target.value) || 0)} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600" /><button onClick={() => startSession('fijo', fixedTimeInput)} className="w-full text-lg bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition">Tiempo Fijo (min)</button></div></div>)}{status === 'ocupado' && (<div className="h-full flex flex-col space-y-4"><div>{clientForDisplay && <div className="bg-gray-700 p-2 rounded-lg text-center"><p className="text-sm text-gray-300">Cliente: <span className="font-bold text-cyan-300">{clientForDisplay.name}</span></p></div>}<div className="text-center p-4 bg-gray-900 rounded-lg mt-4"><p className="text-gray-400 text-sm">Tiempo Transcurrido</p>{isFree && <p className="text-yellow-300 font-bold">HORA GRATIS</p>}<p className="text-5xl font-mono text-green-400">{formatTime(elapsedTime)}</p></div><div className="grid grid-cols-2 gap-4 text-center mt-4"><div className="p-2 bg-gray-900 rounded-lg"><p className="text-gray-400 text-sm">Costo Tiempo</p><p className="text-2xl font-semibold text-white">{formatCurrency(timeCost)}</p></div><div className="p-2 bg-gray-900 rounded-lg"><p className="text-gray-400 text-sm">Costo Productos</p><p className="text-2xl font-bold text-white">{formatCurrency(productCost)}</p></div></div></div><div className="flex-grow space-y-2 pt-4 border-t-2 border-gray-700 flex flex-col min-h-0"><h4 className="text-lg font-bold text-cyan-300">Consumo Adicional</h4><div className="flex-grow overflow-y-auto pr-2 space-y-2">{module.products.length > 0 ? module.products.map((p) => (<div key={p.instanceId} className="flex justify-between items-center bg-gray-900 p-2 rounded-md animate-fade-in-scale-fast"><span className="truncate">{p.name}</span><div className="flex items-center gap-2"><span className="text-green-400">{formatCurrency(p.salePrice)}</span><button onClick={() => handleRemoveProduct(p.instanceId)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16}/></button></div></div>)) : <p className="text-sm text-gray-500 text-center pt-4">Sin productos.</p>}</div><div className="pt-2"><select onChange={handleProductSelectAndAdd} defaultValue="" className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600"><option value="">-- Agregar producto... --</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.salePrice)})</option>)}</select></div></div><div className="pt-4"><div className="p-4 bg-cyan-800 rounded-lg text-center"><p className="text-cyan-200 text-lg">Total a Pagar</p><p className="text-4xl font-bold text-white">{formatCurrency(totalCost)}</p></div><button onClick={stopSession} className="w-full text-lg bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition mt-4">Finalizar y Cobrar</button></div></div>)}{status === 'cobrando' && (<div className="space-y-4 p-4 bg-yellow-900 bg-opacity-30 rounded-lg"><h3 className="text-2xl text-yellow-300 font-bold text-center">Resumen de Cobro</h3><div className="p-4 bg-gray-900 rounded-lg text-center"><p className="text-yellow-200 text-lg">TOTAL A PAGAR</p><p className="text-5xl font-bold text-white">{formatCurrency(totalCost)}</p></div><p className="text-center text-gray-300">Tiempo: {formatCurrency(timeCost)} | Productos: {formatCurrency(productCost)}</p><button onClick={completePayment} className="w-full text-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition">Confirmar Pago y Liberar</button></div>)}</div>);
};
const UserManagementView = ({ users, setUsers, handleDeleteRequest }) => {
    const [name, setName] = useState(''); const [pin, setPin] = useState(''); const [role, setRole] = useState('Cajero');
    const handleAddUser = (e) => { e.preventDefault(); if (!name.trim() || !pin.trim() || pin.length !== 4) { alert("Nombre y PIN de 4 dígitos son requeridos."); return; } const newUser = { id: Date.now(), name, pin, role }; setUsers(prev => [...prev, newUser]); setName(''); setPin(''); };
    
    return (<div className="p-6 animate-fade-in"><h2 className="text-3xl font-bold text-white mb-6">Administrar Usuarios</h2><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><form onSubmit={handleAddUser} className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"><h3 className="text-xl font-bold text-cyan-300">Nuevo Usuario</h3><div><label className="block text-sm text-gray-400 mb-1">Nombre</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required /></div><div><label className="block text-sm text-gray-400 mb-1">PIN (4 dígitos)</label><input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength="4" className="w-full bg-gray-700 p-2 rounded-md" required /></div><div><label className="block text-sm text-gray-400 mb-1">Rol</label><select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"><option value="Cajero">Cajero</option><option value="Administrador">Administrador</option></select></div><button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"><UserPlus /> Agregar Usuario</button></form><div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg"><h3 className="text-xl font-bold text-cyan-300 mb-4">Lista de Usuarios</h3><div className="max-h-96 overflow-y-auto pr-2">{users.map(user => (<div key={user.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg mb-2"><div><p className="font-bold text-white">{user.name}</p><p className="text-sm text-gray-400">{user.role}</p></div><button onClick={() => handleDeleteRequest('user', user)} disabled={user.id === 1} className="text-gray-500 hover:text-red-500 disabled:text-gray-700 disabled:cursor-not-allowed transition"><Trash2 /></button></div>))}</div></div></div></div>);
};
const LoginScreen = ({ onLogin, error }) => {
    const [pin, setPin] = useState(''); const inputRef = useRef(null);
    useEffect(() => { inputRef.current?.focus(); }, []);
    const handlePinChange = (e) => { const value = e.target.value; if (/^\d*$/.test(value) && value.length <= 4) setPin(value); };
    const handleKeyClick = (key) => { if (pin.length < 4) setPin(pin + key); };
    const handleDelete = () => { setPin(pin.slice(0, -1)); };
    const handleSubmit = (e) => { e.preventDefault(); onLogin(pin); setPin(''); };
    return (<div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center p-4" onClick={() => inputRef.current?.focus()}><h1 className="text-4xl font-bold text-white mb-2">Pc <span className="text-cyan-400">Forever</span></h1><p className="text-gray-400 mb-8">Ingrese su PIN de 4 dígitos para continuar</p><form onSubmit={handleSubmit} className="w-full max-w-xs"><div className="relative"><div className="flex justify-center items-center gap-4 mb-4">{Array(4).fill(0).map((_, i) => (<div key={i} className={`w-12 h-14 rounded-lg flex items-center justify-center text-4xl font-bold ${pin.length > i ? 'bg-cyan-400 text-gray-900' : 'bg-gray-700 text-gray-500'}`}>{pin.length > i ? '•' : ''}</div>))}</div><input ref={inputRef} type="tel" value={pin} onChange={handlePinChange} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default" autoFocus maxLength="4" /></div>{error && <p className="text-red-500 text-center mb-4">{error}</p>}<div className="grid grid-cols-3 gap-3">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button type="button" key={num} onClick={() => handleKeyClick(num.toString())} className="p-4 bg-gray-800 rounded-lg text-2xl font-bold hover:bg-cyan-500 transition-colors"> {num} </button>)}<button type="button" onClick={handleDelete} className="p-4 bg-gray-700 rounded-lg text-2xl font-bold hover:bg-yellow-500 transition-colors">DEL</button><button type="button" onClick={() => handleKeyClick('0')} className="p-4 bg-gray-800 rounded-lg text-2xl font-bold hover:bg-cyan-500 transition-colors">0</button><button type="submit" className="p-4 bg-green-600 rounded-lg text-2xl font-bold hover:bg-green-500 transition-colors">OK</button></div></form></div>);
};
const FirstTimeSetup = ({ onSetupComplete }) => {
    const [name, setName] = useState(''); const [pin, setPin] = useState(''); const [confirmPin, setConfirmPin] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (pin !== confirmPin) { alert("Los PINs no coinciden."); return; } if (pin.length !== 4) { alert("El PIN debe ser de 4 dígitos."); return; } const adminUser = { id: 1, name, pin, role: 'Administrador' }; onSetupComplete([adminUser]); };
    return (<div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center p-4 text-white"><div className="max-w-md w-full text-center"><ShieldCheck className="w-24 h-24 mx-auto text-cyan-400 mb-4" /><h1 className="text-3xl font-bold mb-2">Configuración Inicial</h1><p className="text-gray-400 mb-6">Cree la cuenta de Administrador principal. Esta cuenta no se podrá eliminar.</p><form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-8 rounded-lg"><div><label className="block text-left text-sm text-gray-400 mb-1">Nombre del Administrador</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required /></div><div><label className="block text-left text-sm text-gray-400 mb-1">Crear PIN de 4 dígitos</label><input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength="4" className="w-full bg-gray-700 p-2 rounded-md" required /></div><div><label className="block text-left text-sm text-gray-400 mb-1">Confirmar PIN</label><input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength="4" className="w-full bg-gray-700 p-2 rounded-md" required /></div><button type="submit" className="w-full bg-green-600 hover:bg-green-500 font-bold py-3 px-4 rounded-lg">Crear Cuenta de Administrador</button></form></div></div>);
};
const FinancialManagementView = ({ allocations, setAllocations, sales, cashMovements, registerStatus, dailySavings, debitCards, setDebitCards, creditCards, setCreditCards, addDebitCardTransaction, addCreditCardTransaction, handleDeleteRequest }) => {
    const [activeTab, setActiveTab] = useState('debit');
    const [showAllocationsModal, setShowAllocationsModal] = useState(false);
    const [showCardTransactionModal, setShowCardTransactionModal] = useState(false);
    const [selectedCardForTx, setSelectedCardForTx] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);

    const [newCardForm, setNewCardForm] = useState(null);

    const handleOpenTxModal = (card, type) => {
        setSelectedCardForTx({ ...card, type });
        setShowCardTransactionModal(true);
    };

    const handleSaveCardTransaction = (transactionData) => {
        if (selectedCardForTx.type === 'debit') {
            addDebitCardTransaction(transactionData);
        } else {
            addCreditCardTransaction(transactionData);
        }
        setShowCardTransactionModal(false);
    };

    const handleSaveAllocations = (newAllocations) => {
        setAllocations(newAllocations);
        setShowAllocationsModal(false);
    };

    const handleSaveNewCard = (e) => {
        e.preventDefault();
        const { type, name, bank, balance, creditLimit, cutOffDay, paymentDay } = newCardForm;
        if (type === 'debit') {
            setDebitCards(prev => [...prev, { id: Date.now(), name, bank, balance: parseFloat(balance) || 0, transactions: [] }]);
        } else {
            setCreditCards(prev => [...prev, { id: Date.now(), name, bank, creditLimit: parseFloat(creditLimit) || 0, balance: 0, cutOffDay: parseInt(cutOffDay), paymentDay: parseInt(paymentDay), transactions: [] }]);
        }
        setNewCardForm(null);
    };

    const getDaysUntil = (dayOfMonth) => {
        if (!dayOfMonth) return { days: 'N/A', color: 'text-gray-400' };
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        let targetDate = new Date(currentYear, currentMonth, dayOfMonth);
        if (today.getDate() > dayOfMonth) {
            targetDate.setMonth(currentMonth + 1);
        }
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) return { days: diffDays, color: 'text-red-400' };
        if (diffDays <= 7) return { days: diffDays, color: 'text-yellow-400' };
        return { days: diffDays, color: 'text-green-400' };
    };

    const TabButton = ({ view, children }) => (
        <button onClick={() => setActiveTab(view)} className={`py-2 px-4 text-lg font-semibold transition ${activeTab === view ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>{children}</button>
    );

    const { grossProfit } = calculateDailyTotals(sales, cashMovements, registerStatus.date);
    const profitToDistribute = Math.max(0, grossProfit - dailySavings);
    
    return (
    <div className="p-6 animate-fade-in">
        {showAllocationsModal && <ManageAllocationsModal initialAllocations={allocations} onSave={handleSaveAllocations} onCancel={() => setShowAllocationsModal(false)} debitCards={debitCards} creditCards={creditCards} />}
        {showCardTransactionModal && <CardTransactionModal onSave={handleSaveCardTransaction} onCancel={() => setShowCardTransactionModal(false)} card={selectedCardForTx} type={selectedCardForTx.type} />}

        <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold text-white">Gestión Financiera</h1></div>
        <div className="flex border-b border-gray-700 mb-6">
            <TabButton view="debit"><Banknote className="inline-block mr-2"/>Débito</TabButton>
            <TabButton view="credit"><CreditCard className="inline-block mr-2"/>Crédito</TabButton>
            <TabButton view="allocations"><PiggyBank className="inline-block mr-2"/>Apartados</TabButton>
        </div>

        {activeTab === 'debit' && (
            <div>
                <button onClick={() => setNewCardForm({type: 'debit'})} className="mb-4 bg-green-600 hover:bg-green-500 py-2 px-4 rounded-lg flex items-center gap-2"><Plus/>Agregar Tarjeta de Débito</button>
                <div className="space-y-4">
                {debitCards.map(card => (
                    <div key={card.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">{card.name} <span className="text-sm font-normal text-gray-400">({card.bank})</span></h3>
                                <p className="text-2xl font-semibold text-green-400">{formatCurrency(card.balance)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenTxModal(card, 'debit')} className="bg-blue-600 p-2 rounded-lg"><Plus/>Transacción</button>
                                <button onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)} className="bg-gray-600 p-2 rounded-lg">{expandedCard === card.id ? <ArrowUp/> : <ArrowDown/>}</button>
                            </div>
                        </div>
                        {expandedCard === card.id && <div className="mt-4 border-t border-gray-700 pt-4 max-h-60 overflow-y-auto">
                            {card.transactions.length > 0 ? [...card.transactions].reverse().map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-2 border-b border-gray-700/50">
                                    <div>
                                        <p>{tx.description}</p>
                                        <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                                    </div>
                                    <p className={`font-semibold ${tx.type === 'Depósito' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'Depósito' ? '+' : '-'} {formatCurrency(tx.amount)}</p>
                                </div>
                            )) : <p className="text-center text-gray-500">Sin transacciones.</p>}
                        </div>}
                    </div>
                ))}
                </div>
            </div>
        )}

        {activeTab === 'credit' && (
             <div>
                <button onClick={() => setNewCardForm({type: 'credit'})} className="mb-4 bg-green-600 hover:bg-green-500 py-2 px-4 rounded-lg flex items-center gap-2"><Plus/>Agregar Tarjeta de Crédito</button>
                <div className="space-y-4">
                {creditCards.map(card => {
                    const availableCredit = card.creditLimit - card.balance;
                    const daysToPay = getDaysUntil(card.paymentDay);
                    return (
                    <div key={card.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                            <div><h3 className="text-xl font-bold">{card.name}</h3><p className="text-sm text-gray-400">{card.bank}</p></div>
                            <div className="text-center"><p className="text-xs text-gray-400">Saldo Actual</p><p className="text-lg font-bold text-yellow-400">{formatCurrency(card.balance)}</p></div>
                            <div className="text-center"><p className="text-xs text-gray-400">Crédito Disponible</p><p className="text-lg font-bold text-green-400">{formatCurrency(availableCredit)}</p></div>
                             <div className="flex gap-2 justify-end">
                                <button onClick={() => handleOpenTxModal(card, 'credit')} className="bg-blue-600 p-2 rounded-lg"><Plus/>Transacción</button>
                                <button onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)} className="bg-gray-600 p-2 rounded-lg">{expandedCard === card.id ? <ArrowUp/> : <ArrowDown/>}</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center mt-3 border-t border-gray-700 pt-3">
                            <div><p className="text-xs text-gray-400">Límite de Crédito</p><p className="font-semibold">{formatCurrency(card.creditLimit)}</p></div>
                            <div><p className="text-xs text-gray-400">Día de Corte</p><p className="font-semibold">{card.cutOffDay}</p></div>
                            <div><p className="text-xs text-gray-400">Pagar en</p><p className={`font-bold text-lg ${daysToPay.color}`}>{daysToPay.days} días</p></div>
                        </div>
                         {expandedCard === card.id && <div className="mt-4 border-t border-gray-700 pt-4 max-h-60 overflow-y-auto">
                            {card.transactions.length > 0 ? [...card.transactions].reverse().map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-2 border-b border-gray-700/50">
                                    <div><p>{tx.description}</p><p className="text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</p></div>
                                    <p className={`font-semibold ${tx.type === 'Compra' ? 'text-yellow-400' : 'text-green-400'}`}>{tx.type === 'Compra' ? '+' : '-'} {formatCurrency(tx.amount)}</p>
                                </div>
                            )) : <p className="text-center text-gray-500">Sin transacciones.</p>}
                        </div>}
                    </div>
                )})}
                </div>
            </div>
        )}

        {activeTab === 'allocations' && (
            <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-cyan-300">Proyección y Apartados</h2><button onClick={() => setShowAllocationsModal(true)} className="bg-blue-600 hover:bg-blue-500 py-2 px-3 rounded-lg flex items-center gap-2"><Settings size={16}/> Administrar</button></div>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="bg-gray-700 p-4 rounded-lg text-center"><p>Ganancia Bruta Hoy</p><p className="text-2xl font-bold">{formatCurrency(grossProfit)}</p></div>
                     <div className="bg-gray-700 p-4 rounded-lg text-center"><p>Ganancia a Repartir Hoy</p><p className="text-2xl font-bold text-green-400">{formatCurrency(profitToDistribute)}</p></div>
                 </div>
                <table className="w-full text-left">
                    <thead><tr className="border-b border-gray-600"><th className="p-2">Apartado</th><th className="p-2 text-center">%</th><th className="p-2 text-right">Proyectado Hoy</th><th className="p-2">Cuenta Destino</th><th className="p-2 text-right">Saldo Acumulado</th></tr></thead>
                    <tbody>{allocations.map(a => { 
                        let linkedCard = null;
                        let cardText = <span className="text-yellow-500">Sin asignar</span>;
                        if (a.destinationCardId) {
                            const [type, idStr] = a.destinationCardId.split('-');
                            const id = parseInt(idStr);
                            if (type === 'debit') {
                                linkedCard = debitCards.find(c => c.id === id);
                            } else {
                                linkedCard = creditCards.find(c => c.id === id);
                            }
                            if (linkedCard) {
                                cardText = `${linkedCard.name} (${linkedCard.bank})`;
                            }
                        }
                        return (<tr key={a.id} className="border-b border-gray-700"><td className="p-2 font-bold">{a.name}</td><td className="p-2 text-center">{a.percentage}%</td><td className="p-2 text-right text-green-300">{formatCurrency(profitToDistribute * (a.percentage / 100))}</td><td className="p-2 text-cyan-400">{cardText}</td><td className="p-2 text-right font-semibold">{formatCurrency(a.balance)}</td></tr>)
                    })}</tbody>
                </table>
            </div>
        )}
        
        {newCardForm && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
                <form onSubmit={handleSaveNewCard} className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md space-y-4">
                    <h3 className="text-2xl font-bold text-cyan-300">Nueva Tarjeta de {newCardForm.type === 'debit' ? 'Débito' : 'Crédito'}</h3>
                    <input required className="w-full bg-gray-700 p-2 rounded-md" type="text" placeholder="Alias de la tarjeta (ej: Personal, Negocio)" onChange={e => setNewCardForm({...newCardForm, name: e.target.value})} />
                    <input required className="w-full bg-gray-700 p-2 rounded-md" type="text" placeholder="Nombre del Banco" onChange={e => setNewCardForm({...newCardForm, bank: e.target.value})} />
                    {newCardForm.type === 'debit' && <input required className="w-full bg-gray-700 p-2 rounded-md" type="number" step="0.01" placeholder="Saldo Inicial" onChange={e => setNewCardForm({...newCardForm, balance: e.target.value})} />}
                    {newCardForm.type === 'credit' && <>
                        <input required className="w-full bg-gray-700 p-2 rounded-md" type="number" step="0.01" placeholder="Límite de Crédito" onChange={e => setNewCardForm({...newCardForm, creditLimit: e.target.value})} />
                        <div className="flex gap-4">
                            <input required className="w-full bg-gray-700 p-2 rounded-md" type="number" placeholder="Día de Corte" min="1" max="31" onChange={e => setNewCardForm({...newCardForm, cutOffDay: e.target.value})} />
                            <input required className="w-full bg-gray-700 p-2 rounded-md" type="number" placeholder="Día de Pago" min="1" max="31" onChange={e => setNewCardForm({...newCardForm, paymentDay: e.target.value})} />
                        </div>
                    </>}
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={() => setNewCardForm(null)} className="py-2 px-4 bg-gray-600 rounded-lg">Cancelar</button><button type="submit" className="py-2 px-4 bg-green-600 rounded-lg">Guardar</button></div>
                </form>
            </div>
        )}
    </div>);
};


// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [modules, setModules] = useStickyState(initialModules, 'cyberManagerModules');
  const [rates, setRates] = useStickyState(initialRates, 'cyberManagerRates');
  const [clients, setClients] = useStickyState(initialClients, 'cyberManagerClients');
  const [products, setProducts] = useStickyState(initialProducts, 'cyberManagerProducts');
  const [productCategories, setProductCategories] = useStickyState(initialProductCategories, 'cyberManagerProductCategories');
  const [sales, setSales] = useStickyState(initialSales, 'cyberManagerSales');
  const [cashMovements, setCashMovements] = useStickyState(initialCashMovements, 'cyberManagerCashMovements');
  const [registerStatus, setRegisterStatus] = useStickyState(initialRegisterStatus, 'cyberManagerRegisterStatus');
  const [users, setUsers] = useStickyState(initialUsers, 'cyberManagerUsers');
  const [allocations, setAllocations] = useStickyState(initialAllocations, 'cyberManagerAllocations');
  const [dailySavings, setDailySavings] = useStickyState(0, 'cyberManagerDailySavings');
  const [lastDistributionDate, setLastDistributionDate] = useStickyState(null, 'cyberManagerLastDistDate');
  const [distributionHistory, setDistributionHistory] = useStickyState(initialDistributionHistory, 'cyberManagerDistHistory');
  const [debitCards, setDebitCards] = useStickyState(initialDebitCards, 'cyberManagerDebitCards');
  const [creditCards, setCreditCards] = useStickyState(initialCreditCards, 'cyberManagerCreditCards');
  const [streamingPlatforms, setStreamingPlatforms] = useStickyState(initialStreamingPlatforms, 'cyberManagerStreamingPlatforms');
  const [carriers, setCarriers] = useStickyState(initialCarriers, 'cyberManagerCarriers');
  const [tramites, setTramites] = useStickyState(initialTramites, 'cyberManagerTramites');
  const [distributors, setDistributors] = useStickyState(initialDistributors, 'cyberManagerDistributors');
  const [streamingSales, setStreamingSales] = useStickyState(initialStreamingSales, 'cyberManagerStreamingSales');
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [saleToRenew, setSaleToRenew] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Función para cargar un script y devolver una promesa
    const loadScript = (id, src) => {
        return new Promise((resolve, reject) => {
            if (document.getElementById(id)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.id = id;
            script.src = src;
            script.async = false; // Cargar en orden
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Error al cargar el script: ${src}`));
            document.body.appendChild(script);
        });
    };

    // Carga los scripts en secuencia para evitar errores de dependencia
    loadScript('jspdf', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
        .then(() => loadScript('jspdf-autotable', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js'))
        .then(() => loadScript('xlsx', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'))
        .then(() => {
            setScriptsLoaded(true);
        })
        .catch(error => {
            console.error(error);
            alert("Error al cargar las librerías necesarias para exportar. Por favor, recargue la página.");
        });
  }, []);

  useEffect(() => { const timer = setInterval(() => setModules(p => p.map(m => m.status === 'ocupado' ? { ...m, elapsedTime: m.elapsedTime + 1 } : m)), 1000); return () => clearInterval(timer); }, [setModules]);
  
    const generateSpecificBackup = () => {
        if (!scriptsLoaded || !window.XLSX) {
            alert("Las librerías de exportación no han cargado. Por favor, espere e intente de nuevo.");
            return;
        }
        try {
            const wb = window.XLSX.utils.book_new();

            const flattenedStreamingSales = streamingSales.flatMap(sale => 
                sale.accounts.map(account => ({
                    ID_Venta: sale.id,
                    Nombre_Cliente: sale.clientName,
                    Telefono_Cliente: sale.clientPhone,
                    Distribuidor: sale.distributor,
                    Fecha_Vencimiento: sale.expirationDate,
                    Reportes: sale.reports,
                    Dias_Repuestos: sale.replenishedDays,
                    Es_Combo: sale.isCombo,
                    Precio_Venta: sale.salePrice,
                    ID_Servicio: account.serviceId,
                    Cuenta: account.accountIdentifier,
                    Contrasena: account.password,
                    Perfil: account.profile,
                    PIN: account.pin
                }))
            );

            const clientsWs = window.XLSX.utils.json_to_sheet(clients);
            const productsWs = window.XLSX.utils.json_to_sheet(products);
            const streamingSalesWs = window.XLSX.utils.json_to_sheet(flattenedStreamingSales);
            const platformsWs = window.XLSX.utils.json_to_sheet(streamingPlatforms);
            const distributorsWs = window.XLSX.utils.json_to_sheet(distributors.map(d => ({ distribuidor: d })));
            
            window.XLSX.utils.book_append_sheet(wb, clientsWs, "Clientes");
            window.XLSX.utils.book_append_sheet(wb, productsWs, "Productos");
            window.XLSX.utils.book_append_sheet(wb, streamingSalesWs, "Ventas_Streaming");
            window.XLSX.utils.book_append_sheet(wb, platformsWs, "Plataformas_Streaming");
            window.XLSX.utils.book_append_sheet(wb, distributorsWs, "Distribuidores");

            const dateStr = new Date().toLocaleString('sv').replace(/ /g, '_').replace(/:/g, '-');
            window.XLSX.writeFile(wb, `Respaldo_Parcial_PcForever_${dateStr}.xlsx`);
            alert("Respaldo parcial en formato Excel generado exitosamente.");
        } catch (e) {
            console.error("Error al generar respaldo Excel:", e);
            alert("Ocurrió un error al generar el respaldo. Revise la consola.");
        }
    };

    const handleRestoreBackup = (event) => {
        const file = event.target.files[0];
        if (!file || !window.XLSX) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const wb = window.XLSX.read(data, { type: 'array' });

                const clientsData = wb.Sheets['Clientes'] ? window.XLSX.utils.sheet_to_json(wb.Sheets['Clientes']) : null;
                const productsData = wb.Sheets['Productos'] ? window.XLSX.utils.sheet_to_json(wb.Sheets['Productos']) : null;
                const platformsData = wb.Sheets['Plataformas_Streaming'] ? window.XLSX.utils.sheet_to_json(wb.Sheets['Plataformas_Streaming']) : null;
                const distributorsData = wb.Sheets['Distribuidores'] ? window.XLSX.utils.sheet_to_json(wb.Sheets['Distribuidores']).map(d => d.distribuidor) : null;
                const flattenedSalesData = wb.Sheets['Ventas_Streaming'] ? window.XLSX.utils.sheet_to_json(wb.Sheets['Ventas_Streaming']) : null;
                
                let rehydratedStreamingSales = null;
                if (flattenedSalesData) {
                    const salesMap = {};
                    flattenedSalesData.forEach(row => {
                        const saleId = row.ID_Venta;
                        if (!salesMap[saleId]) {
                            salesMap[saleId] = {
                                id: saleId, clientName: row.Nombre_Cliente, clientPhone: row.Telefono_Cliente,
                                distributor: row.Distribuidor, expirationDate: row.Fecha_Vencimiento, reports: row.Reportes,
                                replenishedDays: row.Dias_Repuestos, isCombo: row.Es_Combo, salePrice: row.Precio_Venta,
                                accounts: []
                            };
                        }
                        salesMap[saleId].accounts.push({
                            serviceId: row.ID_Servicio, accountIdentifier: row.Cuenta, password: row.Contrasena,
                            profile: row.Perfil, pin: row.PIN,
                        });
                    });
                    rehydratedStreamingSales = Object.values(salesMap);
                }
                
                if (window.confirm("¿Está seguro de restaurar desde este archivo Excel? Los datos actuales de clientes, productos y streaming serán sobreescritos.")) {
                    if (clientsData) setClients(clientsData);
                    if (productsData) setProducts(productsData);
                    if (rehydratedStreamingSales) setStreamingSales(rehydratedStreamingSales);
                    if (platformsData) setStreamingPlatforms(platformsData);
                    if (distributorsData) setDistributors(distributorsData);
                    alert("¡Restauración desde Excel completada exitosamente!");
                }

            } catch (error) {
                console.error("Error al restaurar desde archivo Excel:", error);
                alert("Error al leer o procesar el archivo Excel. Asegúrese de que el formato es correcto.");
            } finally {
                event.target.value = null;
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const addDebitCardTransaction = ({ cardId, transaction }) => {
        setDebitCards(prev => prev.map(card => {
            if (card.id === cardId) {
                const newBalance = transaction.type === 'Depósito' ? card.balance + transaction.amount : card.balance - transaction.amount;
                return { ...card, balance: newBalance, transactions: [...card.transactions, transaction] };
            }
            return card;
        }));
    };
    
    const addCreditCardTransaction = ({ cardId, transaction }) => {
        setCreditCards(prev => prev.map(card => {
            if (card.id === cardId) {
                const newBalance = transaction.type === 'Compra' ? card.balance + transaction.amount : card.balance - transaction.amount;
                return { ...card, balance: newBalance, transactions: [...card.transactions, transaction] };
            }
            return card;
        }));
    };

  const handleLogin = (pin) => { const user = users.find(u => u.pin === pin); if (user) { setCurrentUser(user); setLoginError(''); } else { setLoginError('PIN Incorrecto. Intente de nuevo.'); } };
  const handleLogout = () => { generateSpecificBackup(); setCurrentUser(null); };
  const handleSetupComplete = (adminUser) => { setUsers(adminUser); };
  const addSale = (saleData) => { setSales(prev => [...prev, saleData]); };
  const addCashMovement = (movementData) => { setCashMovements(prev => [...prev, { id: Date.now(), ...movementData }]); };
  
  const handleRenewSale = (saleId, newExpirationDate, price) => {
        const renewedSale = streamingSales.find(s => s.id === saleId);
        if (renewedSale) {
            addCashMovement({
                description: `Renovación Streaming: ${renewedSale.accounts.map(acc => streamingPlatforms.find(p=>p.id == acc.serviceId)?.name).join(', ')} a ${renewedSale.clientName}`,
                amount: price, type: 'Ingreso', category: 'Streaming', date: new Date().toISOString()
            });
            setStreamingSales(prevSales => prevSales.map(sale =>
                sale.id === saleId ? { ...sale, expirationDate: newExpirationDate, reports: 0, replenishedDays: 0, } : sale
            ));
            alert('¡Suscripción renovada exitosamente!');
        }
        setSaleToRenew(null);
    };

    const handleReportAccount = (saleId) => {
        setStreamingSales(prevSales => prevSales.map(sale => 
            sale.id === saleId ? { ...sale, reports: (sale.reports || 0) + 1 } : sale
        ));
    };

    const handleReplenishDay = (saleId) => {
        setStreamingSales(prevSales => prevSales.map(sale =>
            sale.id === saleId ? { ...sale, replenishedDays: (sale.replenishedDays || 0) + 1 } : sale
        ));
    };

  const handleDeleteRequest = (type, data) => { setItemToDelete({ type, data }); setShowDeleteConfirmModal(true); };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    const { type, data } = itemToDelete;

    switch (type) {
        case 'module': setModules(p => p.filter(m => m.id !== data.id)); if (selectedModuleId === data.id) setSelectedModuleId(null); break;
        case 'client': setClients(p => p.filter(c => c.id !== data.id)); break;
        case 'product': setProducts(p => p.filter(p => p.id !== data.id)); break;
        case 'user': if (data.id === 1) { alert("No se puede eliminar al administrador principal."); } else { setUsers(p => p.filter(u => u.id !== data.id)); } break;
        case 'streaming_sale': setStreamingSales(prev => prev.filter(s => s.id !== data.saleId)); break;
        case 'platform': setStreamingPlatforms(prev => prev.filter(p => p.id !== data.id)); break;
        case 'distributor': setDistributors(prev => prev.filter(d => d !== data)); break;
        case 'carrier': const newCarriers = {...carriers}; delete newCarriers[data]; setCarriers(newCarriers); break;
        case 'tramite': setTramites(prev => prev.filter(t => t.id !== data.id)); break;
        case 'cash_movement': setCashMovements(prev => prev.filter(m => m.id !== data.id)); break;
        case 'sale': setSales(prev => prev.filter(s => s.id !== data.id)); break;
        default: console.warn(`Unknown delete type: ${type}`);
    }

    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
};

  const getDeleteMessage = () => {
      if (!itemToDelete) return '';
      const { type, data } = itemToDelete;
      let name = data.name || data.description || data;
      if (typeof name === 'object') {
          name = data.clientName || `Venta ID ${data.saleId || data.id}`;
      }
      return `¿Está seguro de que desea eliminar "${name}"? Esta acción no se puede deshacer.`;
  };

  const handleOpenRegister = (initialAmount) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    setRegisterStatus({ isOpen: true, initialCash: initialAmount, date: todayStr });
  };
  
  if (users.length === 0) { return <FirstTimeSetup onSetupComplete={handleSetupComplete} />; }
  if (!currentUser) { return <LoginScreen onLogin={handleLogin} error={loginError} />; }
  
  const todayStr = new Date().toISOString().substring(0, 10);
  if (!registerStatus.isOpen || registerStatus.date !== todayStr) {
      return (
          <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <div className="absolute top-4 right-4">
                  <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                      <LogOut size={18}/> Salir
                  </button>
              </div>
              <OpenRegisterModal 
                  onOpen={handleOpenRegister} 
                  onCancel={() => {}} // No cancel option in this context
                  isMandatory={true}
              />
          </div>
      );
  }

  const navLinks = [
    { name: 'Dashboard', view: 'dashboard', icon: Monitor, roles: ['Administrador', 'Cajero'] },
    { name: 'TPV', view: 'pos', icon: ShoppingCart, roles: ['Administrador', 'Cajero'] },
    { name: 'Clientes', view: 'clients', icon: Users, roles: ['Administrador', 'Cajero'] },
    { name: 'Servicios', view: 'services', icon: Smartphone, roles: ['Administrador', 'Cajero'] },
    { name: 'Streaming', view: 'streaming', icon: Film, roles: ['Administrador', 'Cajero'] },
    { name: 'Finanzas', view: 'financials', icon: PiggyBank, roles: ['Administrador'] },
    { name: 'Productos', view: 'products', icon: ListOrdered, roles: ['Administrador'] },
    { name: 'Reportes', view: 'reports', icon: FileText, roles: ['Administrador'] },
    { name: 'Corte de Caja', view: 'cash', icon: DollarSign, roles: ['Administrador', 'Cajero'] },
    { name: 'Tarifas', view: 'rates', icon: Settings, roles: ['Administrador'] },
    { name: 'Usuarios', view: 'users', icon: UserPlus, roles: ['Administrador'] },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <style>{` @keyframes fade-in-scale { 0% { opacity: 0; transform: scale(.95); } 100% { opacity: 1; transform: scale(1); } } .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; } `}</style>
      <input type="file" ref={fileInputRef} onChange={handleRestoreBackup} className="hidden" accept=".xlsx, .xls"/>
      {showAddModuleModal && <AddModuleModal onSave={(name, type) => { setModules(p => { const newId = p.length > 0 ? Math.max(...p.map(m => m.id)) + 1 : 1; return [...p, { id: newId, name, type, status: 'disponible', startTime: null, elapsedTime: 0, clientId: null, products: [], fixedTime: 0, isFree: false }]; }); setShowAddModuleModal(false); }} onCancel={() => setShowAddModuleModal(false)} />}
      {showDeleteConfirmModal && <ConfirmDeleteModal title={`Confirmar Eliminación`} message={getDeleteMessage()} onConfirm={confirmDeleteItem} onCancel={() => { setShowDeleteConfirmModal(false); setItemToDelete(null); }} />}
      {saleToRenew && <RenewStreamingModal sale={saleToRenew} platforms={streamingPlatforms} onCancel={() => setSaleToRenew(null)} onConfirm={handleRenewSale} />}
      <header className="bg-gray-800 shadow-lg p-4 flex justify-between items-center"><h1 className="text-2xl font-bold text-white">Pc <span className="text-cyan-400">Forever</span></h1><nav className="flex items-center space-x-1 flex-wrap justify-center">{navLinks.filter(link => link.roles.includes(currentUser.role)).map(link => (<button key={link.view} onClick={() => setCurrentView(link.view)} className={`px-3 py-2 text-sm rounded-md transition flex items-center gap-1 ${currentView === link.view ? 'bg-cyan-500' : 'hover:bg-gray-700'}`}><link.icon className="w-4 h-4" />{link.name}</button>))}</nav><div className="flex items-center gap-2"><button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="p-2 rounded-full hover:bg-green-500/20 text-green-400 transition" title="Restaurar Respaldo Excel"><Upload size={20}/></button><button onClick={generateSpecificBackup} disabled={!scriptsLoaded} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 transition" title={scriptsLoaded ? "Descargar Respaldo Excel" : "Cargando..."}><Download size={20}/></button><span className="text-sm text-gray-300">Usuario: <span className="font-bold">{currentUser.name}</span></span><button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition"><LogOut size={20}/></button></div></header>
      <main className="flex flex-col lg:flex-row h-[calc(100vh-68px)]"><div className={`w-full h-full overflow-y-auto transition-all duration-300 ${selectedModuleId && currentView === 'dashboard' ? 'lg:w-2/3' : 'lg:w-full'}`}>
        {currentView === 'dashboard' && <DashboardView modules={modules} clients={clients} rates={rates} handleModuleClick={setSelectedModuleId} setShowAddModuleModal={setShowAddModuleModal} selectedModuleId={selectedModuleId} />}
        {currentView === 'clients' && <ClientsView clients={clients} setClients={setClients} handleDeleteRequest={handleDeleteRequest} />}
        {currentView === 'products' && currentUser.role === 'Administrador' && <ProductsView products={products} setProducts={setProducts} handleDeleteRequest={handleDeleteRequest} productCategories={productCategories} setProductCategories={setProductCategories} />}
        {currentView === 'pos' && <PointOfSaleView products={products} clients={clients} addSale={addSale} scriptsLoaded={scriptsLoaded} />}
        {currentView === 'reports' && currentUser.role === 'Administrador' && <ReportsView sales={sales} products={products} />}
        {currentView === 'services' && <ServicesView key={cashMovements.length} carriers={carriers} setCarriers={setCarriers} tramites={tramites} setTramites={setTramites} addCashMovement={addCashMovement} currentUser={currentUser} handleDeleteRequest={handleDeleteRequest} cashMovements={cashMovements} />}
        {currentView === 'streaming' && <StreamingView platforms={streamingPlatforms} setPlatforms={setStreamingPlatforms} distributors={distributors} setDistributors={setDistributors} streamingSales={streamingSales} setStreamingSales={setStreamingSales} addCashMovement={addCashMovement} currentUser={currentUser} handleDeleteRequest={handleDeleteRequest} onRenewSale={handleRenewSale} onReportAccount={handleReportAccount} onReplenishDay={handleReplenishDay} onRenewClick={setSaleToRenew} />}
        {currentView === 'cash' && (<CashBalanceView sales={sales} setSales={setSales} cashMovements={cashMovements} addCashMovement={addCashMovement} setCashMovements={setCashMovements} registerStatus={registerStatus} setRegisterStatus={setRegisterStatus} currentUser={currentUser} allocations={allocations} setAllocations={setAllocations} dailySavings={dailySavings} lastDistributionDate={lastDistributionDate} setLastDistributionDate={setLastDistributionDate} distributionHistory={distributionHistory} setDistributionHistory={setDistributionHistory} clients={clients} scriptsLoaded={scriptsLoaded} handleDeleteRequest={handleDeleteRequest} addDebitCardTransaction={addDebitCardTransaction} addCreditCardTransaction={addCreditCardTransaction} creditCards={creditCards} />)}
        {currentView === 'financials' && currentUser.role === 'Administrador' && <FinancialManagementView allocations={allocations} setAllocations={setAllocations} sales={sales} cashMovements={cashMovements} registerStatus={registerStatus} dailySavings={dailySavings} debitCards={debitCards} setDebitCards={setDebitCards} creditCards={creditCards} setCreditCards={setCreditCards} addDebitCardTransaction={addDebitCardTransaction} addCreditCardTransaction={addCreditCardTransaction}/>}
        {currentView === 'rates' && currentUser.role === 'Administrador' && <RatesView rates={rates} setRates={setRates} setCurrentView={setCurrentView}/>}
        {currentView === 'users' && currentUser.role === 'Administrador' && <UserManagementView users={users} setUsers={setUsers} handleDeleteRequest={handleDeleteRequest} />}
      </div>{selectedModuleId && currentView === 'dashboard' && (<aside className="w-full lg:w-1/3 p-4 bg-gray-800 border-l-2 border-gray-700 overflow-y-auto"><ModuleControlPanel module={modules.find(m => m.id === selectedModuleId)} clients={clients} rates={rates} setModules={setModules} setSelectedModuleId={setSelectedModuleId} addSale={addSale} setClients={setClients} products={products} /></aside>)}</main>
    </div>
  );
}
