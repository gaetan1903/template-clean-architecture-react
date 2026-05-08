import { useState } from 'react';
import { useUsersStore } from '../store/usersStore';
import { GetUsersFiltersParams } from '../../domain/types/UsersDomainTypes';

interface UsePaginationReturn {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    goToNext: () => void;
    goToPrevious: () => void;
    isFirstPage: boolean;
    isLastPage: boolean;
}

/**
 * Hook de presentation -- gere la pagination de la liste utilisateurs.
 * Conserve la page courante localement et declenche getUsers a chaque changement.
 * Accepte les filtres actifs en parametre pour les conserver lors des changements de page.
 *
 * Usage :
 *   const { currentPage, goToPage, goToNext, goToPrevious, isFirstPage, isLastPage } =
 *     usePagination(activeFilters);
 */
export const usePagination = (activeFilters: GetUsersFiltersParams = {}): UsePaginationReturn => {
    const users = useUsersStore((s) => s.users);
    const getUsers = useUsersStore((s) => s.getUsers);

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = users?.totalPages ?? 1;

    const goToPage = (page: number) => {
        const clamped = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(clamped);
        getUsers({ page: clamped, ...activeFilters });
    };

    const goToNext = () => goToPage(currentPage + 1);
    const goToPrevious = () => goToPage(currentPage - 1);

    return {
        currentPage,
        totalPages,
        goToPage,
        goToNext,
        goToPrevious,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage >= totalPages,
    };
};
