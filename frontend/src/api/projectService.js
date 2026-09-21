import api from './axios';

export async function getAll() {
  const response = await api.get('/projects');
  return response.data?.data ?? response.data;
}

export async function getById(id) {
  const response = await api.get(`/projects/${id}`);
  return response.data?.data ?? response.data;
}

export async function create(data) {
  const response = await api.post('/projects', data);
  return response.data?.data ?? response.data;
}

export async function update(id, data) {
  const response = await api.put(`/projects/${id}`, data);
  return response.data?.data ?? response.data;
}

export async function remove(id) {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
}

export async function attachInterns(id, internIds) {
  const response = await api.post(`/projects/${id}/interns`, { intern_ids: internIds });
  return response.data?.data ?? response.data;
}

export async function detachIntern(id, internId) {
  const response = await api.delete(`/projects/${id}/interns/${internId}`);
  return response.data?.data ?? response.data;
}