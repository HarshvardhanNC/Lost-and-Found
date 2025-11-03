import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    fetchItems, 
    deleteItem, 
    markAsClaimed, 
    unmarkClaimed,
    setFilter,
    clearError 
} from '../../store/slices/lostFoundSlice';

const LostFoundManagement = () => {
    const dispatch = useAppDispatch();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
    // Redux state
    const { items, loading, error, filter: reduxFilter } = useAppSelector((state) => state.lostFound);

    useEffect(() => {
        dispatch(fetchItems());
    }, [dispatch]);

    const handleFilterChange = (filterType) => {
        dispatch(setFilter(filterType));
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const result = await dispatch(deleteItem(itemToDelete._id));
        if (deleteItem.fulfilled.match(result)) {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
            dispatch(clearError());
        } else {
            // Error will be shown in the alert
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleToggleClaimed = async (item) => {
        let result;
        if (!item.claimed) {
            result = await dispatch(markAsClaimed(item._id));
        } else {
            result = await dispatch(unmarkClaimed(item._id));
        }
        
        if (markAsClaimed.rejected.match(result) || unmarkClaimed.rejected.match(result)) {
            // Error will be shown in the alert
        }
    };

    // Filter items based on Redux filter state
    const filteredItems = reduxFilter === 'all' 
        ? items 
        : items.filter(item => item.type === reduxFilter);
    
    const displayError = error;

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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ color: 'rgba(0, 0, 0, 0.87)', fontWeight: 'bold' }}>
                    Lost & Found Management
                </Typography>
                <Box display="flex" gap={1}>
                    <Button
                        variant={reduxFilter === 'all' ? 'contained' : 'outlined'}
                        onClick={() => handleFilterChange('all')}
                        size="small"
                    >
                        All Items ({items.length})
                    </Button>
                    <Button
                        variant={reduxFilter === 'lost' ? 'contained' : 'outlined'}
                        onClick={() => handleFilterChange('lost')}
                        size="small"
                    >
                        Lost ({items.filter(i => i.type === 'lost').length})
                    </Button>
                    <Button
                        variant={reduxFilter === 'found' ? 'contained' : 'outlined'}
                        onClick={() => handleFilterChange('found')}
                        size="small"
                    >
                        Found ({items.filter(i => i.type === 'found').length})
                    </Button>
                </Box>
            </Box>

            {displayError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {displayError}
                </Alert>
            )}

            {filteredItems.length === 0 ? (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                        No items found
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 4
                                }
                            }}>
                                {item.imageUrl && (
                                    <Box
                                        component="img"
                                        src={item.imageUrl}
                                        alt={item.title}
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'cover'
                                        }}
                                    />
                                )}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                                            {item.title}
                                        </Typography>
                                        <Chip
                                            label={item.type}
                                            color={item.type === 'lost' ? 'error' : 'success'}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {item.description}
                                    </Typography>
                                    <Box mt={2}>
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Location:</strong> {item.location}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Date:</strong> {new Date(item.date || item.createdAt).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Contact:</strong> {item.contact}
                                        </Typography>
                                        {item.claimed && (
                                            <Typography variant="body2" color="success.main" gutterBottom>
                                                <strong>Claimed:</strong> {new Date(item.claimedAt || item.date).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                    <Box>
                                        <IconButton
                                            onClick={() => handleToggleClaimed(item)}
                                            color={item.claimed ? 'success' : 'default'}
                                            size="small"
                                            title={item.claimed ? 'Mark as Unclaimed' : 'Mark as Claimed'}
                                        >
                                            {item.claimed ? <CheckCircleIcon /> : <CancelIcon />}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDeleteClick(item)}
                                            color="error"
                                            size="small"
                                            title="Delete Item"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LostFoundManagement;
