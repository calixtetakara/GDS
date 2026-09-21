import { useEffect, useMemo, useState } from "react";
import { FolderKanban, Plus, Users, PencilLine, Trash2, Search, Eye, User } from "lucide-react";
import * as projectService from "../api/projectService";
import * as internService from "../api/internService";

function Projets({ utilisateur }) {
  const [projets, setProjets] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [form, setForm] = useState({ nom: "", description: "", statut: "En cours", start_date: "", end_date: "", intern_ids: [] });
  const [recherche, setRecherche] = useState("");
  const [selectionne, setSelectionne] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);

  const peutGerer = utilisateur?.role === "administrateur";

  useEffect(() => {
    chargerProjets();
    if (peutGerer) {
      internService
        .getAll()
        .then((data) => setStagiaires(data))
        .catch(() => {});
    }
  }, []);

  async function chargerProjets() {
    setChargement(true);
    try {
      const data = await projectService.getAll();
      setProjets(
        data.map((p) => ({
          id: p.id,
          nom: p.name,
          description: p.description,
          statut: p.status,
          stagiaires: p.interns?.length ?? 0,
          intern_ids: p.interns?.map((i) => i.id) ?? [],
          interns: p.interns ?? [],
          start_date: p.start_date,
          end_date: p.end_date,
        }))
      );
      setSelectionne((prev) => (prev && data.some((p) => p.id === prev) ? prev : null));
    } catch {
      setErreur("Impossible de charger les projets.");
    } finally {
      setChargement(false);
    }
  }

  const projetsFiltres = useMemo(() => {
    return projets.filter((projet) => `${projet.nom} ${projet.description}`.toLowerCase().includes(recherche.toLowerCase()));
  }, [projets, recherche]);

  const projetSelectionne = projets.find((p) => p.id === selectionne) || projetsFiltres[0] || null;

  function togglerStagiaire(id) {
    setForm((prev) => {
      const interns = prev.intern_ids.includes(id) ? prev.intern_ids.filter((x) => x !== id) : [...prev.intern_ids, id];
      return { ...prev, intern_ids: interns };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { nom, description, statut, start_date, end_date, intern_ids } = form;

    if (!nom.trim() || !description.trim() || !start_date || !end_date) {
      setErreur("Le nom, la description et les dates sont obligatoires.");
      return;
    }

    try {
      if (editingId) {
        await projectService.update(editingId, {
          name: nom.trim(),
          description: description.trim(),
          status: statut,
          start_date,
          end_date,
          intern_ids,
        });
      } else {
        const nouveau = await projectService.create({
          name: nom.trim(),
          description: description.trim(),
          status: statut,
          start_date,
          end_date,
          intern_ids,
        });
        setSelectionne(nouveau.id);
      }
      setForm({ nom: "", description: "", statut: "En cours", start_date: "", end_date: "", intern_ids: [] });
      setEditingId(null);
      setErreur("");
      await chargerProjets();
    } catch (err) {
      const dataErr = err.response?.data?.errors;
      setErreur(dataErr ? Object.values(dataErr).flat().join(" ") : (err.response?.data?.message ?? "Une erreur est survenue."));
    }
  }

  function handleEdit(projet) {
    setForm({ nom: projet.nom, description: projet.description, statut: projet.statut, start_date: projet.start_date?.slice(0, 10) ?? "", end_date: projet.end_date?.slice(0, 10) ?? "", intern_ids: projet.intern_ids ?? [] });
    setEditingId(projet.id);
    setSelectionne(projet.id);
  }

  async function handleDelete(id) {
    const projet = projets.find((p) => p.id === id);
    if (!projet) return;

    const ok = window.confirm(`Supprimer le projet ${projet.nom} ?`);
    if (!ok) return;

    try {
      await projectService.remove(id);
      setSelectionne((prev) => (prev === id ? null : prev));
      await chargerProjets();
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Impossible de supprimer le projet.");
    }
  }

  function nomEncadreur(stagiaire) {
    const s = stagiaire.supervisor;
    if (!s?.user) return "—";
    return `${s.user.first_name} ${s.user.last_name}`;
  }

  const champClasse = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClasse = "mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500";

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Gestion</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">Projets</h2>
        </div>
        <button onClick={chargerProjets} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Actualiser
        </button>
      </div>

      {peutGerer && (
        <div className="mb-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800">{editingId ? "Modifier le projet" : "Créer un projet"}</h3>

            <div className="grid gap-4">
              <div>
                <label className={labelClasse}>Nom du projet</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Refonte du site web" className={champClasse} />
              </div>

              <div>
                <label className={labelClasse}>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails du projet..." className={champClasse} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClasse}>Date de début</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={champClasse} />
                </div>
                <div>
                  <label className={labelClasse}>Date de fin</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={champClasse} />
                </div>
              </div>

              <div>
                <label className={labelClasse}>Statut</label>
                <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className={champClasse}>
                  <option value="En cours">En cours</option>
                  <option value="À valider">À valider</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>

              {stagiaires.length > 0 && (
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="mb-2 text-sm font-medium text-slate-600">Stagiaires affectés</p>
                  <div className="flex flex-wrap gap-2">
                    {stagiaires.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => togglerStagiaire(s.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${form.intern_ids.includes(s.id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      >
                        {s.user?.first_name} {s.user?.last_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {erreur && <p className="mt-4 text-sm text-red-600">{erreur}</p>}

            <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700">
              <Plus size={16} />
              {editingId ? "Enregistrer" : "Ajouter"}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Search size={16} />
              <span className="text-sm font-medium">Recherche</span>
            </div>
            <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un projet..." className="mt-4 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="grid gap-5 md:grid-cols-2">
          {chargement ? (
            <p className="text-sm text-slate-400">Chargement...</p>
          ) : (
            projetsFiltres.map((projet) => (
              <div key={projet.id} className={`rounded-2xl border p-5 shadow-sm ${selectionne === projet.id ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200 bg-white"}`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderKanban size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{projet.nom}</h3>
                <p className="mt-2 text-sm text-slate-500">{projet.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{projet.statut}</span>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <Users size={14} />
                    {projet.stagiaires}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => setSelectionne(projet.id)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-slate-300 hover:text-slate-800"><Eye size={14} /></button>
                  {peutGerer && (
                    <>
                      <button onClick={() => handleEdit(projet)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-slate-300 hover:text-slate-800"><PencilLine size={14} /></button>
                      <button onClick={() => handleDelete(projet.id)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {projetSelectionne ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                <FolderKanban size={22} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-800">{projetSelectionne.nom}</h3>
              <p className="mt-2 text-sm text-slate-500">{projetSelectionne.description}</p>

              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Statut</span>
                  <span className="font-medium text-slate-800">{projetSelectionne.statut}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Début</span>
                  <span className="font-medium text-slate-800">{projetSelectionne.start_date?.slice(0, 10) ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Fin</span>
                  <span className="font-medium text-slate-800">{projetSelectionne.end_date?.slice(0, 10) ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Stagiaires</span>
                  <span className="font-medium text-slate-800">{projetSelectionne.stagiaires}</span>
                </div>
              </div>

              {projetSelectionne.interns.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Encadrants affectés</p>
                  <div className="space-y-2">
                    {[...new Map(projetSelectionne.interns.filter((i) => i.supervisor).map((i) => [i.supervisor.id, i.supervisor])).values()].map((s) => (
                      <div key={s.id} className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{s.user?.first_name} {s.user?.last_name}</p>
                          <p className="text-[10px] text-slate-500">Encadreur</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-400">Aucun projet sélectionné.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Projets;