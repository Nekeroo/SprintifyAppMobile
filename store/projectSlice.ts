import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { projectService } from '@/services/project';
import type { ProjectOverview, ProjectDetails } from '@/types/project';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ProjectState {
  list: ProjectOverview[];
  listStatus: Status;
  listError: string | null;

  detailsByName: Record<string, ProjectDetails | undefined>;
  detailsStatusByName: Record<string, Status>;
  detailsErrorByName: Record<string, string | null>;
}

const initialState: ProjectState = {
  list: [],
  listStatus: 'idle',
  listError: null,
  detailsByName: {},
  detailsStatusByName: {},
  detailsErrorByName: {},
};

// Actions async
export const getAllProjects = createAsyncThunk('project/getAll', async (_, { rejectWithValue }) => {
  try {
    return await projectService.getAllProjects();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const getProjectDetails = createAsyncThunk(
  'project/getDetails',
  async ({ name }: { name: string }, { rejectWithValue }) => {
    try {
      return { name, details: await projectService.getProjectDetails(name) };
    } catch (err: any) {
      return rejectWithValue({ name, error: err.message });
    }
  }
);

export const createProject = createAsyncThunk(
  'project/create',
  async (data: Parameters<typeof projectService.createProject>[0], { rejectWithValue }) => {
    try {
      return await projectService.createProject(data);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    resetProjects: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllProjects.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action: PayloadAction<ProjectOverview[]>) => {
        state.list = action.payload;
        state.listStatus = 'succeeded';
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload as string;
      })
      .addCase(getProjectDetails.pending, (state, action) => {
        const name = (action.meta.arg as { name: string }).name;
        state.detailsStatusByName[name] = 'loading';
        state.detailsErrorByName[name] = null;
      })
      .addCase(getProjectDetails.fulfilled, (state, action) => {
        state.detailsByName[action.payload.name] = action.payload.details;
        state.detailsStatusByName[action.payload.name] = 'succeeded';
      })
      .addCase(getProjectDetails.rejected, (state, action) => {
        const name = (action.meta.arg as { name: string }).name;
        state.detailsStatusByName[name] = 'failed';
        state.detailsErrorByName[name] = (action.payload as { error: string })?.error ?? 'Erreur';
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<ProjectOverview>) => {
        state.list.unshift(action.payload);
      });
  },
});

export const { resetProjects } = projectSlice.actions;
export default projectSlice.reducer;
