import { useEffect } from 'react';
import {
    Button,
    Card,
    CardContent,
    Chip,
    InputGroup,
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationNextIcon,
    PaginationPrevious,
    PaginationPreviousIcon,
    Spinner,
} from '@heroui/react';
import { useUsersStore } from '../store/usersStore';
import { useUsersFilters } from '../hooks/useUsersFilters';
import { usePagination } from '../hooks/usePagination';
import { getFullName } from '../../domain/entities/UserEntity';

const UsersPage = () => {
    const { users, loading, error, success, getUsers } = useUsersStore();

    const {
        search,
        setSearch,
        applyFilters,
        resetFilters,
        activeFilters,
    } = useUsersFilters();

    const {
        currentPage,
        totalPages,
        goToPage,
        goToNext,
        goToPrevious,
        isFirstPage,
        isLastPage,
    } = usePagination(activeFilters);

    // Chargement initial uniquement
    useEffect(() => {
        getUsers({ page: 1 });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = () => applyFilters(1);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1">Gestion des Utilisateurs</h1>
                <p className="text-secondary">Exemple de feature complete avec Clean Architecture</p>
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
                <InputGroup fullWidth>
                    <InputGroup.Input
                        placeholder="Rechercher un utilisateur"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </InputGroup>
                <Button variant="primary" onPress={handleSearch} isDisabled={loading}>
                    Rechercher
                </Button>
                {Object.keys(activeFilters).length > 0 && (
                    <Button variant="secondary" onPress={resetFilters} isDisabled={loading}>
                        Reinitialiser
                    </Button>
                )}
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
                                    <p className="text-secondary text-sm">{user.email}</p>
                                    <p className="text-secondary text-sm">
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
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={goToPrevious}
                                            aria-disabled={isFirstPage || loading}
                                        >
                                            <PaginationPreviousIcon />
                                        </PaginationPrevious>
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                isActive={page === currentPage}
                                                onClick={() => goToPage(page)}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={goToNext}
                                            aria-disabled={isLastPage || loading}
                                        >
                                            <PaginationNextIcon />
                                        </PaginationNext>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}

                    {/* Informations */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-muted">
                            {users.totalItems} utilisateur(s) au total
                        </p>
                    </div>
                </>
            )}

            {/* Aucun resultat */}
            {users && users.data.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted text-lg">Aucun utilisateur trouve</p>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

