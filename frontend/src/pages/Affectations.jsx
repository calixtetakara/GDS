import { useEffect, useState } from "react";
import { Link2, CheckCircle2, XCircle, Trash2, RefreshCw, FolderKanban, Users } from "lucide-react";
import * as internService from "../api/internService";
import * as supervisorService from "../api/supervisorService";
import * as projectService from "../api/projectService";

function Affectations() {
  const [stagiaires, setStagiaires] = useState([]);
  const [encadreurs, setEncadreurs] = useState([]);
  const [projets, setProjets] = useState([]);
  const [projetId, setProjetId] = useState("");
  const [encadreurId, setEncadreurId] = useState("");
  const [stagiairesSelectionnes, setStagiairesSelectionnes] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    setChargement(true);
    try {
      const [interns, supers, projects] = await Promise.all([
        internService.getAll(),
        supervisorService.getAll(),
        projectService.getAll(),
      ]);
      setStagiaires(
        interns.map((s) => ({
          id: s.id,
          nom: s.user?.last_name ?? "",
          prenom: s.user?.first_name ?? "",
          statut: s.user?.status ?? "Active",
          encadreurId: s.supervisor_id ?? null,
          userId: s.user_id ?? null,
        }))
      );
      setEncadreurs(
        supers.map((e) => ({
          id: e.id,
          nom: e.user?.last_name ?? "",
          prenom: e.user?.first_name ?? "",
          statut: e.user?.status ?? "Active",
        }))
      );
      setProjets(
        projects.map((p) => ({
          id: p.id,
          nom: p.name,
          stagiaireIds: p.interns?.map((i) => i.id) ?? [],
        }))
      );
      setMessage({ type: "", text: "" });
    } catch {
      setMessage({ type: "error", text: "Impossible de charger les données." });
    } finally {
      setChargement(false);
    }
  }

  const encadreursActifs = encadreurs.filter((e) => e.statut === "Active");
  const stagiairesActifs = stagiaires.filter((s) => s.statut === "Active");

  const projetSelectionne = projets.find((p) => p.id === Number(projetId));

  function togglerStagiaire(id) {
    setStagiairesSelectionnes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function gererAffectation(evenement) {
    evenement.preventDefault();

    if (!projetId || !encadreurId || stagiairesSelectionnes.length === 0) {
      setMessage({ type: "error", text: "Veuillez sélectionner un projet, un encadreur et au moins un stagiaire." });
      return;
    }

    try {
      for (const sid of stagiairesSelectionnes) {
        await internService.assignSupervisor(Number(sid), Number(encadreurId));
      }

      const currentInternIds = projetSelectionne?.stagiaireIds ?? [];
      const newInternIds = [...new Set([...currentInternIds, ...stagiairesSelectionnes.map(Number)])];
      await projectService.attachInterns(Number(projetId), newInternIds);

      setProjetId("");
      setEncadreurId("");
      setStagiairesSelectionnes([]);
      await chargerDonnees();
      setMessage({ type: "success", text: "Affectation enregistrée avec succès." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message ?? "Impossible de créer l'affectation." });
    }
  }

  async function supprimerAffectation(projetId, stagiaireId) {
    try {
      await projectService.detachIntern(projetId, stagiaireId);
      await chargerDonnees();
      setMessage({ type: "success", text: "Affectation supprimée avec succès." });
    } catch {
      setMessage({ type: "error", text: "Impossible de supprimer l'affectation." });
    }
  }

  function nomComplet(stagiaire) {
    return stagiaire ? `${stagiaire.prenom} ${stagiaire.nom}` : "—";
  }

  function nomEncadreur(id) {
    const e = encadreurs.find((x) => x.id === id);
    return e ? `${e.prenom} ${e.nom}` : "—";
  }

  const toutesLesAffectations = [];
  projets.forEach((projet) => {
    projet.stagiaireIds.forEach((sid) => {
      const stagiaire = stagiaires.find((s) => s.id === sid);
      if (stagiaire) {
        toutesLesAffectations.push({
          projetId: projet.id,
          projetNom: projet.nom,
          stagiaireId: stagiaire.id,
          stagiaireNom: nomComplet(stagiaire),
          encadreurId: stagiaire.encadreurId,
          encadreurNom: nomEncadreur(stagiaire.encadreurId),
        });
      }
    });
  });

  const champClasse = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Affectations</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">Affecter un encadreur à des stagiaires sur un projet</h2>
        </div>
        <button onClick={chargerDonnees} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      <form onSubmit={gererAffectation} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Projet</label>
            <select value={projetId} onChange={(e) => { setProjetId(e.target.value); setStagiairesSelectionnes([]); }} className={champClasse}>
              <option value="">Choisir un projet</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Encadreur</label>
            <select value={encadreurId} onChange={(e) => setEncadreurId(e.target.value)} className={champClasse}>
              <option value="">Choisir un encadreur</option>
              {encadreursActifs.map((e) => (
                <option key={e.id} value={e.id}>{nomComplet(e)}</option>
              ))}
            </select>
          </div>
        </div>

        {projetSelectionne && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span className="flex items-center gap-2">
                <Users size={14} />
                Stagiaires — cliquer pour sélectionner
              </span>
            </label>
            {stagiairesActifs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stagiairesActifs.map((s) => {
                  const dejaDansLeProjet = projetSelectionne.stagiaireIds.includes(s.id);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => togglerStagiaire(s.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        stagiairesSelectionnes.includes(s.id)
                          ? "bg-indigo-600 text-white shadow-md"
                          : dejaDansLeProjet
                            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {nomComplet(s)}
                      {dejaDansLeProjet && <span className="ml-1 text-[10px] opacity-70">(dans le projet)</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Aucun stagiaire actif disponible.</p>
            )}
          </div>
        )}

        {message.text && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {message.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {message.text}
          </div>
        )}

        <button type="submit" disabled={!projetId || !encadreurId || stagiairesSelectionnes.length === 0} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <Link2 size={16} />
          Affecter {stagiairesSelectionnes.length > 0 && `(${stagiairesSelectionnes.length})`}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Projet</th>
              <th className="px-4 py-3">Stagiaire</th>
              <th className="px-4 py-3">Encadreur</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {toutesLesAffectations.map((a) => (
              <tr key={`${a.projetId}-${a.stagiaireId}`} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-slate-800">
                    <FolderKanban size={14} className="text-indigo-500" />
                    {a.projetNom}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{a.stagiaireNom}</td>
                <td className="px-4 py-3 text-slate-600">{a.encadreurNom}</td>
                <td className="px-4 py-3">
                  <button onClick={() => supprimerAffectation(a.projetId, a.stagiaireId)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
                    <Trash2 size={13} />
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {chargement ? (
          <p className="p-6 text-center text-sm text-slate-400">Chargement...</p>
        ) : (
          toutesLesAffectations.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Aucune affectation pour le moment.</p>
        )}
      </div>
    </div>
  );
}

export default Affectations;
