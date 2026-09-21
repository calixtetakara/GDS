import api from './axios';

export async function getAll() {
  const response = await api.get('/users');
  return response.data?.data ?? response.data;
}

export async function getById(id) {
  const response = await api.get(`/users/${id}`);
  return response.data?.data ?? response.data;
}

export async function create(data) {
  const response = await api.post('/users', data);
  return response.data;
}

export async function update(id, data) {
  const response = await api.put(`/users/${id}`, data);
  return response.data?.data ?? response.data;
}

export async function remove(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}