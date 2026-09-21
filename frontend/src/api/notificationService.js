import api from './axios';

export async function getAll() {
  const response = await api.get('/notifications');
  return response.data?.data ?? [];
}

export async function getUnreadCount() {
  const response = await api.get('/notifications/unread-count');
  return response.data?.count ?? 0;
}

export async function markAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllAsRead() {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}
