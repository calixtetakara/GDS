import api from './axios';

export async function getAll() {
  const response = await api.get('/supervisors');
  return response.data?.data ?? response.data;
}

export async function getById(id) {
  const response = await api.get(`/supervisors/${id}`);
  return response.data?.data ?? response.data;
}

export async function create(data) {
  const response = await api.post('/supervisors', data);
  return response.data;
}

export async function update(id, data) {
  const response = await api.put(`/supervisors/${id}`, data);
  return response.data?.data ?? response.data;
}

export async function remove(id) {
  const response = await api.delete(`/supervisors/${id}`);
  return response.data;
}