import { configureStore } from '@reduxjs/toolkit';
import { usersReducer } from '../features/users/presentation/redux/usersSlice';
import { authReducer } from './redux/authSlice';

export const store = configureStore({
    reducer: {
        users: usersReducer,
        auth: authReducer,
        // Ajoutez vos autres reducers ici
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
