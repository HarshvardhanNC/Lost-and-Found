import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const useLostFound = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5000/api/lost-found');
            
            // Sort items by date, newest first
            const sortedItems = response.data.sort((a, b) => {
                return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
            });
            
            setItems(sortedItems);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching items:', err);
            setError('Failed to load items. Please try again later.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = async (itemData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to report an item');
            }

            const response = await axios.post(
                'http://localhost:5000/api/lost-found',
                {
                    ...itemData,
                    reportedBy: user?.id
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Add the new item to the beginning of the list
            setItems(prevItems => [response.data, ...prevItems]);
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error adding item:', err);
            const errorMessage = err.response?.data?.message || 'Failed to add item. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const markAsClaimed = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user) {
                throw new Error('Please log in to mark items as claimed');
            }

            const response = await axios.post(
                `http://localhost:5000/api/lost-found/${itemId}/mark-claimed`,
                { userId: user.id },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Update the item in the local state
                setItems(prevItems => 
                    prevItems.map(item => 
                        item._id === itemId 
                            ? { 
                                ...item, 
                                claimed: true,
                                claimedAt: response.data.claimedAt
                              }
                            : item
                    )
                );
                return { success: true };
            }
        } catch (err) {
            console.error('Error marking item as claimed:', err);
            const errorMessage = err.response?.data?.message || 'Failed to mark item as claimed. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const deleteItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/lost-found/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setItems(prevItems => prevItems.filter(item => item._id !== itemId));
            return { success: true };
        } catch (err) {
            console.error('Error deleting item:', err);
            const errorMessage = err.response?.data?.message || 'Failed to delete item. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const unmarkClaimed = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user) {
                throw new Error('Please log in to unmark items');
            }

            const response = await axios.post(
                `http://localhost:5000/api/lost-found/${itemId}/unmark-claimed`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Update the item in the local state
                setItems(prevItems => 
                    prevItems.map(item => 
                        item._id === itemId 
                            ? { 
                                ...item, 
                                claimed: false,
                                claimedAt: null
                              }
                            : item
                    )
                );
                return { success: true };
            }
        } catch (err) {
            console.error('Error unmarking item as claimed:', err);
            const errorMessage = err.response?.data?.message || 'Failed to unmark item. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const filterItems = (filterType) => {
        if (filterType === 'all') return items;
        return items.filter(item => item.type === filterType);
    };

    return {
        items,
        loading,
        error,
        fetchItems,
        addItem,
        markAsClaimed,
        unmarkClaimed,
        deleteItem,
        filterItems,
        refetch: fetchItems
    };
};

