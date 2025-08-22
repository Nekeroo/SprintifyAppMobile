import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth';
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: Status;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

// Actions async
export const bootstrap = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) return null;
    return await authService.getMe();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const login = createAsyncThunk('auth/login', async (payload: LoginCredentials, { rejectWithValue }) => {
  try {
    await authService.login(payload);
    return await authService.getMe();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload: RegisterCredentials, { rejectWithValue }) => {
  try {
    await authService.register(payload);
    return await authService.getMe();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // bootstrap
      .addCase(bootstrap.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(bootstrap.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(bootstrap.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
        state.error = null;
      });
  },
});

export default authSlice.reducer;
