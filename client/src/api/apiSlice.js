import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.user?.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Project', 'Task', 'Dashboard'],
  endpoints: (builder) => ({
    // Auth
    register: builder.mutation({
      query: (data) => ({ url: '/auth/register', method: 'POST', body: data }),
    }),
    login: builder.mutation({
      query: (data) => ({ url: '/auth/login', method: 'POST', body: data }),
    }),
    getMe: builder.query({ query: () => '/auth/me' }),

    // Projects
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProject: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (data) => ({ url: '/projects', method: 'POST', body: data }),
      invalidatesTags: ['Project', 'Dashboard'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/projects/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }, 'Project'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project', 'Dashboard'],
    }),
    addMember: builder.mutation({
      query: ({ projectId, ...data }) => ({ url: `/projects/${projectId}/members`, method: 'POST', body: data }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    removeMember: builder.mutation({
      query: ({ projectId, userId }) => ({ url: `/projects/${projectId}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),

    // Tasks
    getTasks: builder.query({
      query: ({ projectId, ...params }) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v) searchParams.set(k, v); });
        return `/projects/${projectId}/tasks?${searchParams}`;
      },
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: ({ projectId, ...data }) => ({ url: `/projects/${projectId}/tasks`, method: 'POST', body: data }),
      invalidatesTags: ['Task', 'Dashboard', 'Project'],
    }),
    updateTask: builder.mutation({
      query: ({ taskId, ...data }) => ({ url: `/tasks/${taskId}`, method: 'PUT', body: data }),
      invalidatesTags: ['Task', 'Dashboard', 'Project'],
    }),
    deleteTask: builder.mutation({
      query: (taskId) => ({ url: `/tasks/${taskId}`, method: 'DELETE' }),
      invalidatesTags: ['Task', 'Dashboard', 'Project'],
    }),

    // Dashboard
    getDashboard: builder.query({
      query: () => '/tasks/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useRegisterMutation, useLoginMutation, useGetMeQuery,
  useGetProjectsQuery, useGetProjectQuery, useCreateProjectMutation,
  useUpdateProjectMutation, useDeleteProjectMutation,
  useAddMemberMutation, useRemoveMemberMutation,
  useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation,
  useGetDashboardQuery,
} = apiSlice;
