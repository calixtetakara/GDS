import api from './axios';

export async function getAll() {
  const response = await api.get('/tasks');
  return response.data?.data ?? response.data;
}

export async function getById(id) {
  const response = await api.get(`/tasks/${id}`);
  return response.data?.data ?? response.data;
}

export async function create(data) {
  const response = await api.post('/tasks', data);
  return response.data?.data ?? response.data;
}

export async function update(id, data) {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data?.data ?? response.data;
}

export async function remove(id) {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
}