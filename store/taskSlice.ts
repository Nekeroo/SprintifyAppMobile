import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sprintService } from '@/services/sprint';
import type { Task } from '@/types/task';

type TaskState = {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: TaskState = {
  items: [],
  status: 'idle',
  error: null,
};

export const getTasks = createAsyncThunk(
  'task/getTasks',
  async (sprintName: string) => {
    return await sprintService.getTasks(sprintName);
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async ({ sprintName, data }: { sprintName: string; data: any }, { dispatch }) => {
    await sprintService.createTask(sprintName, data);
    const updatedTasks = await dispatch(getTasks(sprintName)).unwrap();
    return updatedTasks;
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erreur lors du chargement des tâches';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      });
  },
});

export default taskSlice.reducer;
