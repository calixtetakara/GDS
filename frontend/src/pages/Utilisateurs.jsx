import { useEffect, useState } from "react";
import { Users, ShieldCheck, UserRoundPlus, Trash2, PencilLine, RefreshCw } from "lucide-react";
import * as userService from "../api/userService";
import CredentialsModal from "../components/CredentialsModal";

function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    status: "Active",
    role: "Stagiaire",
    position: "",
    date_of_birth: "",
    training: "",
    institution: "",
    level: "",
    supervisor_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [identifiantsCrees, setIdentifiantsCrees] = useState(null);
  const [erreur, setErreur] = useState("");
  const [charger, setCharger] = useState(true);

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  async function chargerUtilisateurs() {
    setCharger(true);
    try {
      const data = await userService.getAll();
      setUtilisateurs(data.map((u) => ({ ...u, role: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : "—" })));
    } catch {
      setErreur("Impossible de charger les utilisateurs.");
    } finally {
      setCharger(false);
    }
  }

  function ouvrirAjout() {
    setForm({ first_name: "", last_name: "", email: "", password: "", phone: "", status: "Active", role: "Stagiaire", position: "", date_of_birth: "", training: "", institution: "", level: "", supervisor_id: "" });
    setEditingId(null);
    setShowForm(true);
    setErreur("");
  }

  function ouvrirEdition(user) {
    setForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      password: "",
      phone: user.phone ?? "",
      status: user.status ?? "Active",
      role: user.role === "—" ? "Stagiaire" : user.role,
      position: user.supervisor?.position ?? "",
      date_of_birth: user.intern?.date_of_birth?.slice(0, 10) ?? "",
      training: user.intern?.training ?? "",
      institution: user.intern?.institution ?? "",
      level: user.intern?.level ?? "",
      supervisor_id: user.intern?.supervisor_id ? String(user.intern.supervisor_id) : "",
    });
    setEditingId(user.id);
    setShowForm(true);
    setErreur("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      password: form.password || undefined,
      phone: form.phone.trim() || undefined,
      status: form.status,
      role: form.role,
    };

    if (form.role === "Encadreur") payload.position = form.position.trim();
    if (form.role === "Stagiaire") {
      payload.date_of_birth = form.date_of_birth;
      payload.training = form.training.trim();
      payload.institution = form.institution.trim();
      payload.level = form.level.trim();
      if (form.supervisor_id) payload.supervisor_id = Number(form.supervisor_id);
    }

    try {
      if (editingId) {
        await userService.update(editingId, payload);
      } else {
        const nouveau = await userService.create(payload);
        setIdentifiantsCrees({
          email: form.email.trim(),
          motDePasse: nouveau?.temporary_password ?? form.password,
          nom: `${form.first_name.trim()} ${form.last_name.trim()}`,
          emailEnvoye: !form.password,
        });
      }
      setShowForm(false);
      setErreur("");
      await chargerUtilisateurs();
    } catch (err) {
      const dataErr = err.response?.data?.errors;
      setErreur(dataErr ? Object.values(dataErr).flat().join(" ") : (err.response?.data?.message ?? "Une erreur est survenue."));
    }
  }

  async function handleDelete(id) {
    const user = utilisateurs.find((u) => u.id === id);
    if (!user) return;
    const ok = window.confirm(`Supprimer l'utilisateur ${user.first_name} ${user.last_name} ?`);
    if (!ok) return;

    try {
      await userService.remove(id);
      await chargerUtilisateurs();
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Impossible de supprimer l'utilisateur.");
    }
  }

  const champClasse = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const actifs = utilisateurs.filter((u) => u.status !== "Archivé").length;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Administration</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">Utilisateurs</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={chargerUtilisateurs} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <RefreshCw size={14} />
            Actualiser
          </button>
          <button onClick={ouvrirAjout} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700">
            <UserRoundPlus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {erreur && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erreur}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={18} />
          </div>
          <p className="text-3xl font-black text-slate-900">{utilisateurs.length}</p>
          <p className="mt-1 text-sm text-slate-500">Utilisateurs enregistrés</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck size={18} />
          </div>
          <p className="text-3xl font-black text-slate-900">{actifs}</p>
          <p className="mt-1 text-sm text-slate-500">Comptes actifs</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <UserRoundPlus size={18} />
          </div>
          <p className="text-3xl font-black text-slate-900">{utilisateurs.filter((u) => u.role === "Stagiaire").length}</p>
          <p className="mt-1 text-sm text-slate-500">Comptes stagiaires</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">{editingId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <input required placeholder="Prénom" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={champClasse} />
            <input required placeholder="Nom" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={champClasse} />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={champClasse} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={champClasse}>
              <option value="Admin">Admin</option>
              <option value="Encadreur">Encadreur</option>
              <option value="Stagiaire">Stagiaire</option>
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={champClasse}>
              <option value="Active">Active</option>
              <option value="Archivé">Archivé</option>
            </select>
            {!editingId && <input type="password" placeholder="Mot de passe (optionnel, sinon généré)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={champClasse} />}
          </div>

          {form.role === "Encadreur" && (
            <input placeholder="Position / spécialité" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={`${champClasse} mt-4`} />
          )}

          {form.role === "Stagiaire" && (
            <div className="mt-4 grid gap-4 md:grid-cols-5">
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className={champClasse} />
              <input placeholder="Formation" value={form.training} onChange={(e) => setForm({ ...form, training: e.target.value })} className={champClasse} />
              <input placeholder="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className={champClasse} />
              <input placeholder="Niveau" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={champClasse} />
              <input type="number" placeholder="Encadreur (id)" value={form.supervisor_id} onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })} className={champClasse} />
            </div>
          )}

          <div className="mt-5 flex items-center gap-2">
            <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700">
              {editingId ? "Enregistrer" : "Créer"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{user.first_name} {user.last_name}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.status !== "Archivé" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {user.status !== "Archivé" ? "Actif" : "Archivé"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => ouvrirEdition(user)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-slate-300 hover:text-slate-800"><PencilLine size={14} /></button>
                    <button onClick={() => handleDelete(user.id)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {charger ? (
          <p className="p-6 text-center text-sm text-slate-400">Chargement...</p>
        ) : (
          utilisateurs.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Aucun utilisateur.</p>
        )}
      </div>

      {identifiantsCrees && (
        <CredentialsModal
          email={identifiantsCrees.email}
          motDePasse={identifiantsCrees.motDePasse}
          nom={identifiantsCrees.nom}
          onFermer={() => setIdentifiantsCrees(null)}
        />
      )}
    </div>
  );
}

export default Utilisateurs;