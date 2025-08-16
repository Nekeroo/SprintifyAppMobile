import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectService } from '@/services/project';
import type { ProjectOverview, ProjectDetails } from '@/types/project';

type ProjectState = {
  items: ProjectOverview[];
  selectedProject: ProjectDetails | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: ProjectState = {
  items: [],
  selectedProject: null,
  status: 'idle',
  error: null,
};

export const getProjects = createAsyncThunk(
  'project/getProjects',
  async () => {
    return await projectService.getAllProjects();
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (data: any, { dispatch }) => {
    await projectService.createProject(data);
    const updatedProjects = await dispatch(getProjects()).unwrap();
    return updatedProjects;
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectName: string, { dispatch }) => {
    await projectService.deleteProject(projectName);
    const updatedProjects = await dispatch(getProjects()).unwrap();
    return { updatedProjects, deletedName: projectName };
  }
);

export const getProjectDetails = createAsyncThunk(
  'project/getProjectDetails',
  async (projectName: string) => {
    return await projectService.getProjectDetails(projectName);
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Liste de projets
      .addCase(getProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erreur lors du chargement des projets';
      })

      // Création de projet
      .addCase(createProject.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })

      // Détails d’un projet
      .addCase(getProjectDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProjectDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedProject = action.payload;
      })
      .addCase(getProjectDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erreur lors de la récupération des détails du projet';
      })
      .addCase(deleteProject.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        const { updatedProjects, deletedName } = action.payload as {
          updatedProjects: ProjectOverview[];
          deletedName: string;
        };
        state.items = updatedProjects;
        state.status = 'succeeded';

        if (state.selectedProject && state.selectedProject.name === deletedName) {
          state.selectedProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erreur lors de la suppression du projet';
      });
  },
});

export default projectSlice.reducer;
