import { describe, it, expect, vi, beforeEach } from 'vitest';
import { right, left } from '@sweet-monads/either';
import { UsersUseCase } from './UsersUseCase';
import { AppError } from '@core/types/AppError';
import { PaginatedArray } from '@core/types/PaginatedArray';
import { UserEntity } from '../entities/UserEntity';
import { IUsersRepository } from '../repositories/IUsersRepository';

// --- Helpers ---

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity => ({
    id: '550e8400-e29b-41d4-a716-446655440000',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: null,
    role: 'USER',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
});

const makePaginatedUsers = (users: UserEntity[] = [makeUser()]) =>
    new PaginatedArray(users, 1, 1, users.length);

const makeRepository = (): IUsersRepository => ({
    getUsers: vi.fn().mockResolvedValue(right(makePaginatedUsers())),
    getUserById: vi.fn().mockResolvedValue(right(makeUser())),
    createUser: vi.fn().mockResolvedValue(right(true)),
    updateUser: vi.fn().mockResolvedValue(right(true)),
    deleteUser: vi.fn().mockResolvedValue(right(true)),
});

// --- Tests ---

describe('UsersUseCase', () => {
    let repository: IUsersRepository;
    let useCase: UsersUseCase;

    beforeEach(() => {
        repository = makeRepository();
        useCase = new UsersUseCase(repository);
    });

    // ------------------------------------------------------------------ getUsers
    describe('getUsers', () => {
        it('delegue au repository avec des filtres valides', async () => {
            const result = await useCase.getUsers({ page: 1 });

            expect(result.isRight()).toBe(true);
            expect(repository.getUsers).toHaveBeenCalledWith({ page: 1 });
        });

        it('retourne une erreur si page < 1', async () => {
            const result = await useCase.getUsers({ page: 0 });

            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.code).toBe('400');
            }
        });

        it('retourne une erreur si le statut est invalide', async () => {
            const result = await useCase.getUsers({ status: 'INCONNU' });

            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.code).toBe('400');
            }
        });

        it('accepte les statuts valides', async () => {
            for (const status of ['ACTIVE', 'INACTIVE', 'SUSPENDED']) {
                const result = await useCase.getUsers({ status });
                expect(result.isRight()).toBe(true);
            }
        });
    });

    // --------------------------------------------------------------- getUserById
    describe('getUserById', () => {
        it('delegue au repository si l ID est valide', async () => {
            const result = await useCase.getUserById({ id: 'abc-123' });

            expect(result.isRight()).toBe(true);
            expect(repository.getUserById).toHaveBeenCalledWith({ id: 'abc-123' });
        });

        it('retourne une erreur si l ID est vide', async () => {
            const result = await useCase.getUserById({ id: '' });

            expect(result.isLeft()).toBe(true);
        });

        it('retourne une erreur si l ID est un espace', async () => {
            const result = await useCase.getUserById({ id: '   ' });

            expect(result.isLeft()).toBe(true);
        });
    });

    // ---------------------------------------------------------------- createUser
    describe('createUser', () => {
        const validData = {
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie.martin@example.com',
            password: 'secret123',
        };

        it('delegue au repository avec des donnees valides', async () => {
            const result = await useCase.createUser(validData);

            expect(result.isRight()).toBe(true);
            expect(repository.createUser).toHaveBeenCalledWith(validData);
        });

        it('retourne une erreur si le prenom est vide', async () => {
            const result = await useCase.createUser({ ...validData, firstName: '' });
            expect(result.isLeft()).toBe(true);
        });

        it('retourne une erreur si le nom est vide', async () => {
            const result = await useCase.createUser({ ...validData, lastName: '' });
            expect(result.isLeft()).toBe(true);
        });

        it('retourne une erreur si l email est invalide', async () => {
            const result = await useCase.createUser({ ...validData, email: 'pas-un-email' });
            expect(result.isLeft()).toBe(true);
        });

        it('retourne une erreur si le mot de passe est trop court', async () => {
            const result = await useCase.createUser({ ...validData, password: '123' });
            expect(result.isLeft()).toBe(true);
        });

        it('propage l erreur du repository', async () => {
            vi.mocked(repository.createUser).mockResolvedValue(
                left(new AppError('Erreur API', '001'))
            );
            const result = await useCase.createUser(validData);
            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.message).toBe('Erreur API');
            }
        });
    });

    // ---------------------------------------------------------------- updateUser
    describe('updateUser', () => {
        it('delegue au repository avec des donnees valides', async () => {
            const result = await useCase.updateUser('user-1', { firstName: 'Marie' });
            expect(result.isRight()).toBe(true);
        });

        it('retourne une erreur si l ID est vide', async () => {
            const result = await useCase.updateUser('', { firstName: 'Marie' });
            expect(result.isLeft()).toBe(true);
        });

        it('retourne une erreur si l email de mise a jour est invalide', async () => {
            const result = await useCase.updateUser('user-1', { email: 'invalide' });
            expect(result.isLeft()).toBe(true);
        });

        it('retourne une erreur si le nouveau mot de passe est trop court', async () => {
            const result = await useCase.updateUser('user-1', { password: '123' });
            expect(result.isLeft()).toBe(true);
        });
    });

    // ---------------------------------------------------------------- deleteUser
    describe('deleteUser', () => {
        it('delegue au repository si l ID est valide', async () => {
            const result = await useCase.deleteUser({ id: 'user-1' });
            expect(result.isRight()).toBe(true);
            expect(repository.deleteUser).toHaveBeenCalledWith({ id: 'user-1' });
        });

        it('retourne une erreur si l ID est vide', async () => {
            const result = await useCase.deleteUser({ id: '' });
            expect(result.isLeft()).toBe(true);
        });
    });
});
