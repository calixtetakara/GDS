import api from './axios';

const correspondanceRole = {
  Admin: 'administrateur',
  Encadreur: 'encadreur',
  Stagiaire: 'stagiaire',
};

export function normaliserRole(roles) {
  const roleApi = Array.isArray(roles) && roles.length > 0 ? roles[0] : (roles || '');
  return correspondanceRole[roleApi] || (roleApi ? roleApi.toLowerCase() : 'stagiaire');
}

export function formaterUtilisateur(apiUser) {
  return {
    id: apiUser.id,
    nom: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.email,
    email: apiUser.email,
    role: normaliserRole(apiUser.roles),
    internId: apiUser.intern?.id ?? null,
    supervisorId: apiUser.supervisor?.id ?? null,
    permissions: (apiUser.permissions || []),
  };
}

export async function login(email, password) {
  const response = await api.post('/login', { email, password });
  const { user, token } = response.data;
  const utilisateur = formaterUtilisateur(user);
  localStorage.setItem('token', token);
  localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
  return utilisateur;
}

export async function fetchUtilisateur() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const response = await api.get('/user');
  const utilisateur = formaterUtilisateur(response.data?.user ?? response.data);
  localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
  return utilisateur;
}

export function logout() {
  const token = localStorage.getItem('token');
  if (token) {
    api.post('/logout').catch(() => {});
  }
  localStorage.removeItem('token');
  localStorage.removeItem('utilisateur');
}

export function getUtilisateur() {
  const data = localStorage.getItem('utilisateur');
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export async function updateProfile(data) {
  const response = await api.put('/profile', data);
  return response.data?.data ?? response.data;
}
