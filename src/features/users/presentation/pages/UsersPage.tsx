import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent, Chip, InputGroup, Pagination, Spinner } from '@heroui/react';
import { useUsersStore } from '../store/usersStore';
import { getFullName } from '../../domain/entities/UserEntity';

const UsersPage: React.FC = () => {
    const { users, loading, error, success, getUsers, clearSuccess, clearError } = useUsersStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Chargement initial
    useEffect(() => {
        getUsers({ page: currentPage, search: searchTerm });
    }, [currentPage, getUsers]);

    // Gestion des messages de succès
    useEffect(() => {
        if (success) {
            setTimeout(() => clearSuccess(), 3000);
        }
    }, [success, clearSuccess]);

    // Gestion des erreurs
    useEffect(() => {
        if (error) {
            setTimeout(() => clearError(), 3000);
        }
    }, [error, clearError]);

    const handleSearch = () => {
        setCurrentPage(1);
        getUsers({ page: 1, search: searchTerm });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1">Gestion des Utilisateurs</h1>
                <p className="text-neutral-500">Exemple de feature complete avec Clean Architecture</p>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 text-sm mb-4">
                    {success}
                </div>
            )}

            {/* Barre de recherche */}
            <div className="flex gap-3 mb-6">
                <InputGroup variant="bordered" fullWidth>
                    <InputGroup.Input
                        placeholder="Rechercher un utilisateur"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </InputGroup>
                <Button variant="primary" onPress={handleSearch} isDisabled={loading}>
                    Rechercher
                </Button>
            </div>

            {/* Loading */}
            {loading && !users && (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            )}

            {/* Liste des utilisateurs */}
            {users && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {users.data.map((user) => (
                            <Card key={user.id} className="shadow-sm">
                                <CardContent className="flex flex-col gap-2 pt-4">
                                    <h3 className="font-semibold text-lg">{getFullName(user)}</h3>
                                    <p className="text-neutral-500 text-sm">{user.email}</p>
                                    <p className="text-neutral-500 text-sm">
                                        {user.phone || 'Pas de telephone'}
                                    </p>
                                    <div className="mt-1">
                                        <Chip size="sm" variant="secondary">
                                            {user.role}
                                        </Chip>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {users.totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination>
                                <Pagination.Content>
                                    <Pagination.Item>
                                        <Pagination.Previous
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            aria-disabled={currentPage === 1 || loading}
                                        />
                                    </Pagination.Item>
                                    {Array.from({ length: users.totalPages }, (_, i) => i + 1).map((page) => (
                                        <Pagination.Item key={page}>
                                            <Pagination.Link
                                                isActive={page === currentPage}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </Pagination.Link>
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Item>
                                        <Pagination.Next
                                            onClick={() => setCurrentPage((p) => Math.min(users.totalPages, p + 1))}
                                            aria-disabled={currentPage === users.totalPages || loading}
                                        />
                                    </Pagination.Item>
                                </Pagination.Content>
                            </Pagination>
                        </div>
                    )}

                    {/* Informations */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-neutral-400">
                            {users.totalItems} utilisateur(s) au total
                        </p>
                    </div>
                </>
            )}

            {/* Aucun résultat */}
            {users && users.data.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-neutral-400 text-lg">Aucun utilisateur trouve</p>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

