import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sprintService } from '@/services/sprint';
import type { Sprint, SprintOverview } from '@/types/sprint';
import type { Task, TasksByStatus } from '@/types/task';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface SprintState {
  byProject: Record<string, { items: SprintOverview[]; status: Status; error: string | null }>;
  tasksBySprint: Record<string, { items: Task[]; organized: TasksByStatus; status: Status; error: string | null }>;
}

const initialState: SprintState = {
  byProject: {},
  tasksBySprint: {},
};

// Async actions
export const getSprints = createAsyncThunk(
  'sprint/getSprints',
  async ({ projectName }: { projectName: string }, { rejectWithValue }) => {
    try {
      return { projectName, items: await sprintService.getSprints(projectName) };
    } catch (err: any) {
      return rejectWithValue({ projectName, error: err.message });
    }
  }
);

export const createSprint = createAsyncThunk(
  'sprint/createSprint',
  async ({ projectName, data }: { projectName: string; data: { name: string; description: string; startDate: string; endDate: string } }, { dispatch, rejectWithValue }) => {
    try {
      await sprintService.createSprint(projectName, data);
      // recharge la liste
      await dispatch(getSprints({ projectName }));
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getTasks = createAsyncThunk(
  'sprint/getTasks',
  async ({ sprintName }: { sprintName: string }, { rejectWithValue }) => {
    try {
      const items = await sprintService.getTasks(sprintName);
      return { sprintName, items, organized: sprintService.organizeTasksByStatus(items) };
    } catch (err: any) {
      return rejectWithValue({ sprintName, error: err.message });
    }
  }
);

export const createTask = createAsyncThunk(
  'sprint/createTask',
  async ({ sprintName, data }: { sprintName: string; data: any }, { dispatch, rejectWithValue }) => {
    try {
      await sprintService.createTask(sprintName, data);
      await dispatch(getTasks({ sprintName }));
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'sprint/updateTask',
  async ({ taskName, updatedTask }: { taskName: string; updatedTask: any }, { rejectWithValue }) => {
    try {
      await sprintService.updateTask(taskName, updatedTask);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {
    resetSprints: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSprints.pending, (state, action) => {
        const projectName = (action.meta.arg as { projectName: string }).projectName;
        state.byProject[projectName] = { items: [], status: 'loading', error: null };
      })
      .addCase(getSprints.fulfilled, (state, action) => {
        const { projectName, items } = action.payload;
        state.byProject[projectName] = { items, status: 'succeeded', error: null };
      })
      .addCase(getSprints.rejected, (state, action) => {
        const projectName = (action.meta.arg as { projectName: string }).projectName;
        state.byProject[projectName] = { items: [], status: 'failed', error: (action.payload as any)?.error || 'Erreur' };
      })
      .addCase(getTasks.pending, (state, action) => {
        const sprintName = (action.meta.arg as { sprintName: string }).sprintName;
        state.tasksBySprint[sprintName] = { items: [], organized: {}, status: 'loading', error: null };
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        const { sprintName, items, organized } = action.payload;
        state.tasksBySprint[sprintName] = { items, organized, status: 'succeeded', error: null };
      })
      .addCase(getTasks.rejected, (state, action) => {
        const sprintName = (action.meta.arg as { sprintName: string }).sprintName;
        state.tasksBySprint[sprintName] = { items: [], organized: {}, status: 'failed', error: (action.payload as any)?.error || 'Erreur' };
      });
  },
});

export const { resetSprints } = sprintSlice.actions;
export default sprintSlice.reducer;
