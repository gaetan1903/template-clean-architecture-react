import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Pagination
} from '@mui/material';
import { RootState, AppDispatch } from '../../../../core/store';
import { getUsersProvider } from '../redux/usersProvider';
import { clearSuccess, clearError } from '../redux/usersSlice';

const UsersPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading, error, success } = useSelector(
        (state: RootState) => state.users
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Chargement initial
    useEffect(() => {
        dispatch(getUsersProvider({ page: currentPage, search: searchTerm }));
    }, [currentPage, dispatch]);

    // Gestion des messages de succès
    useEffect(() => {
        if (success) {
            setTimeout(() => dispatch(clearSuccess()), 3000);
        }
    }, [success, dispatch]);

    // Gestion des erreurs
    useEffect(() => {
        if (error) {
            setTimeout(() => dispatch(clearError()), 3000);
        }
    }, [error, dispatch]);

    const handleSearch = () => {
        setCurrentPage(1);
        dispatch(getUsersProvider({ page: 1, search: searchTerm }));
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Gestion des Utilisateurs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Exemple de feature complète avec Clean Architecture
                </Typography>
            </Box>

            {/* Messages */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {/* Barre de recherche */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    label="Rechercher un utilisateur"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Rechercher
                </Button>
            </Box>

            {/* Loading */}
            {loading && !users && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Liste des utilisateurs */}
            {users && (
                <>
                    <Grid container spacing={3}>
                        {users.data.map((user) => (
                            <Grid item xs={12} sm={6} md={4} key={user.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {user.fullName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {user.email}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {user.phone || 'Pas de téléphone'}
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Rôle: {user.role}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    {users.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={users.totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                disabled={loading}
                            />
                        </Box>
                    )}

                    {/* Informations */}
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {users.totalItems} utilisateur(s) au total
                        </Typography>
                    </Box>
                </>
            )}

            {/* Aucun résultat */}
            {users && users.data.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                        Aucun utilisateur trouvé
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default UsersPage;
