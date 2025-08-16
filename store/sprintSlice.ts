import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sprintService } from '@/services/sprint';
import type { SprintOverview } from '@/types/sprint';
import { Stat } from '@/types/stat';

type ProjectSprintsState = {
  items: SprintOverview[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

type SprintState = {
  byProject: Record<string, ProjectSprintsState>;
  statsBySprint: Record<string, {
    data: Stat | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }>;
};

const initialState: SprintState = {
  byProject: {},
  statsBySprint: {},
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
    return await dispatch(getSprints(projectName)).unwrap();
  }
);

export const deleteSprint = createAsyncThunk(
  'sprint/deleteSprint',
  async (
    { projectName, sprintName }: { projectName: string; sprintName: string },
    { dispatch }
  ) => {
    await sprintService.deleteSprint(sprintName);
    return await dispatch(getSprints(projectName)).unwrap();
  }
);

export const getSprintStats = createAsyncThunk(
  'sprint/getSprintStats',
  async (sprintName: string) => {
    const stats = await sprintService.statSprint(sprintName);
    return { sprintName, stats };
  }
);

const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(
        deleteSprint.fulfilled,
        (state, action: PayloadAction<{ projectName: string; sprints: SprintOverview[] }>) => {
          const { projectName, sprints } = action.payload;
          state.byProject[projectName] = {
            items: sprints,
            status: 'succeeded',
            error: null,
          };
        }
      )
      .addCase(getSprintStats.pending, (state, action) => {
        if (!state.statsBySprint) state.statsBySprint = {};
        const sprintName = action.meta.arg;
        state.statsBySprint[sprintName] = {
          data: null,
          status: 'loading',
          error: null,
        };
      })
      .addCase(
        getSprintStats.fulfilled,
        (state, action: PayloadAction<{ sprintName: string; stats: Stat }>) => {
          if (!state.statsBySprint) state.statsBySprint = {};
          const { sprintName, stats } = action.payload;
          state.statsBySprint[sprintName] = {
            data: stats,
            status: 'succeeded',
            error: null,
          };
        }
      )
      .addCase(getSprintStats.rejected, (state, action) => {
        if (!state.statsBySprint) state.statsBySprint = {};
        const sprintName = action.meta.arg;
        state.statsBySprint[sprintName] = {
          data: null,
          status: 'failed',
          error: action.error.message || 'Erreur lors du chargement des stats',
        };
      });
  },
});

export default sprintSlice.reducer;
