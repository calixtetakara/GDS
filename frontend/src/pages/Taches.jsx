import { useEffect, useState } from "react";
import { CheckSquare, PencilLine, Trash2, Plus, UserRound, Users } from "lucide-react";
import * as taskService from "../api/taskService";
import * as projectService from "../api/projectService";
import * as internService from "../api/internService";

function Taches({ utilisateur }) {
  const [taches, setTaches] = useState([]);
  const [projets, setProjets] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [form, setForm] = useState({ titre: "", projet_id: "", stagiaire_id: "", statut: "À faire", start_date: "", end_date: "" });
  const [editingId, setEditingId] = useState(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);

  const role = utilisateur?.role || "stagiaire";

  useEffect(() => {
    chargerTaches();
    projectService
      .getAll()
      .then((data) => setProjets(data))
      .catch(() => {});
    if (role === "administrateur") {
      internService
        .getAll()
        .then((data) => setStagiaires(data))
        .catch(() => {});
    }
  }, []);

  async function chargerTaches() {
    setChargement(true);
    try {
      const data = await taskService.getAll();
      setTaches(
        data.map((t) => ({
          id: t.id,
          titre: t.name,
          statut: t.status,
          projet: t.project?.name ?? "",
          projet_id: t.project_id,
          stagiaire_id: t.intern_id ?? null,
          stagiaire: t.intern?.user ? `${t.intern.user.first_name} ${t.intern.user.last_name}` : null,
          start_date: t.start_date?.slice(0, 10) ?? "",
          end_date: t.end_date?.slice(0, 10) ?? "",
          equipe: t.project?.interns ?? [],
        }))
      );
    } catch {
      setErreur("Impossible de charger les tâches.");
    } finally {
      setChargement(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.titre.trim() || !form.projet_id) {
      setErreur("Le titre et le projet sont obligatoires.");
      return;
    }

    const payload = {
      name: form.titre.trim(),
      project_id: Number(form.projet_id),
      intern_id: form.stagiaire_id ? Number(form.stagiaire_id) : null,
      status: form.statut,
      start_date: form.start_date,
      end_date: form.end_date,
    };

    try {
      if (editingId) {
        await taskService.update(editingId, payload);
      } else {
        await taskService.create(payload);
      }
      setForm({ titre: "", projet_id: "", stagiaire_id: "", statut: "À faire", start_date: "", end_date: "" });
      setEditingId(null);
      setErreur("");
      await chargerTaches();
    } catch (err) {
      const dataErr = err.response?.data?.errors;
      setErreur(dataErr ? Object.values(dataErr).flat().join(" ") : (err.response?.data?.message ?? "Une erreur est survenue."));
    }
  }

  function handleEdit(tache) {
    setForm({
      titre: tache.titre,
      projet_id: String(tache.projet_id),
      stagiaire_id: tache.stagiaire_id ? String(tache.stagiaire_id) : "",
      statut: tache.statut,
      start_date: tache.start_date,
      end_date: tache.end_date,
    });
    setEditingId(tache.id);
    setErreur("");
  }

  async function handleDelete(id) {
    const tache = taches.find((t) => t.id === id);
    if (!tache) return;
    const ok = window.confirm(`Supprimer la tâche ${tache.titre} ?`);
    if (!ok) return;

    try {
      await taskService.remove(id);
      await chargerTaches();
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Impossible de supprimer la tâche.");
    }
  }

  async function changerStatut(id, statut) {
    try {
      await taskService.update(id, { status: statut });
      await chargerTaches();
    } catch {
      setErreur("Impossible de changer le statut.");
    }
  }

  const champClasse = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Planification</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">Tâches</h2>
        </div>
        <button onClick={chargerTaches} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Actualiser
        </button>
      </div>

      {role === "administrateur" && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Titre</label>
              <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Titre de la tâche" className={champClasse} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Projet</label>
              <select value={form.projet_id} onChange={(e) => setForm({ ...form, projet_id: e.target.value, stagiaire_id: "" })} className={champClasse}>
                <option value="">-- Choisir --</option>
                {projets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Stagiaire assigné</label>
              <select value={form.stagiaire_id} onChange={(e) => setForm({ ...form, stagiaire_id: e.target.value })} className={champClasse}>
                <option value="">-- Non assigné --</option>
                {stagiaires.map((s) => (
                  <option key={s.id} value={s.id}>{s.user?.first_name ? `${s.user.first_name} ${s.user.last_name}` : "Sans compte"}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Statut</label>
              <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className={champClasse}>
                <option>À faire</option>
                <option>En cours</option>
                <option>Terminé</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Date début</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={champClasse} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Date fin</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={champClasse} />
            </div>
          </div>

          {erreur && <p className="mt-4 text-sm text-red-600">{erreur}</p>}

          <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700">
            <Plus size={16} />
            {editingId ? "Enregistrer" : "Ajouter"}
          </button>
        </form>
      )}

      {chargement && <p className="text-sm text-slate-400">Chargement...</p>}

      <div className="space-y-4">
        {taches.map((tache) => (
          <div key={tache.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <CheckSquare size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{tache.titre}</p>
                <p className="text-sm text-slate-500">Projet : {tache.projet}</p>
                {tache.stagiaire && (
                  <p className="flex items-center gap-1 text-xs text-indigo-600 mt-1">
                    <UserRound size={12} />
                    Assigné à : {tache.stagiaire}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {(() => {
                const encadreurs = [...new Map(
                  (tache.equipe ?? [])
                    .filter((i) => i.supervisor?.user)
                    .map((i) => [i.supervisor.id, i.supervisor])
                ).values()];
                return encadreurs.length > 0 ? (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Encadreurs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {encadreurs.map((s) => (
                        <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                          <UserRound size={11} />
                          {s.user.first_name} {s.user.last_name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {(tache.equipe ?? []).length > 0 && (
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Équipe {tache.equipe.length > 1 ? `(${tache.equipe.length} stagiaires)` : "(1 stagiaire)"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tache.equipe.map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        <Users size={11} />
                        {s.user?.first_name} {s.user?.last_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {tache.start_date && tache.end_date && (
                <span className="text-xs text-slate-400">{tache.start_date} → {tache.end_date}</span>
              )}
              {role === "administrateur" ? (
                <select value={tache.statut} onChange={(e) => changerStatut(tache.id, e.target.value)} className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>À faire</option>
                  <option>En cours</option>
                  <option>Terminé</option>
                </select>
              ) : (
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tache.statut === "Terminé" ? "bg-emerald-50 text-emerald-700" : tache.statut === "En cours" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{tache.statut}</span>
              )}

              {role === "administrateur" && (
                <>
                  <button onClick={() => handleEdit(tache)} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"><PencilLine size={15} /></button>
                  <button onClick={() => handleDelete(tache.id)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 transition hover:bg-red-100"><Trash2 size={15} /></button>
                </>
              )}
            </div>
          </div>
        ))}
        {!chargement && taches.length === 0 && <p className="text-center text-sm text-slate-400">Aucune tâche.</p>}
      </div>
    </div>
  );
}

export default Taches;
