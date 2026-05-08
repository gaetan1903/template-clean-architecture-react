import { useState } from 'react';
import { useUsersStore } from '../store/usersStore';
import { GetUsersFiltersParams } from '../../domain/types/UsersDomainTypes';

interface UseUsersFiltersReturn {
    search: string;
    role: string;
    status: string;
    setSearch: (value: string) => void;
    setRole: (value: string) => void;
    setStatus: (value: string) => void;
    applyFilters: (page?: number) => void;
    resetFilters: () => void;
    activeFilters: GetUsersFiltersParams;
}

const INITIAL_FILTERS = { search: '', role: '', status: '' };

/**
 * Hook de presentation -- gere les filtres de la liste utilisateurs.
 * Separe l'etat local du formulaire (draft) de l'appel store (applique).
 * Les filtres ne sont envoyes au store qu'a l'appel explicite de applyFilters.
 *
 * Usage :
 *   const { search, setSearch, applyFilters, resetFilters } = useUsersFilters();
 */
export const useUsersFilters = (): UseUsersFiltersReturn => {
    const getUsers = useUsersStore((s) => s.getUsers);

    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');

    const activeFilters: GetUsersFiltersParams = {
        ...(search.trim() && { search: search.trim() }),
        ...(role && { role }),
        ...(status && { status }),
    };

    const applyFilters = (page = 1) => {
        getUsers({ page, ...activeFilters });
    };

    const resetFilters = () => {
        setSearch(INITIAL_FILTERS.search);
        setRole(INITIAL_FILTERS.role);
        setStatus(INITIAL_FILTERS.status);
        getUsers({ page: 1 });
    };

    return {
        search,
        role,
        status,
        setSearch,
        setRole,
        setStatus,
        applyFilters,
        resetFilters,
        activeFilters,
    };
};
