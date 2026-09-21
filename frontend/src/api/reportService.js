import api from './axios';

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

export async function getPdf(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/reports/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du téléchargement');
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  const nomFichier = match ? match[1] : `rapport-${id}.pdf`;
  telechargerBlob(blob, nomFichier);
}

export async function getAllPdf() {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/reports/export-pdf', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du téléchargement');
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  const nomFichier = match ? match[1] : 'mes-rapports.pdf';
  telechargerBlob(blob, nomFichier);
}

export async function downloadDocument(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/reports/${id}/document`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du téléchargement');
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  const nomFichier = match ? match[1] : `document-${id}.pdf`;
  telechargerBlob(blob, nomFichier);
}

export async function getInternPdf(internId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/reports/intern/${internId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du téléchargement');
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  const nomFichier = match ? match[1] : `suivi-stagiaire-${internId}.pdf`;
  telechargerBlob(blob, nomFichier);
}