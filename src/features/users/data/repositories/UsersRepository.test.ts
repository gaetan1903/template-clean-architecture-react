import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersRepository } from './UsersRepository';
import { IUsersDataSource } from '../../datasources/UsersDataSource';
import { AppError } from '@core/types/AppError';
import { PaginatedArray } from '@core/types/PaginatedArray';
import { UserEntity } from '../../../domain/entities/UserEntity';

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

const makeDataSource = (): IUsersDataSource => ({
    getUsers: vi.fn().mockResolvedValue(makePaginatedUsers()),
    getUserById: vi.fn().mockResolvedValue(makeUser()),
    createUser: vi.fn().mockResolvedValue(true),
    updateUser: vi.fn().mockResolvedValue(true),
    deleteUser: vi.fn().mockResolvedValue(true),
});

// --- Tests ---

describe('UsersRepository', () => {
    let dataSource: IUsersDataSource;
    let repository: UsersRepository;

    beforeEach(() => {
        dataSource = makeDataSource();
        repository = new UsersRepository(dataSource);
    });

    // ------------------------------------------------------------------ getUsers
    describe('getUsers', () => {
        it('retourne right avec les donnees du DataSource', async () => {
            const result = await repository.getUsers({ page: 1 });

            expect(result.isRight()).toBe(true);
            if (result.isRight()) {
                expect(result.value.data).toHaveLength(1);
                expect(result.value.data[0].firstName).toBe('Jean');
            }
        });

        it('retourne left avec AppError si le DataSource throw une AppError', async () => {
            const appError = new AppError('Serveur indisponible', '503');
            vi.mocked(dataSource.getUsers).mockRejectedValue(appError);

            const result = await repository.getUsers({ page: 1 });

            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.message).toBe('Serveur indisponible');
                expect(result.value.code).toBe('503');
            }
        });

        it('retourne left avec AppError generique si le DataSource throw une erreur inconnue', async () => {
            vi.mocked(dataSource.getUsers).mockRejectedValue(new Error('Erreur reseau'));

            const result = await repository.getUsers({ page: 1 });

            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.code).toBe('000');
            }
        });
    });

    // --------------------------------------------------------------- getUserById
    describe('getUserById', () => {
        it('retourne right avec l utilisateur', async () => {
            const result = await repository.getUserById({ id: 'abc-123' });

            expect(result.isRight()).toBe(true);
            if (result.isRight()) {
                expect(result.value.email).toBe('jean.dupont@example.com');
            }
        });

        it('retourne left si le DataSource throw', async () => {
            vi.mocked(dataSource.getUserById).mockRejectedValue(
                new AppError('Utilisateur non trouve', '404')
            );

            const result = await repository.getUserById({ id: 'inexistant' });

            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.code).toBe('404');
            }
        });
    });

    // ---------------------------------------------------------------- createUser
    describe('createUser', () => {
        const validData = {
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie@example.com',
            password: 'secret123',
        };

        it('retourne right(true) si le DataSource reussit', async () => {
            const result = await repository.createUser(validData);

            expect(result.isRight()).toBe(true);
            if (result.isRight()) {
                expect(result.value).toBe(true);
            }
        });

        it('retourne left si le DataSource throw', async () => {
            vi.mocked(dataSource.createUser).mockRejectedValue(
                new AppError('Email deja utilise', '409')
            );

            const result = await repository.createUser(validData);

            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.code).toBe('409');
            }
        });
    });

    // ---------------------------------------------------------------- updateUser
    describe('updateUser', () => {
        it('retourne right(true) si le DataSource reussit', async () => {
            const result = await repository.updateUser('user-1', { firstName: 'Marie' });
            expect(result.isRight()).toBe(true);
        });

        it('retourne left si le DataSource throw', async () => {
            vi.mocked(dataSource.updateUser).mockRejectedValue(new Error('Reseau'));
            const result = await repository.updateUser('user-1', {});
            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.code).toBe('000');
            }
        });
    });

    // ---------------------------------------------------------------- deleteUser
    describe('deleteUser', () => {
        it('retourne right(true) si le DataSource reussit', async () => {
            const result = await repository.deleteUser({ id: 'user-1' });
            expect(result.isRight()).toBe(true);
        });

        it('retourne left si le DataSource throw', async () => {
            vi.mocked(dataSource.deleteUser).mockRejectedValue(
                new AppError('Interdit', '403')
            );
            const result = await repository.deleteUser({ id: 'user-1' });
            expect(result.isLeft()).toBe(true);
            if (result.isLeft()) {
                expect(result.value.code).toBe('403');
            }
        });
    });
});
