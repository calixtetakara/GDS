import api from './axios';

export async function getAll() {
  const response = await api.get('/interns');
  return response.data?.data ?? response.data;
}

export async function getById(id) {
  const response = await api.get(`/interns/${id}`);
  return response.data?.data ?? response.data;
}

export async function create(data) {
  const response = await api.post('/interns', data);
  return response.data;
}

export async function update(id, data) {
  const response = await api.put(`/interns/${id}`, data);
  return response.data?.data ?? response.data;
}

export async function remove(id) {
  const response = await api.delete(`/interns/${id}`);
  return response.data;
}

export async function assignSupervisor(id, supervisorId) {
  const response = await api.put(`/interns/${id}/supervisor`, { supervisor_id: supervisorId });
  return response.data?.data ?? response.data;
}
