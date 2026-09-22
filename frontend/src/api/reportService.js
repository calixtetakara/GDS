import api from './axios';

// ---------- CRUD ----------

export async function getAll() {
  const response = await api.get('/reports');
  return response.data?.data ?? response.data;
}

export async function getById(id) {
  const response = await api.get(`/reports/${id}`);
  return response.data?.data ?? response.data;
}

export async function create(data, fichier = null) {
  const formData = new FormData();
  formData.append('week', data.week);
  formData.append('submission_date', data.submission_date);
  formData.append('content', data.content);
  if (fichier) formData.append('document', fichier);
  const response = await api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data ?? response.data;
}

export async function update(id, data) {
  const response = await api.put(`/reports/${id}`, data);
  return response.data?.data ?? response.data;
}

export async function updateStatus(id, status, comment) {
  const response = await api.patch(`/reports/${id}/status`, { status, comment });
  return response.data?.data ?? response.data;
}

export async function remove(id) {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
}

// ---------- Téléchargements PDF ----------

function telechargerBlob(blob, nomFichier) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    a.remove();
  }, 100);
}

function extraireNomFichier(headers, fallback) {
  const disposition = headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  return match ? match[1] : fallback;
}

export async function getPdf(id) {
  const response = await api.get(`/reports/${id}/pdf`, {
    responseType: 'blob',
  });
  const nom = extraireNomFichier(response.headers, `rapport-${id}.pdf`);
  telechargerBlob(response.data, nom);
}

export async function getAllPdf() {
  const response = await api.get('/reports/export-pdf', {
    responseType: 'blob',
  });
  const nom = extraireNomFichier(response.headers, 'mes-rapports.pdf');
  telechargerBlob(response.data, nom);
}

export async function getInternPdf(internId) {
  const response = await api.get(`/reports/intern/${internId}/pdf`, {
    responseType: 'blob',
  });
  const nom = extraireNomFichier(response.headers, `suivi-stagiaire-${internId}.pdf`);
  telechargerBlob(response.data, nom);
}

export async function downloadDocument(id) {
  const response = await api.get(`/reports/${id}/document`, {
    responseType: 'blob',
  });
  const nom = extraireNomFichier(response.headers, `document-${id}`);
  telechargerBlob(response.data, nom);
}