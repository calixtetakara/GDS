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

// ============================================================
// IMPORT / EXPORT CSV
// ============================================================

/**
 * Télécharge le modèle CSV à remplir pour l'import en masse.
 */
export async function downloadTemplate() {
  const response = await api.get('/tasks/template', {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: 'text/csv;charset=utf-8' })
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `modele-taches-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Importe un lot de tâches depuis un fichier CSV.
 * Retourne : { success, crees, erreurs, message }
 */
export async function importTaches(fichier) {
  const formData = new FormData();
  formData.append('fichier', fichier);

  const response = await api.post('/tasks/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}