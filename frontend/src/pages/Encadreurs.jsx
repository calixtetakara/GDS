// ============================================================
// IMPORTS
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  PencilLine,
  Trash2,
  Plus,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown,
  Mail,
  Users,
  Archive,
} from "lucide-react";
import * as supervisorService from "../api/supervisorService";
import CredentialsModal from "../components/CredentialsModal";

// ============================================================
// UTILITAIRES
// ============================================================

/**
 * Retourne les initiales (majuscules) à partir du prénom et du nom.
 * @param {string} prenom
 * @param {string} nom
 * @returns {string}
 */
function initiales(prenom, nom) {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
}

/** Teintes pastel attribuées de façon déterministe selon l'id. */
const TEINTES = ["slate", "indigo", "sky", "amber", "emerald", "rose"];

function teintePourId(id) {
  return TEINTES[Math.abs(Number(id) || 0) % TEINTES.length];
}

/** Classes Tailwind d'avatar selon la teinte. */
const AVATAR_STYLES = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

/** Classe commune des champs de saisie. */
const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

/**
 * Avatar rond avec initiales et teinte pastel.
 */
function Avatar({ prenom, nom, id, size = "md" }) {
  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-[11px]",
    lg: "w-14 h-14 text-base",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold ring-1 ${AVATAR_STYLES[teintePourId(id)]} shrink-0`}
    >
      {initiales(prenom, nom)}
    </div>
  );
}

/**
 * Point de statut discret.
 */
function StatutPoint({ statut }) {
  const actif = statut === "Active";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          actif ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
      {statut}
    </span>
  );
}

/**
 * En-tête de colonne cliquable pour trier.
 */
function ThTriable({ label, actif, direction, onClick, align = "left" }) {
  return (
    <th className="px-4 py-2.5 font-medium">
      <button
        onClick={onClick}
        className={`group inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors w-full ${
          align === "right"
            ? "justify-end"
            : align === "center"
            ? "justify-center"
            : ""
        }`}
      >
        {label}
        <span
          className={`transition-opacity ${
            actif ? "opacity-100" : "opacity-0 group-hover:opacity-40"
          }`}
        >
          {direction === "asc" ? (
            <ChevronUp size={11} />
          ) : (
            <ChevronDown size={11} />
          )}
        </span>
      </button>
    </th>
  );
}

/**
 * Bouton d'action (icône) sur une ligne de tableau.
 */
function ActionBtn({ onClick, title, children, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        danger
          ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Modale de création / édition d'un encadreur.
 */
function ModaleEncadreur({
  ouvert,
  form,
  editingId,
  erreur,
  onChange,
  onSubmit,
  onFermer,
}) {
  if (!ouvert) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onFermer}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {editingId ? "Modifier l'encadreur" : "Nouvel encadreur"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingId
                ? "Mettez à jour les informations."
                : "Un mot de passe sera généré et envoyé par email."}
            </p>
          </div>
          <button
            onClick={onFermer}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit}>
          <div className="px-6 py-5 grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                Prénom
              </label>
              <input
                autoFocus
                placeholder="Amadou"
                value={form.prenom}
                onChange={(e) => onChange("prenom", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                Nom
              </label>
              <input
                placeholder="Diallo"
                value={form.nom}
                onChange={(e) => onChange("nom", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="amadou.diallo@exemple.com"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                Spécialité
              </label>
              <input
                placeholder="Développement web, Data science..."
                value={form.specialite}
                onChange={(e) => onChange("specialite", e.target.value)}
                className={inputCls}
              />
            </div>
            {editingId && (
              <div className="col-span-2">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                  Statut
                </label>
                <select
                  value={form.statut}
                  onChange={(e) => onChange("statut", e.target.value)}
                  className={inputCls}
                >
                  <option value="Active">Active</option>
                  <option value="Archivé">Archivé</option>
                </select>
              </div>
            )}

            {erreur && (
              <div className="col-span-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {erreur}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onFermer}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3.5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {editingId ? "Enregistrer" : "Créer l'encadreur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// PAGE — Encadreurs
// ============================================================
function Encadreurs() {
  // ----------------------------------------------------------
  // ÉTATS
  // ----------------------------------------------------------
  const [encadreurs, setEncadreurs] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    specialite: "",
    password: "",
    statut: "Active",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const recherche = searchParams.get("recherche") ?? "";
  const [filtre, setFiltre] = useState("Tous");
  const [erreur, setErreur] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectionne, setSelectionne] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [identifiantsCrees, setIdentifiantsCrees] = useState(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [tri, setTri] = useState({ cle: "nom", direction: "asc" });

  // ----------------------------------------------------------
  // EFFETS
  // ----------------------------------------------------------
  useEffect(() => {
    chargerEncadreurs();
  }, []);

  // ----------------------------------------------------------
  // CHARGEMENT
  // ----------------------------------------------------------
  async function chargerEncadreurs() {
    setChargement(true);
    try {
      const data = await supervisorService.getAll();
      setEncadreurs(
        data.map((s) => ({
          id: s.id,
          nom: s.user?.last_name ?? "",
          prenom: s.user?.first_name ?? "",
          email: s.user?.email ?? "",
          specialite: s.position ?? "",
          statut: s.user?.status ?? "Active",
          nbStagiaires: Array.isArray(s.interns) ? s.interns.length : 0,
        }))
      );
      setSelectionne((prev) =>
        prev && data.some((s) => s.id === prev) ? prev : null
      );
    } catch {
      setErreur("Impossible de charger les encadreurs.");
    } finally {
      setChargement(false);
    }
  }

  // ----------------------------------------------------------
  // FILTRES + TRI
  // ----------------------------------------------------------
  const encadreursFiltres = useMemo(() => {
    const list = encadreurs.filter((e) => {
      const texte =
        `${e.nom} ${e.prenom} ${e.email} ${e.specialite}`.toLowerCase();
      const okRecherche = texte.includes(recherche.toLowerCase());
      const okFiltre = filtre === "Tous" || e.statut === filtre;
      return okRecherche && okFiltre;
    });

    const { cle, direction } = tri;
    const mult = direction === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const va = a[cle];
      const vb = b[cle];
      if (typeof va === "number" && typeof vb === "number")
        return (va - vb) * mult;
      return String(va).localeCompare(String(vb), "fr") * mult;
    });
  }, [encadreurs, recherche, filtre, tri]);

  const encadreurSelectionne =
    encadreursFiltres.find((e) => e.id === selectionne) || null;

  // ----------------------------------------------------------
  // HANDLERS — TRI
  // ----------------------------------------------------------
  function toggleTri(cle) {
    setTri((prev) =>
      prev.cle === cle
        ? { cle, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { cle, direction: "asc" }
    );
  }

  // ----------------------------------------------------------
  // HANDLERS — FORMULAIRE
  // ----------------------------------------------------------
  function validerEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function handleChange(champ, valeur) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  function resetForm() {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      specialite: "",
      password: "",
      statut: "Active",
    });
    setEditingId(null);
    setErreur("");
  }

  function ouvrirCreation() {
    resetForm();
    setModaleOuverte(true);
  }

  function ouvrirEdition(encadreur) {
    setForm({
      nom: encadreur.nom,
      prenom: encadreur.prenom,
      email: encadreur.email,
      specialite: encadreur.specialite,
      password: "",
      statut: encadreur.statut,
    });
    setEditingId(encadreur.id);
    setSelectionne(encadreur.id);
    setErreur("");
    setModaleOuverte(true);
  }

  function fermerModale() {
    setModaleOuverte(false);
    resetForm();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { nom, prenom, email, specialite, statut } = form;

    if (!nom.trim() || !prenom.trim() || !email.trim() || !specialite.trim()) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }
    if (!validerEmail(email)) {
      setErreur("Adresse e-mail invalide.");
      return;
    }

    try {
      if (editingId) {
        await supervisorService.update(editingId, {
          first_name: prenom.trim(),
          last_name: nom.trim(),
          email: email.trim(),
          position: specialite.trim(),
          status: statut,
        });
      } else {
        const nouveau = await supervisorService.create({
          first_name: prenom.trim(),
          last_name: nom.trim(),
          email: email.trim(),
          position: specialite.trim(),
        });
        setSelectionne(nouveau.data.id);
        setIdentifiantsCrees({
          email: email.trim(),
          motDePasse: nouveau?.temporary_password,
          nom: `${prenom.trim()} ${nom.trim()}`,
          emailEnvoye: true,
        });
      }
      fermerModale();
      await chargerEncadreurs();
    } catch (err) {
      const dataErr = err.response?.data?.errors;
      setErreur(
        dataErr
          ? Object.values(dataErr).flat().join(" ")
          : err.response?.data?.message ?? "Une erreur est survenue."
      );
    }
  }

  async function handleDelete(id) {
    const encadreur = encadreurs.find((e) => e.id === id);
    if (!encadreur) return;
    if (!window.confirm(`Supprimer ${encadreur.prenom} ${encadreur.nom} ?`))
      return;

    try {
      await supervisorService.remove(id);
      setSelectionne((prev) => (prev === id ? null : prev));
      await chargerEncadreurs();
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Suppression impossible.");
    }
  }

  async function archiverEncadreur(id) {
    try {
      await supervisorService.update(id, { status: "Archivé" });
      setErreur("");
      await chargerEncadreurs();
    } catch (err) {
      setErreur(err.response?.data?.message ?? "Archivage impossible.");
    }
  }

  // ----------------------------------------------------------
  // RENDU
  // ----------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* =====================================================
            HEADER
            ===================================================== */}
        <header className="flex items-end justify-between gap-4 mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Encadreurs
            </h1>
            <span className="text-sm text-slate-400 tabular-nums">
              {encadreursFiltres.length} / {encadreurs.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={chargerEncadreurs}
              disabled={chargement}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw
                size={15}
                className={chargement ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={ouvrirCreation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Nouvel encadreur
            </button>
          </div>
        </header>

        {/* =====================================================
            TOOLBAR — Recherche + filtres inline
            ===================================================== */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              value={recherche}
              onChange={(e) =>
                setSearchParams(
                  e.target.value ? { recherche: e.target.value } : {},
                  { replace: true }
                )
              }
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            {["Tous", "Active", "Archivé"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filtre === f
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* =====================================================
            CORPS — Tableau + Inspecteur
            ===================================================== */}
        <div className="flex gap-4">

          {/* ----- Tableau ----- */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60 border-b border-slate-200">
                <tr>
                  <ThTriable
                    label="Encadreur"
                    actif={tri.cle === "nom"}
                    direction={tri.direction}
                    onClick={() => toggleTri("nom")}
                  />
                  <ThTriable
                    label="Spécialité"
                    actif={tri.cle === "specialite"}
                    direction={tri.direction}
                    onClick={() => toggleTri("specialite")}
                  />
                  <ThTriable
                    label="Stagiaires"
                    actif={tri.cle === "nbStagiaires"}
                    direction={tri.direction}
                    onClick={() => toggleTri("nbStagiaires")}
                    align="center"
                  />
                  <ThTriable
                    label="Statut"
                    actif={tri.cle === "statut"}
                    direction={tri.direction}
                    onClick={() => toggleTri("statut")}
                  />
                  <th className="px-4 py-2.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {encadreursFiltres.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectionne(e.id)}
                    className={`group border-b border-slate-100 last:border-0 cursor-pointer transition-colors ${
                      selectionne === e.id
                        ? "bg-slate-50"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          prenom={e.prenom}
                          nom={e.nom}
                          id={e.id}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate">
                            {e.prenom} {e.nom}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {e.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {e.specialite || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-slate-700 tabular-nums">
                        {e.nbStagiaires}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatutPoint statut={e.statut} />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <ActionBtn
                          title="Modifier"
                          onClick={() => ouvrirEdition(e)}
                        >
                          <PencilLine size={14} />
                        </ActionBtn>
                        <ActionBtn
                          title="Supprimer"
                          danger
                          onClick={() => handleDelete(e.id)}
                        >
                          <Trash2 size={14} />
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {chargement && (
              <div className="py-16 text-center text-sm text-slate-400">
                Chargement...
              </div>
            )}
            {!chargement && encadreursFiltres.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-500">
                  Aucun encadreur trouvé.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Essayez de modifier votre recherche ou vos filtres.
                </p>
              </div>
            )}
          </div>

          {/* ----- Inspecteur ----- */}
          <aside className="w-80 shrink-0">
            {encadreurSelectionne ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-6">
                <div className="flex items-start gap-3">
                  <Avatar
                    prenom={encadreurSelectionne.prenom}
                    nom={encadreurSelectionne.nom}
                    id={encadreurSelectionne.id}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {encadreurSelectionne.prenom}{" "}
                      {encadreurSelectionne.nom}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {encadreurSelectionne.specialite}
                    </p>
                    <div className="mt-2">
                      <StatutPoint statut={encadreurSelectionne.statut} />
                    </div>
                  </div>
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-start gap-2.5">
                    <Mail
                      size={14}
                      className="text-slate-400 mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                        Email
                      </dt>
                      <dd className="text-slate-800 break-all text-xs">
                        {encadreurSelectionne.email}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users
                      size={14}
                      className="text-slate-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                        Stagiaires suivis
                      </dt>
                      <dd className="text-slate-800 text-xs tabular-nums">
                        {encadreurSelectionne.nbStagiaires}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => ouvrirEdition(encadreurSelectionne)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    <PencilLine size={13} />
                    Modifier
                  </button>
                  {encadreurSelectionne.statut === "Active" && (
                    <button
                      onClick={() =>
                        archiverEncadreur(encadreurSelectionne.id)
                      }
                      title="Archiver"
                      className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                      <Archive size={13} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-xl py-12 px-6 text-center">
                <p className="text-sm text-slate-500">
                  Sélectionnez un encadreur
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Les détails apparaîtront ici
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* =====================================================
          MODALES
          ===================================================== */}
      <ModaleEncadreur
        ouvert={modaleOuverte}
        form={form}
        editingId={editingId}
        erreur={erreur}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onFermer={fermerModale}
      />

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

export default Encadreurs;