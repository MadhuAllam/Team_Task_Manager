import axiosInstance from './axiosInstance';

export const loginCall = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const signupCall = async (userData) => {
  const response = await axiosInstance.post('/auth/signup', userData);
  return response.data;
};

export const getMeCall = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
