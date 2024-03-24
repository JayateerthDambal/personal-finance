import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { userAuthAPI } from '../services/userAuthAPI';
import authReducer from '../features/authSlice';

export const store = configureStore({
    reducer: {
        [userAuthAPI.reducerPath]: userAuthAPI.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(userAuthAPI.middleware),
})

setupListeners(store.dispatch)