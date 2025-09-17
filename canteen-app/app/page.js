'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// --- ICONS (All necessary icons included) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l.218-.219.133-.133.953-1.634h4.814a1 1 0 00.95-.694l1.5-6A1 1 0 0015.46 2H6.22l-.305-1.222A1 1 0 005 0H3z" /><path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-8 w-8 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const StarIcon = ({ filled, className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${filled ? 'text-amber-400' : 'text-gray-300'} ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const HeartIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${filled ? 'text-red-500' : 'text-white/80'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;

// --- MAIN PAGE COMPONENT ---
export default function CanteenWalaPage() {
    // --- STATE MANAGEMENT ---
    const [token, setToken] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [view, setView] = useState('dashboard');
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const [orderHistory, setOrderHistory] = useState([]);
    const [latestOrder, setLatestOrder] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [favorites, setFavorites] = useState(new Set());

    // --- EFFECT HOOKS ---
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchUserProfile(storedToken);
        }
    }, []);

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            const fetchMenu = async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/menu');
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    setMenuItems(data);
                } catch (err) {
                    console.error("Failed to fetch menu:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchMenu();
        }
    }, [token]);

    // --- HANDLER FUNCTIONS ---
    const fetchUserProfile = async (authToken) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Could not fetch profile');
            const userData = await response.json();
            setCurrentUser(userData);
        } catch (err) {
            console.error("Profile fetch error:", err);
            handleLogout();
        }
    };
    
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const url = isLoginView ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
        const payload = isLoginView ? { email, password } : { name, email, password };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Something went wrong');
            
            if (isLoginView) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                await fetchUserProfile(data.token);
            } else {
                alert('Registration successful! Please log in.');
                setIsLoginView(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        setIsDropdownOpen(false);
        setView('dashboard');
    };
    
    const handleItemClick = (item) => {
        setSelectedItem(item);
        setQuantity(1);
        setView('itemDetail');
    };
    
    const addToCart = (item, quantityToAdd) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: quantityToAdd }];
        });
    };
    
    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };
    
    const toggleFavorite = (itemId) => {
        setFavorites(prevFavorites => {
            const newFavorites = new Set(prevFavorites);
            if (newFavorites.has(itemId)) {
                newFavorites.delete(itemId);
            } else {
                newFavorites.add(itemId);
            }
            return newFavorites;
        });
    };
    
    const handlePayment = async () => {
        setView('processingPayment');
        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cart: cart, total: totalCost })
            });
            if (!response.ok) throw new Error('Order failed to place.');
            const orderData = await response.json();
            const newOrder = { id: orderData.orderId, date: new Date(), items: cart, total: totalCost };
            setLatestOrder(newOrder);
            setCart([]);
            setView('confirmation');
        } catch (error) {
            console.error(error);
            alert('There was an issue placing your order. Please try again.');
            setView('cart');
        }
    };

    const fetchOrderHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/orders/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(!response.ok) throw new Error('Could not fetch history');
            const data = await response.json();
            setOrderHistory(data);
        } catch(error) {
            console.error(error);
        }
    };
    
    const navigateTo = (newView) => { 
        if (newView === 'orderHistory' || newView === 'settings') {
            fetchOrderHistory();
        }
        setView(newView); 
        setIsDropdownOpen(false); 
    };
    
    const resetOrder = () => { setView('menu'); };
    const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    
    const filteredMenu = menuItems.filter(item => {
        const itemCategory = item.category || 'Uncategorized';
        const matchesCategory = filterCategory === 'All' || itemCategory === filterCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const favoriteItems = menuItems.filter(item => favorites.has(item.id));

    // --- RENDER LOGIC ---
    if (!token) {
        return (
            <div className="min-h-screen font-sans flex items-center justify-center relative p-4 bg-black">
                <Image src="/images/start.jpg" alt="Background" layout="fill" objectFit="cover" className="opacity-40" />
                <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-center">
                        <h1 className="text-5xl font-black text-white tracking-tighter">Canteen Wala</h1>
                        <p className="text-gray-200 text-lg mt-2">{isLoginView ? 'Welcome back!' : 'Create your account'}</p>
                    </div>
                    <form onSubmit={handleAuthSubmit} className="space-y-6">
                        {!isLoginView && (<div><label className="text-sm font-bold text-gray-200 block mb-2">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" required /></div>)}
                        <div><label className="text-sm font-bold text-gray-200 block mb-2">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" required /></div>
                        <div><label className="text-sm font-bold text-gray-200 block mb-2">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" required /></div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors transform hover:scale-105">{isLoginView ? 'Login' : 'Create Account'}</button>
                    </form>
                    <p className="text-center text-gray-300">{isLoginView ? "Don't have an account?" : "Already have an account?"}<button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-bold text-white ml-2 hover:underline">{isLoginView ? 'Sign Up' : 'Login'}</button></p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={() => navigateTo('dashboard')} className="text-2xl font-bold text-red-600">Canteen Wala</button>
                    <div className="flex items-center space-x-4">
                         <button onClick={() => navigateTo('menu')} className="font-semibold text-slate-600 hover:text-red-600">Menu</button>
                        <button onClick={() => navigateTo('cart')} className="relative"><CartIcon />{cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}</button>
                        <div className="relative">
                            <button onClick={() => setIsDropdownOpen(p => !p)} className="focus:outline-none"><UserIcon /></button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10 py-1 border border-slate-200">
                                    <div className="px-4 py-2 text-sm text-slate-500">Signed in as <strong className="block text-slate-700 truncate">{currentUser?.name}</strong></div>
                                    <div className="border-t border-slate-200 my-1"></div>
                                    <button onClick={() => navigateTo('favorites')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">My Favorites</button>
                                    <button onClick={() => navigateTo('orderHistory')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Order History</button>
                                    <button onClick={() => navigateTo('settings')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Settings</button>
                                    <div className="border-t border-slate-200 my-1"></div>
                                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-slate-100">Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {view === 'dashboard' && (
                     <div>
                         <section className="relative h-[60vh] flex items-center justify-center text-white text-center">
                             <Image src="/images/start.jpg" alt="Welcome to Canteen Wala" layout="fill" objectFit="cover" className="brightness-50" />
                             <div className="relative z-10 p-4">
                                 <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Welcome, {currentUser?.name}!</h1>
                                 <p className="mt-4 text-xl text-gray-200">Experience the finest, freshest meals, every day.</p>
                             </div>
                         </section>
                         <section className="container mx-auto px-6 py-16">
                             <div className="text-center max-w-3xl mx-auto">
                                 <h2 className="text-4xl font-bold text-slate-800">About Canteen Wala</h2>
                                 <p className="mt-4 text-lg text-slate-600">
                                     Founded on the principle of providing wholesome and delicious meals, Canteen Wala is more than just a place to eat. It's a community hub where fresh ingredients meet culinary passion. Our commitment is to serve you authentic flavors that feel like home, prepared with the utmost care for quality and hygiene.
                                 </p>
                                 <button onClick={() => navigateTo('menu')} className="mt-8 bg-red-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-red-700 transition-transform hover:scale-105">
                                     Explore Today's Menu
                                 </button>
                             </div>
                         </section>
                     </div>
                )}
                
                {view === 'menu' && (
                    <div className="relative">
                        <div className="absolute inset-0">
                            <Image src="/images/menu.jpg" alt="Menu Background" layout="fill" objectFit="cover" className="opacity-10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/90 to-gray-50/80"></div>
                        </div>
                        <div className="container mx-auto px-6 py-12 relative z-10">
                            <h2 className="text-4xl font-extrabold text-slate-800 mb-2">Today's Menu</h2>
                            <p className="text-slate-500 mb-8">Discover our fresh selection of handcrafted dishes.</p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 mb-8 sticky top-[77px] bg-gray-50/80 backdrop-blur-sm py-4 z-40 -mx-6 px-6 border-b border-t">
                                <input 
                                    type="text" 
                                    placeholder="Search for a dish..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="w-full sm:w-2/3 p-3 bg-white/50 border border-red-500/30 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 transition-shadow placeholder-slate-500"
                                />
                                <select 
                                    value={filterCategory} 
                                    onChange={(e) => setFilterCategory(e.target.value)} 
                                    className="w-full sm:w-1/3 p-3 bg-white/50 border border-red-500/30 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 transition-shadow"
                                >
                                    <option>All</option>
                                    <option>Starters</option>
                                    <option>Main Course</option>
                                    <option>Breads</option>
                                    <option>Breakfast & Tiffins</option>
                                </select>
                            </div>
                            
                            {isLoading ? (<p>Loading menu...</p>) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {filteredMenu.map(item => {
                                        const isInCart = cart.some(cartItem => cartItem.id === item.id);
                                        return (
                                            <div key={item.id} className="bg-white rounded-xl overflow-hidden group shadow-md border hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                                                <div className="relative">
                                                    <Image src={item.image_path || '/images/default-food.jpg'} alt={item.name} width={400} height={300} className="w-full h-56 object-cover cursor-pointer" onClick={() => handleItemClick(item)} />
                                                    <div className="absolute top-3 right-3">
                                                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }} className="bg-black/30 p-2 rounded-full backdrop-blur-sm transition-transform hover:scale-110">
                                                            <HeartIcon filled={favorites.has(item.id)} />
                                                        </button>
                                                    </div>
                                                    {isInCart && <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">IN CART</div>}
                                                </div>
                                                <div className="p-5 flex flex-col flex-grow">
                                                    <h3 className="text-xl font-bold text-slate-800 truncate cursor-pointer" onClick={() => handleItemClick(item)}>{item.name}</h3>
                                                    <p className="text-lg font-semibold text-emerald-600 mt-1">₹{item.price}</p>
                                                    <div className="flex-grow"></div>
                                                    <div className="mt-4">
                                                        <button onClick={() => addToCart(item, 1)} className="w-full bg-slate-800 text-white font-semibold py-3 rounded-lg hover:bg-slate-900 transition-colors transform hover:scale-105">
                                                            Quick Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {view === 'itemDetail' && selectedItem && ( <div className="container mx-auto px-6 py-12"><button onClick={() => setView('menu')} className="flex items-center font-bold text-slate-600 mb-8 hover:text-slate-900"><BackIcon /> Back to Menu</button><div className="flex flex-col lg:flex-row gap-8 lg:gap-12"><div className="lg:w-1/2"><Image src={selectedItem.image_path} alt={selectedItem.name} width={500} height={500} className="w-full h-auto rounded-xl object-cover shadow-lg" /></div><div className="lg:w-1/2"><h2 className="text-5xl font-extrabold text-slate-800">{selectedItem.name}</h2><p className="text-4xl font-bold text-emerald-600 my-4">₹{selectedItem.price}</p><p className="text-slate-600 text-lg mb-8">{selectedItem.description}</p><div className="flex items-center space-x-4 mb-8"><button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="bg-slate-200 h-12 w-12 rounded-full font-bold text-xl hover:bg-slate-300">-</button><span className="text-2xl font-bold w-12 text-center">{quantity}</span><button onClick={() => setQuantity(q => q + 1)} className="bg-slate-200 h-12 w-12 rounded-full font-bold text-xl hover:bg-slate-300">+</button></div><button onClick={() => addToCart(selectedItem, quantity)} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl text-lg hover:bg-emerald-600 transition-all">Add {quantity} to Cart</button></div></div></div>)}
                
                {view === 'cart' && (
                    <div className="container mx-auto px-6 py-12">
                        <button onClick={() => setView('menu')} className="flex items-center font-bold text-slate-600 mb-8 hover:text-slate-900"><BackIcon /> Back to Menu</button>
                        <h2 className="text-4xl font-extrabold text-slate-800 mb-8">Your Cart</h2>
                        {cart.length === 0 ? (<p>Your cart is empty.</p>) : (
                            <div className="bg-white p-8 rounded-xl shadow-lg border">
                                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center border-b pb-4">
                                            <div>
                                                <p className="text-lg font-bold">{item.name}</p>
                                                <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <p className="text-lg font-bold">₹{item.price * item.quantity}</p>
                                                <button onClick={() => removeFromCart(item.id)} title="Remove Item">
                                                    <XCircleIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <p className="text-2xl font-extrabold">Total</p>
                                    <p className="text-2xl font-extrabold">₹{totalCost}</p>
                                </div>
                                <button onClick={handlePayment} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl text-lg hover:bg-emerald-600 transition-all mt-8">Proceed to Payment</button>
                            </div>
                        )}
                    </div>
                )}
                
                {view === 'processingPayment' && (<div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center text-center p-10"><SpinnerIcon /><h2 className="text-2xl font-bold text-slate-800 mt-6">Processing Your Payment</h2><p className="text-slate-500">Please wait, do not close this window.</p></div>)}
                
                {view === 'confirmation' && latestOrder && (<div className="container mx-auto px-6 py-12 max-w-2xl mx-auto text-center bg-white p-10 rounded-xl shadow-lg border"><CheckCircleIcon /><h2 className="text-3xl font-extrabold text-slate-800 mt-4">Order Confirmed!</h2><p className="text-slate-500 mb-8">Thank you for your purchase. Here is your bill.</p><div className="text-left bg-gray-50 p-6 rounded-lg border my-6"><h3 className="text-xl font-bold mb-4">Receipt</h3><div className="flex justify-between text-sm text-slate-600 mb-4"><span>Order ID:</span><strong>{latestOrder.id}</strong></div><div className="flex justify-between text-sm text-slate-600 mb-4"><span>Date:</span><strong>{latestOrder.date.toLocaleString()}</strong></div><div className="border-t my-4"></div>{latestOrder.items.map(item => (<div key={item.id} className="flex justify-between items-center py-2 text-sm"><p>{item.name} <span className="text-slate-500">x {item.quantity}</span></p><span>₹{item.price * item.quantity}</span></div>))}<div className="flex justify-between font-extrabold text-xl mt-4 border-t pt-4"><span>Total Paid</span><span>₹{latestOrder.total}</span></div></div><div className="flex flex-col sm:flex-row gap-4 justify-center"><button onClick={resetOrder} className="w-full sm:w-auto bg-slate-200 text-slate-800 font-bold py-3 px-8 rounded-full hover:bg-slate-300">Back to Menu</button><button onClick={resetOrder} className="w-full sm:w-auto bg-slate-800 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-900">Place New Order</button></div></div>)}
                
                {view === 'orderHistory' && (<div className="container mx-auto px-6 py-12"><button onClick={() => setView('dashboard')} className="flex items-center font-bold text-slate-600 mb-8 hover:text-slate-900"><BackIcon /> Back to Dashboard</button><h2 className="text-4xl font-extrabold text-slate-800 mb-8">Your Order History</h2><div className="space-y-8">{orderHistory.length > 0 ? orderHistory.map(order => (<div key={order.order_id} className="bg-white p-6 rounded-xl shadow-lg border"><div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 mb-4"><div><p className="text-sm text-slate-500">Order ID</p><h3 className="text-lg font-bold text-slate-700">{order.order_id}</h3></div><div><p className="text-sm text-slate-500 mt-2 sm:mt-0 sm:text-right">Date</p><p className="font-semibold">{new Date(order.created_at).toLocaleString()}</p></div></div><div className="space-y-3">{order.items.map((item, index) => (<div key={index} className="flex justify-between items-center text-slate-600"><span>{item.quantity} x {item.name}</span><span className="font-medium">₹{item.price * item.quantity}</span></div>))}</div><div className="border-t mt-4 pt-4 flex justify-between items-center"><span className="text-xl font-bold text-slate-800">Total Paid</span><span className="text-xl font-bold text-emerald-600">₹{order.total_amount}</span></div></div>)) : <p>You have no past orders.</p>}</div></div>)}
                
                 {view === 'favorites' && (
                    <div className="container mx-auto px-6 py-12">
                        <button onClick={() => setView('dashboard')} className="flex items-center font-bold text-slate-600 mb-8 hover:text-slate-900"><BackIcon /> Back to Dashboard</button>
                        <h2 className="text-4xl font-extrabold text-slate-800 mb-8">My Favorites</h2>
                        {favoriteItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {favoriteItems.map(item => (
                                    <div key={item.id} className="bg-white rounded-xl overflow-hidden group shadow-md border hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                                        <Image src={item.image_path || '/images/default-food.jpg'} alt={item.name} width={400} height={300} className="w-full h-56 object-cover" />
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold text-slate-800 truncate">{item.name}</h3>
                                            <p className="text-lg font-semibold text-emerald-600 mt-1">₹{item.price}</p>
                                            <div className="flex-grow"></div>
                                            <div className="mt-4">
                                                <button onClick={() => handleItemClick(item)} className="w-full bg-slate-800 text-white font-semibold py-3 rounded-lg hover:bg-slate-900 transition-colors">
                                                    View Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>You haven't added any favorites yet. Click the heart on any menu item to save it here!</p>
                        )}
                    </div>
                )}

                {view === 'settings' && (
                     <div className="container mx-auto px-6 py-12">
                        <button onClick={() => setView('dashboard')} className="flex items-center font-bold text-slate-600 mb-8 hover:text-slate-900"><BackIcon /> Back to Dashboard</button>
                        <h2 className="text-4xl font-extrabold text-slate-800 mb-8">Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-lg border">
                                <h3 className="text-2xl font-bold mb-4">Profile</h3>
                                {currentUser ? (
                                    <div className="space-y-3">
                                        <p><strong>Name:</strong> {currentUser.name}</p>
                                        <p><strong>Email:</strong> {currentUser.email}</p>
                                    </div>
                                ) : (<p>Loading profile...</p>)}
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-lg border">
                                <h3 className="text-2xl font-bold mb-4">Activity Summary</h3>
                                <div className="space-y-3">
                                    <p><strong>Total Orders Placed:</strong> {orderHistory.length}</p>
                                    <p><strong>Favorite Items:</strong> {favorites.size > 0 ? `${favorites.size} items` : 'None'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}