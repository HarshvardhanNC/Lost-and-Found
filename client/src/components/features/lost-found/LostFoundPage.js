import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { 
  fetchItems, 
  addItem, 
  markAsClaimed, 
  setFilter,
  clearError 
} from '../../../store/slices/lostFoundSlice';
import { useAuth } from '../../../context/AuthContext';
import LostFoundForm from './LostFoundForm';

const LostFoundPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    
    // Redux state
    const { user } = useAppSelector((state) => state.auth);
    const { items, loading, error, filter: reduxFilter } = useAppSelector((state) => state.lostFound);
    
    // Local state
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Context API (for backward compatibility)
    const { logout: contextLogout } = useAuth();
    
    // Fetch items on mount
    useEffect(() => {
        dispatch(fetchItems());
    }, [dispatch]);
    
    // Filter items based on Redux filter state
    const filteredItems = reduxFilter === 'all' 
        ? items 
        : items.filter(item => item.type === reduxFilter);
    
    const handleFilterChange = (filterType) => {
        dispatch(setFilter(filterType));
    };
    
    const handleAddItem = async (itemData) => {
        const result = await dispatch(addItem(itemData));
        if (addItem.fulfilled.match(result)) {
            setShowAddForm(false);
            alert('Item reported successfully!');
        } else {
            alert(result.payload || 'Failed to add item. Please try again.');
        }
    };
    
    const handleMarkAsClaimed = async (itemId) => {
        const result = await dispatch(markAsClaimed(itemId));
        if (markAsClaimed.fulfilled.match(result)) {
            alert('Item has been marked as claimed successfully!');
        } else {
            alert(result.payload || 'Failed to mark item as claimed. Please try again.');
        }
    };
    
    const handleLogout = () => {
        dispatch(logout());
        contextLogout();
        navigate('/login');
    };
    
    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <div className="text-2xl font-semibold text-gray-700">Loading items...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-4">
                    <div className="text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <div className="text-xl font-bold text-red-600 mb-2">Error</div>
                        <div className="text-gray-700">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Lost & Found
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-lg">👋</span>
                                <span className="font-medium">Welcome, {user?.name}</span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button 
                            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                                reduxFilter === 'all' 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
                            }`}
                            onClick={() => handleFilterChange('all')}
                        >
                            📦 All Items ({items.length})
                        </button>
                        <button 
                            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                                reduxFilter === 'lost' 
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
                            }`}
                            onClick={() => handleFilterChange('lost')}
                        >
                            🔍 Lost ({items.filter(i => i.type === 'lost').length})
                        </button>
                        <button 
                            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                                reduxFilter === 'found' 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
                            }`}
                            onClick={() => handleFilterChange('found')}
                        >
                            ✅ Found ({items.filter(i => i.type === 'found').length})
                        </button>
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="ml-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            ➕ Report Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-16 sm:py-20">
                        <div className="text-6xl sm:text-7xl mb-4">📭</div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">No items found</div>
                        <div className="text-gray-500">Try adjusting your filters</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                        {filteredItems.map(item => (
                            <div 
                                key={item._id} 
                                className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                                    item.type === 'lost' 
                                        ? 'border-t-4 border-red-500 hover:border-red-600' 
                                        : 'border-t-4 border-green-500 hover:border-green-600'
                                }`}
                            >
                                {/* Image Container with Overlay */}
                                <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                    {item.imageUrl ? (
                                        <>
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </>
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${
                                            item.type === 'lost' 
                                                ? 'bg-gradient-to-br from-red-100 to-red-200' 
                                                : 'bg-gradient-to-br from-green-100 to-green-200'
                                        }`}>
                                            <span className="text-6xl">
                                                {item.type === 'lost' ? '🔍' : '✅'}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Type Badge */}
                                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                                        item.type === 'lost' 
                                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                            : 'bg-gradient-to-r from-green-500 to-emerald-600'
                                    }`}>
                                        {item.type === 'lost' ? 'LOST' : 'FOUND'}
                                    </div>

                                    {/* Claimed Badge */}
                                    {item.claimed && (
                                        <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
                                            <span>✓</span>
                                            <span>CLAIMED</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 sm:p-6">
                                    {/* Title */}
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                                        {item.title}
                                    </h3>
                                    
                                    {/* Description */}
                                    <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                        {item.description}
                                    </p>
                                    
                                    {/* Details */}
                                    <div className="space-y-2.5 mb-4">
                                        <div className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-lg mt-0.5 flex-shrink-0">📍</span>
                                            <span className="font-medium break-words">{item.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="text-lg flex-shrink-0">📅</span>
                                            <span>{new Date(item.date || item.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="text-lg flex-shrink-0">📞</span>
                                            <a 
                                                href={`tel:${item.contact}`} 
                                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                            >
                                                {item.contact}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Claimed Status or Action Button */}
                                    {item.claimed ? (
                                        <div className="mt-4 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl">
                                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                                <span className="text-xl">✓</span>
                                                <span>Claimed</span>
                                            </div>
                                            {item.claimedAt && (
                                                <div className="text-xs text-emerald-600 mt-1 ml-7">
                                                    on {new Date(item.claimedAt).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        user && 
                                        item.reportedBy && 
                                        item.reportedBy.toString() === user.id && 
                                        item.type === 'found' && (
                                            <button 
                                                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                                                onClick={() => handleMarkAsClaimed(item._id)}
                                            >
                                                <span>✓</span>
                                                <span>Mark as Claimed</span>
                                            </button>
                                        )
                                    )}
                                </div>

                                {/* Hover Effect Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none rounded-2xl"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAddForm && (
                <LostFoundForm 
                    onClose={() => setShowAddForm(false)}
                    onSubmit={handleAddItem}
                />
            )}
        </div>
    );
};

export default LostFoundPage;
