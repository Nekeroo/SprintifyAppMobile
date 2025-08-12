import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Platform } from 'react-native';

import authReducer from './authSlice';
import projectReducer from './projectSlice';
import sprintReducer from './sprintSlice';

import AsyncStorage from '@react-native-async-storage/async-storage';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: any) {
    return Promise.resolve(value);
  },
  removeItem(_key: string) {
    return Promise.resolve();
  },
});

const isWeb = Platform.OS === 'web';

const storage = isWeb
  ? typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage()
  : AsyncStorage;

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['auth', 'project', 'sprint'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  project: projectReducer,
  sprint: sprintReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
