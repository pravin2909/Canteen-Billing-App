'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';

const ORDER_STATUSES = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];
const EMPTY_ITEM = { name: '', description: '', price: '', category: 'Starters', image_path: '', stock_quantity: '' };

export default function AdminPage() {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [authState, setAuthState] = useState('checking'); // checking | ok | denied
    const [tab, setTab] = useState('menu');
    const [menu, setMenu] = useState([]);
    const [orders, setOrders] = useState([]);
    const [form, setForm] = useState(EMPTY_ITEM);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');

    // --- Verify the user is an admin on mount ---
    useEffect(() => {
        const t = localStorage.getItem('token');
        if (!t) { setAuthState('denied'); return; }
        setToken(t);
        api('/api/auth/profile', { token: t })
            .then((u) => {
                setUser(u);
                setAuthState(u.role === 'admin' ? 'ok' : 'denied');
            })
            .catch(() => setAuthState('denied'));
    }, []);

    const loadMenu = useCallback(async () => {
        try { setMenu(await api('/api/menu')); } catch (e) { setMessage(e.message); }
    }, []);
    const loadOrders = useCallback(async () => {
        try { setOrders(await api('/api/admin/orders', { token })); } catch (e) { setMessage(e.message); }
    }, [token]);

    useEffect(() => {
        if (authState !== 'ok') return;
        loadMenu();
        loadOrders();
    }, [authState, loadMenu, loadOrders]);

    const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 2500); };

    const submitItem = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            price: Number(form.price),
            stock_quantity: Number(form.stock_quantity),
        };
        try {
            if (editingId) {
                await api(`/api/admin/menu/${editingId}`, { method: 'PUT', token, body: payload });
                flash('Item updated.');
            } else {
                await api('/api/admin/menu', { method: 'POST', token, body: payload });
                flash('Item added.');
            }
            setForm(EMPTY_ITEM);
            setEditingId(null);
            loadMenu();
        } catch (err) { flash(err.message); }
    };

    const editItem = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name, description: item.description || '', price: item.price,
            category: item.category, image_path: item.image_path || '', stock_quantity: item.stock_quantity,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteItem = async (id) => {
        if (!confirm('Delete this menu item?')) return;
        try { await api(`/api/admin/menu/${id}`, { method: 'DELETE', token }); loadMenu(); flash('Item deleted.'); }
        catch (err) { flash(err.message); }
    };

    const toggleAvailable = async (item) => {
        try { await api(`/api/admin/menu/${item.id}`, { method: 'PUT', token, body: { is_available: !item.is_available } }); loadMenu(); }
        catch (err) { flash(err.message); }
    };

    const setOrderStatus = async (orderId, status) => {
        try { await api(`/api/admin/orders/${orderId}/status`, { method: 'PATCH', token, body: { status } }); loadOrders(); }
        catch (err) { flash(err.message); }
    };

    if (authState === 'checking') return <div className="min-h-screen flex items-center justify-center text-slate-500">Checking access…</div>;
    if (authState === 'denied') return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
            <h1 className="text-3xl font-extrabold text-slate-800">Admin access required</h1>
            <p className="text-slate-500">Sign in with an admin account to manage the canteen.</p>
            <a href="/" className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700">Back to app</a>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <header className="bg-white border-b sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <a href="/" className="text-2xl font-bold text-red-600">Canteen Wala</a>
                        <span className="text-sm text-slate-400">Admin</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <button onClick={() => setTab('menu')} className={`px-4 py-2 rounded-lg font-semibold ${tab === 'menu' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Menu</button>
                        <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-lg font-semibold ${tab === 'orders' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Orders</button>
                    </div>
                </div>
            </header>

            {message && <div className="container mx-auto px-6 pt-4"><div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm">{message}</div></div>}

            <main className="container mx-auto px-6 py-8">
                {tab === 'menu' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Add / edit form */}
                        <form onSubmit={submitItem} className="bg-white p-6 rounded-xl shadow border h-fit lg:sticky lg:top-24">
                            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit item' : 'Add item'}</h2>
                            <div className="space-y-3">
                                <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" />
                                <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded" rows={2} />
                                <div className="flex gap-3">
                                    <input required type="number" min="0" placeholder="Price ₹" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-1/2 p-2 border rounded" />
                                    <input required type="number" min="0" placeholder="Stock" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="w-1/2 p-2 border rounded" />
                                </div>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-2 border rounded">
                                    <option>Starters</option><option>Main Course</option><option>Breads</option><option>Breakfast &amp; Tiffins</option><option>Uncategorized</option>
                                </select>
                                <input placeholder="Image path e.g. /images/samosa.jpg" value={form.image_path} onChange={(e) => setForm({ ...form, image_path: e.target.value })} className="w-full p-2 border rounded" />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-lg hover:bg-emerald-600">{editingId ? 'Save' : 'Add'}</button>
                                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_ITEM); }} className="px-4 py-2 rounded-lg border font-semibold text-slate-600">Cancel</button>}
                            </div>
                        </form>

                        {/* Menu list */}
                        <div className="lg:col-span-2 space-y-3">
                            {menu.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow border flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{item.name} <span className="text-slate-400 font-normal">· {item.category}</span></p>
                                        <p className="text-sm text-slate-500">₹{item.price} · {item.stock_quantity} in stock {item.is_available ? '' : '· hidden'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => toggleAvailable(item)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{item.is_available ? 'Available' : 'Hidden'}</button>
                                        <button onClick={() => editItem(item)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700">Edit</button>
                                        <button onClick={() => deleteItem(item.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-700">Delete</button>
                                    </div>
                                </div>
                            ))}
                            {menu.length === 0 && <p className="text-slate-500">No menu items yet.</p>}
                        </div>
                    </div>
                )}

                {tab === 'orders' && (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.order_id} className="bg-white p-5 rounded-xl shadow border">
                                <div className="flex flex-wrap justify-between items-start gap-3 border-b pb-3 mb-3">
                                    <div>
                                        <p className="font-bold text-slate-800">Order #{order.order_id} {order.token_number ? `· Token #${order.token_number}` : ''}</p>
                                        <p className="text-sm text-slate-500">{order.customer_name} ({order.customer_email})</p>
                                        <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-emerald-600">₹{order.total_amount}</span>
                                        <select value={order.status} onChange={(e) => setOrderStatus(order.order_id, e.target.value)} className="p-2 border rounded-lg text-sm capitalize">
                                            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-600 flex flex-wrap gap-x-6 gap-y-1">
                                    {order.items.map((it, i) => <span key={i}>{it.quantity} × {it.name}</span>)}
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-slate-500">No orders yet.</p>}
                    </div>
                )}
            </main>
        </div>
    );
}
