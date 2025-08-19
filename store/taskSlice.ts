import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskService } from '@/services/task';
import { Task, TaskCreationPayload } from '@/types/task';

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
    return await taskService.getTasks(sprintName);
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ sprintName, task }: { sprintName: string; task: TaskCreationPayload }, { rejectWithValue }) => {
    try {
      await taskService.createTask(sprintName, task);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ sprintName, task }: { sprintName: string; task: Task }, { dispatch }) => {
    await taskService.updateTask(task.title, {
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      usernameAssignee: task.usernameAssignee,
      storyPoints: task.storyPoints,
    });
    return await dispatch(getTasks(sprintName)).unwrap();
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async ({ sprintName, taskTitle }: { sprintName: string; taskTitle: string }, { dispatch }) => {
    await taskService.deleteTask(taskTitle);
    return await dispatch(getTasks(sprintName)).unwrap();
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
      .addCase(getTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erreur lors du chargement des tâches';
      })

      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })

      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      });
  },
});

export default taskSlice.reducer;
