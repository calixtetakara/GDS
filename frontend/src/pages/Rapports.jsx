import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, CheckCircle2, XCircle, MessageSquareText, RefreshCw, Download, Paperclip, FileDown, Search } from "lucide-react";
import * as reportService from "../api/reportService";

const NORMALISATION = {
  Valide: "Validé",
  Rejete: "Rejeté",
  "En attente": "En attente",
};

function tronquer(texte, longueur = 80) {
  if (!texte) return "—";
  if (texte.length <= longueur) return texte;
  return texte.slice(0, longueur).trim() + "…";
}

function Rapports({ utilisateur }) {
  const [rapports, setRapports] = useState([]);
  const [semaine, setSemaine] = useState("");
  const [contenu, setContenu] = useState("");
  const [fichier, setFichier] = useState(null);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const recherche = searchParams.get("recherche") ?? "";

  const role = utilisateur?.role || "stagiaire";
  const peutValider = role === "encadreur" || role === "administrateur";

  useEffect(() => {
    chargerRapports();
  }, []);

  async function chargerRapports() {
    setChargement(true);
    setErreur("");
    try {
      const data = await reportService.getAll();
      const liste = Array.isArray(data) ? data : [];

      setRapports(
        liste.map((r) => ({
          id: r.id,
          stagiaireId: r.intern_id,
          stagiaire: r.intern?.user
            ? `${r.intern.user.first_name} ${r.intern.user.last_name}`
            : "—",
          semaine: r.week ?? "—",
          contenu: r.content ?? r.comment ?? "",
          statut: NORMALISATION[r.status] ?? r.status ?? "En attente",
          commentaire: r.comment ?? "",
          statutBrut: r.status,
          document: r.file ?? null,
        }))
      );
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Impossible de charger les rapports.");
    } finally {
      setChargement(false);
    }
  }

  const rapportsVisibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return rapports;
    return rapports.filter((r) =>
      `${r.stagiaire} ${r.semaine} ${r.contenu} ${r.statut}`
        .toLowerCase()
        .includes(q)
    );
  }, [rapports, recherche]);

  const stagiairesUniques = useMemo(() => {
    const map = new Map();
    rapportsVisibles.forEach((r) => {
      if (r.stagiaireId && !map.has(r.stagiaireId)) {
        map.set(r.stagiaireId, { id: r.stagiaireId, nom: r.stagiaire });
      }
    });
    return Array.from(map.values());
  }, [rapportsVisibles]);

  async function gererDepot(evenement) {
    evenement.preventDefault();
    if (!semaine.trim() || !contenu.trim()) {
      setMessage("");
      setErreur("Veuillez remplir la semaine et le contenu du rapport.");
      return;
    }

    try {
      await reportService.create(
        {
          week: semaine.trim(),
          submission_date: new Date().toISOString().slice(0, 10),
          content: contenu.trim(),
        },
        fichier
      );
      setErreur("");
      setMessage("Rapport envoyé avec succès.");
      setSemaine("");
      setContenu("");
      setFichier(null);
      await chargerRapports();
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Impossible de déposer le rapport.");
    }
  }

  async function changerStatut(id, statutBrut, commentaire) {
    try {
      await reportService.updateStatus(id, statutBrut, commentaire);
      setErreur("");
      await chargerRapports();
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Impossible de valider le rapport.");
    }
  }

  return (
    <div className="p-8">
      {/* --- En-tête --- */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Rapports</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {role === "stagiaire" ? "Mes rapports hebdomadaires" : "Rapports des stagiaires"}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={chargerRapports}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} />
            Actualiser
          </button>

          {role === "stagiaire" && rapportsVisibles.length > 0 && (
            <button
              onClick={() => reportService.getAllPdf()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
            >
              <Download size={14} />
              Tout exporter (PDF)
            </button>
          )}

          {peutValider &&
            stagiairesUniques.map((s) => (
              <button
                key={s.id}
                onClick={() => reportService.getInternPdf(s.id)}
                title="Télécharger le suivi complet du stagiaire"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <FileDown size={14} />
                Suivi {s.nom}
              </button>
            ))}
        </div>
      </div>

      {erreur && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erreur}</p>
      )}

      {/* --- Formulaire de dépôt (stagiaire) --- */}
      {role === "stagiaire" && (
        <form
          onSubmit={gererDepot}
          className="mb-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Semaine concernée
              </label>
              <input
                value={semaine}
                onChange={(e) => setSemaine(e.target.value)}
                placeholder="ex : Semaine du 18 au 22 août"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Contenu du rapport
              </label>
              <textarea
                rows={5}
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                placeholder="Décrivez les activités réalisées cette semaine..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              {fichier && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Paperclip size={13} />
                  <span>{fichier.name}</span>
                  <button
                    type="button"
                    onClick={() => setFichier(null)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <FileText size={16} />
            Déposer le rapport
          </button>

          {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        </form>
      )}

      {/* --- Barre de recherche --- */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          value={recherche}
          onChange={(e) =>
            setSearchParams(
              e.target.value ? { recherche: e.target.value } : {},
              { replace: true }
            )
          }
          placeholder="Rechercher un stagiaire, une semaine, un contenu..."
          className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* --- Tableau des rapports --- */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {role !== "stagiaire" && (
                <th className="px-4 py-3 font-semibold">Stagiaire</th>
              )}
              <th className="px-4 py-3 font-semibold">Semaine</th>
              <th className="px-4 py-3 font-semibold">Contenu</th>
              <th className="px-4 py-3 font-semibold">Document</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              {role === "stagiaire" && (
                <th className="px-4 py-3 font-semibold">Exporter</th>
              )}
              {peutValider && <th className="px-4 py-3 font-semibold">Action</th>}
              {peutValider && (
                <th className="px-4 py-3 font-semibold text-right">PDF</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rapportsVisibles.map((rapport) => {
              const badgeClass =
                rapport.statut === "Validé"
                  ? "bg-emerald-50 text-emerald-700"
                  : rapport.statut === "Rejeté"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700";

              return (
                <tr
                  key={rapport.id}
                  className="border-t border-slate-100 align-top"
                >
                  {role !== "stagiaire" && (
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {rapport.stagiaire}
                    </td>
                  )}
                  <td className="px-4 py-3 text-slate-600">{rapport.semaine}</td>
                  <td
                    className="px-4 py-3 text-slate-600 max-w-xs whitespace-normal"
                    title={rapport.contenu}
                  >
                    {tronquer(rapport.contenu, 80)}
                  </td>
                  <td className="px-4 py-3">
                    {rapport.document ? (
                      <button
                        onClick={() => reportService.downloadDocument(rapport.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        <Paperclip size={13} /> Voir le document
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}
                    >
                      {rapport.statut}
                    </span>
                    {rapport.commentaire && (
                      <p className="mt-2 text-xs text-slate-500 whitespace-normal">
                        Commentaire : {rapport.commentaire}
                      </p>
                    )}
                  </td>

                  {role === "stagiaire" && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => reportService.getPdf(rapport.id)}
                        title="Télécharger ce rapport"
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        <Download size={13} /> PDF
                      </button>
                    </td>
                  )}

                  {peutValider && (
                    <td className="px-4 py-3">
                      {rapport.statut === "En attente" ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              changerStatut(
                                rapport.id,
                                "Valide",
                                "Rapport validé par l'encadreur."
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            <CheckCircle2 size={13} /> Valider
                          </button>
                          <button
                            onClick={() =>
                              changerStatut(
                                rapport.id,
                                "Rejete",
                                "Le rapport nécessite des corrections."
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            <XCircle size={13} /> Rejeter
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <MessageSquareText size={14} />
                        </div>
                      )}
                    </td>
                  )}

                  {peutValider && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => reportService.getPdf(rapport.id)}
                        title="Télécharger ce rapport uniquement"
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        <Download size={13} /> PDF
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {chargement ? (
          <p className="p-6 text-center text-sm text-slate-400">Chargement...</p>
        ) : (
          rapportsVisibles.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">
              Aucun rapport pour le moment.
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default Rapports;