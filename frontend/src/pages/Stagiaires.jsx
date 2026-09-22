import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, PencilLine, Trash2, UserRound, Filter, Eye } from "lucide-react";
import { getAll, create, update as updateIntern, remove } from "../api/internService";
import CredentialsModal from "../components/CredentialsModal";

function Stagiaires({ utilisateur }) {
  const role = utilisateur?.role || "stagiaire";
  const estEncadreur = role === "encadreur";
  const [stagiaires, setStagiaires] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    training: "",
    institution: "",
    level: "",
    type_stage: "",
    start_date: "",
    end_date: "",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const recherche = searchParams.get("recherche") ?? "";
  const [filtre, setFiltre] = useState("Tous");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectionne, setSelectionne] = useState(null);
  const [identifiantsCrees, setIdentifiantsCrees] = useState(null);

  useEffect(() => {
    chargerStagiaires();
  }, []);

  async function chargerStagiaires() {
    try {
      const data = await getAll();
      setStagiaires(data);
    } catch (err) {
      setErreur("Impossible de charger les stagiaires.");
    } finally {
      setChargement(false);
    }
  }

  const nomComplet = (s) =>
    `${s.user?.first_name || ""} ${s.user?.last_name || ""}`.trim() || "Sans nom";
  const emailStagiaire = (s) => s.user?.email || "";

  const stagiairesFiltres = useMemo(() => {
    return stagiaires.filter((stagiaire) => {
      const texte =
        `${nomComplet(stagiaire)} ${emailStagiaire(stagiaire)} ${stagiaire.training ?? ""} ${stagiaire.institution ?? ""} ${stagiaire.level ?? ""} ${stagiaire.type_stage ?? ""}`.toLowerCase();
      return texte.includes(recherche.toLowerCase());
    });
  }, [stagiaires, recherche]);

  const stagiaireSelectionne =
    stagiairesFiltres.find((s) => s.id === selectionne) || stagiairesFiltres[0] || null;

  function handleChange(champ, valeur) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const {
      first_name,
      last_name,
      email,
      training,
      institution,
      level,
      type_stage,
      start_date,
      end_date,
    } = form;

    if (!training.trim() || !institution.trim() || !level.trim()) {
      setErreur("Le domaine, l'institut et le niveau sont obligatoires.");
      return;
    }

    if (start_date && end_date && end_date < start_date) {
      setErreur("La date de fin doit être après la date de début.");
      return;
    }

    setErreur("");
    try {
      if (editingId) {
        await updateIntern(editingId, {
          training,
          institution,
          level,
          type_stage: type_stage || null,
          start_date: start_date || null,
          end_date: end_date || null,
        });
      } else {
        const nouveau = await create({
          first_name: first_name.trim() || undefined,
          last_name: last_name.trim() || undefined,
          email: email.trim() || undefined,
          training,
          institution,
          level,
          type_stage: type_stage || null,
          start_date: start_date || null,
          end_date: end_date || null,
        });
        if (email.trim()) {
          setIdentifiantsCrees({
            email: email.trim(),
            motDePasse: nouveau?.temporary_password,
            nom: `${first_name} ${last_name}`.trim() || email.trim(),
            emailEnvoye: !!email.trim(),
          });
        }
      }
      await chargerStagiaires();
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        training: "",
        institution: "",
        level: "",
        type_stage: "",
        start_date: "",
        end_date: "",
      });
      setEditingId(null);
    } catch (err) {
      const dataErr = err.response?.data?.errors;
      const message = dataErr
        ? Object.values(dataErr).flat().join(" ")
        : err.response?.data?.message ?? "Erreur lors de l'enregistrement.";
      setErreur(message);
    }
  }

  function handleEdit(stagiaire) {
    setForm({
      first_name: stagiaire.user?.first_name || "",
      last_name: stagiaire.user?.last_name || "",
      email: stagiaire.user?.email || "",
      password: "",
      training: stagiaire.training || "",
      institution: stagiaire.institution || "",
      level: stagiaire.level || "",
      type_stage: stagiaire.type_stage || "",
      start_date: stagiaire.start_date?.slice(0, 10) || "",
      end_date: stagiaire.end_date?.slice(0, 10) || "",
    });
    setEditingId(stagiaire.id);
    setSelectionne(stagiaire.id);
    setErreur("");
  }

  async function handleDelete(id) {
    const stagiaire = stagiaires.find((s) => s.id === id);
    if (!stagiaire) return;

    const ok = window.confirm(`Supprimer le stagiaire ${nomComplet(stagiaire)} ?`);
    if (!ok) return;

    try {
      await remove(id);
      await chargerStagiaires();
      setSelectionne((prev) => (prev === id ? null : prev));
    } catch (err) {
      setErreur("Erreur lors de la suppression.");
    }
  }

  const champClasse =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClasse =
    "mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500";

  return (
    <div className="p-8">
      {/* --- En-tête --- */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Gestion</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {estEncadreur ? "Mes stagiaires" : "Stagiaires"}
          </h2>
          {estEncadreur && (
            <p className="mt-1 text-sm text-slate-500">
              Les stagiaires affectés à votre encadrement
            </p>
          )}
        </div>
      </div>

      {/* --- Formulaire + Recherche --- */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {!estEncadreur && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? "Modifier un stagiaire" : "Ajouter un stagiaire"}
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClasse}>Nom</label>
                <input
                  placeholder="Nom du stagiaire"
                  value={form.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  className={champClasse}
                />
              </div>

              <div>
                <label className={labelClasse}>Prénom</label>
                <input
                  placeholder="Prénom du stagiaire"
                  value={form.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  className={champClasse}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClasse}>Email</label>
                <input
                  placeholder="Email (crée un compte de connexion)"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={champClasse}
                />
                {!editingId && form.email.trim() && (
                  <p className="mt-1 text-xs text-slate-400">
                    Un mot de passe sera généré automatiquement et envoyé par email.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClasse}>Domaine de formation</label>
                <input
                  placeholder="Ex : Informatique"
                  value={form.training}
                  onChange={(e) => handleChange("training", e.target.value)}
                  className={champClasse}
                />
              </div>

              <div>
                <label className={labelClasse}>Institut de provenance</label>
                <input
                  placeholder="Ex : Université de Kara"
                  value={form.institution}
                  onChange={(e) => handleChange("institution", e.target.value)}
                  className={champClasse}
                />
              </div>

              <div>
                <label className={labelClasse}>Niveau d'étude</label>
                <input
                  placeholder="Ex : L2, L3, Master"
                  value={form.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                  className={champClasse}
                />
              </div>

              <div>
                <label className={labelClasse}>Type de stage</label>
                <select
                  value={form.type_stage}
                  onChange={(e) => handleChange("type_stage", e.target.value)}
                  className={champClasse}
                >
                  <option value="">-- Choisir le type de stage --</option>
                  <option value="hybride">Hybride</option>
                  <option value="online">Online</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              <div>
                <label className={labelClasse}>Début de stage</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className={champClasse}
                />
              </div>

              <div>
                <label className={labelClasse}>Fin de stage</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className={champClasse}
                />
              </div>
            </div>

            {erreur && <p className="mt-4 text-sm text-red-600">{erreur}</p>}

            <button
              type="submit"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
            >
              {editingId ? "Enregistrer" : "Ajouter"}
            </button>
          </form>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Search size={16} />
            <span className="text-sm font-medium">Recherche</span>
          </div>
          <input
            value={recherche}
            onChange={(e) =>
              setSearchParams(e.target.value ? { recherche: e.target.value } : {}, { replace: true })
            }
            placeholder="Rechercher un stagiaire..."
            className="mt-4 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* --- Tableau + Détail --- */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {chargement ? (
            <p className="p-6 text-center text-sm text-slate-400">Chargement...</p>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3 font-semibold">Nom</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Domaine</th>
                  <th className="px-3 py-3 font-semibold">Niveau</th>
                  <th className="px-3 py-3 font-semibold">Type</th>
                  <th className="px-3 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stagiairesFiltres.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-t border-slate-100 ${
                      selectionne === s.id ? "bg-indigo-50/40" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-3 py-3 font-medium text-slate-800">{nomComplet(s)}</td>
                    <td className="px-3 py-3 text-slate-500">{emailStagiaire(s)}</td>
                    <td className="px-3 py-3 text-slate-500">{s.training}</td>
                    <td className="px-3 py-3 text-slate-500">{s.level}</td>
                    <td className="px-3 py-3 capitalize text-slate-500">{s.type_stage || "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Voir"
                          onClick={() => setSelectionne(s.id)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                        >
                          <Eye size={14} />
                        </button>
                        {!estEncadreur && (
                          <>
                            <button
                              title="Modifier"
                              onClick={() => handleEdit(s)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                            >
                              <PencilLine size={14} />
                            </button>
                            <button
                              title="Supprimer"
                              onClick={() => handleDelete(s.id)}
                              className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!chargement && stagiairesFiltres.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">Aucun stagiaire trouvé.</p>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {stagiaireSelectionne ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                {nomComplet(stagiaireSelectionne)[0] || "?"}
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-800">
                {nomComplet(stagiaireSelectionne)}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{emailStagiaire(stagiaireSelectionne)}</p>

              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Domaine de formation</span>
                  <span className="font-medium text-slate-800">{stagiaireSelectionne.training}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Institut de provenance</span>
                  <span className="font-medium text-slate-800">{stagiaireSelectionne.institution}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Niveau d'étude</span>
                  <span className="font-medium text-slate-800">{stagiaireSelectionne.level}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Type de stage</span>
                  <span className="font-medium capitalize text-slate-800">
                    {stagiaireSelectionne.type_stage || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Début de stage</span>
                  <span className="font-medium text-slate-800">
                    {stagiaireSelectionne.start_date?.slice(0, 10) || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span>Fin de stage</span>
                  <span className="font-medium text-slate-800">
                    {stagiaireSelectionne.end_date?.slice(0, 10) || "—"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">Aucun stagiaire sélectionné.</p>
          )}
        </aside>
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

export default Stagiaires;