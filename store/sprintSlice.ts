import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sprintService } from '@/services/sprint';
import type { SprintOverview } from '@/types/sprint';
import type { Task } from '@/types/task';

type ProjectSprintsState = {
  items: SprintOverview[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

type TasksState = {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

type SprintState = {
  byProject: Record<string, ProjectSprintsState>;
  tasks: TasksState;
};

const initialState: SprintState = {
  byProject: {},
  tasks: {
    items: [],
    status: 'idle',
    error: null
  }
};

export const getSprints = createAsyncThunk(
  'sprint/getSprints',
  async (projectName: string) => {
    const sprints = await sprintService.getSprints(projectName);
    return { projectName, sprints };
  }
);

export const createSprint = createAsyncThunk(
  'sprint/createSprint',
  async (
    { projectName, data }: { projectName: string; data: any },
    { dispatch }
  ) => {
    
    await sprintService.createSprint(projectName, data);

    const { sprints } = await dispatch(getSprints(projectName)).unwrap();

    return sprints;
  }
);

export const getTasks = createAsyncThunk(
  'sprint/getTasks',
  async (sprintName: string) => {
    const tasks = await sprintService.getTasks(sprintName);
    return tasks;
  }
);

export const updateTask = createAsyncThunk(
  'sprint/updateTask',
  async ({ sprintName, task }: { sprintName: string; task: Task }, { dispatch }) => {
    await sprintService.updateTask(task.title, {
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      usernameAssignee: task.usernameAssignee,
      storyPoints: task.storyPoints,
    });
    const tasks = await dispatch(getTasks(sprintName)).unwrap();
    return tasks;
  }
);

export const createTask = createAsyncThunk(
  'sprint/createTask',
  async ({ sprintName, task }: { sprintName: string; task: Omit<Task, 'id'> }, { dispatch }) => {
    await sprintService.createTask(sprintName, {
      name: task.title,
      description: task.description,
      dueDate: task.dueDate || '',
      storyPoints: task.storyPoints,
      assignee: task.usernameAssignee,
    });
    const tasks = await dispatch(getTasks(sprintName)).unwrap();
    return tasks;
  }
);

const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Gestion des sprints par projet
      .addCase(getSprints.pending, (state, action) => {
        const projectName = action.meta.arg;
        if (!state.byProject[projectName]) {
          state.byProject[projectName] = {
            items: [],
            status: 'idle',
            error: null,
          };
        }
        state.byProject[projectName].status = 'loading';
        state.byProject[projectName].error = null;
      })
      .addCase(
        getSprints.fulfilled,
        (state, action: PayloadAction<{ projectName: string; sprints: SprintOverview[] }>) => {
          const { projectName, sprints } = action.payload;
          state.byProject[projectName] = {
            items: sprints,
            status: 'succeeded',
            error: null,
          };
        }
      )
      .addCase(getSprints.rejected, (state, action) => {
        const projectName = action.meta.arg;
        if (!state.byProject[projectName]) {
          state.byProject[projectName] = {
            items: [],
            status: 'failed',
            error: action.error.message || 'Erreur lors du chargement des sprints',
          };
        } else {
          state.byProject[projectName].status = 'failed';
          state.byProject[projectName].error =
            action.error.message || 'Erreur lors du chargement des sprints';
        }
      })
      .addCase(
        createSprint.fulfilled,
        (state, action: PayloadAction<{ projectName: string; sprints: SprintOverview[] }>) => {
          const { projectName, sprints } = action.payload;
          state.byProject[projectName] = {
            items: sprints,
            status: 'succeeded',
            error: null,
          };
        }
      )
      // Gestion des tâches
      .addCase(getTasks.pending, (state) => {
        if (!state.tasks) {
          state.tasks = {
            items: [],
            status: 'idle',
            error: null
          };
        }
        state.tasks.status = 'loading';
        state.tasks.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        if (!state.tasks) {
          state.tasks = {
            items: [],
            status: 'idle',
            error: null
          };
        }
        state.tasks = {
          items: action.payload,
          status: 'succeeded',
          error: null,
        };
      })
      .addCase(getTasks.rejected, (state, action) => {
        if (!state.tasks) {
          state.tasks = {
            items: [],
            status: 'idle',
            error: null
          };
        }
        state.tasks.status = 'failed';
        state.tasks.error = action.error.message || 'Erreur lors du chargement des tâches';
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
        if (!state.tasks) {
          state.tasks = {
            items: [],
            status: 'idle',
            error: null
          };
        }
        state.tasks.items = action.payload;
        state.tasks.status = 'succeeded';
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task[]>) => {
        if (!state.tasks) {
          state.tasks = {
            items: [],
            status: 'idle',
            error: null
          };
        }
        state.tasks.items = action.payload;
        state.tasks.status = 'succeeded';
      });
  },
});

export default sprintSlice.reducer;
