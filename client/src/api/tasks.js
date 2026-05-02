import axiosInstance from './axiosInstance';

export const getTasksByProject = async (projectId) => {
  const response = await axiosInstance.get(`/tasks/project/${projectId}`);
  return response.data;
};

export const createTask = async (projectId, taskData) => {
  const response = await axiosInstance.post(`/tasks/project/${projectId}`, taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axiosInstance.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(`/tasks/${id}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await axiosInstance.get('/dashboard');
  return response.data;
};
