import { useEffect, useState } from "react";
import { UserRound, Mail, ShieldCheck, GraduationCap, BriefcaseBusiness, FolderKanban, Building2, Pencil, Save, X } from "lucide-react";
import api from "../api/axios";
import { updateProfile } from "../api/authService";

const LIBELLES_ROLE = {
  Admin: "Administrateur",
  Encadreur: "Encadreur",
  Stagiaire: "Stagiaire",
};

function Profil() {
  const [profil, setProfil] = useState(null);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [edition, setEdition] = useState(false);
  const [chargement, setChargement] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    chargerProfil();
  }, []);

  async function chargerProfil() {
    try {
      const response = await api.get("/user");
      const u = response.data?.user ?? response.data;
      setProfil(u);
      setForm({
        first_name: u.first_name ?? "",
        last_name: u.last_name ?? "",
        email: u.email ?? "",
        phone: u.phone ?? "",
        password: "",
      });
    } catch {
      setErreur("Impossible de charger le profil.");
    }
  }

  function activerEdition() {
    setEdition(true);
    setErreur("");
    setMessage("");
  }

  function annulerEdition() {
    setEdition(false);
    setErreur("");
    setMessage("");
    setForm({
      first_name: profil.first_name ?? "",
      last_name: profil.last_name ?? "",
      email: profil.email ?? "",
      phone: profil.phone ?? "",
      password: "",
    });
  }

  async function sauvegarder(e) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    setMessage("");

    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.phone) payload.phone = null;

      const updated = await updateProfile(payload);
      setProfil(updated);
      setForm((prev) => ({ ...prev, password: "" }));
      setEdition(false);
      setMessage("Profil mis à jour avec succès.");
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) {
        const firstKey = Object.keys(errs)[0];
        setErreur(errs[firstKey][0]);
      } else {
        setErreur(err.response?.data?.message ?? "Impossible de mettre à jour le profil.");
      }
    } finally {
      setChargement(false);
    }
  }

  function gererChamp(champ, valeur) {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  }

  if (erreur && !profil) return <p className="p-8 text-sm text-red-600">{erreur}</p>;
  if (!profil) return <p className="p-8 text-sm text-slate-400">Chargement...</p>;

  const role = Array.isArray(profil.roles) && profil.roles.length > 0 ? profil.roles[0] : "—";
  const libelleRole = LIBELLES_ROLE[role] ?? role;
  const prenom = profil.first_name ?? "";
  const nom = profil.last_name ?? "";
  const initiales = `${(prenom[0] ?? "U")}${(nom[0] ?? "")}`.toUpperCase();
  const intern = profil.intern;
  const supervisor = profil.supervisor;

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Profil</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">Mon profil</h2>
        </div>
        {!edition && (
          <button onClick={activerEdition} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700">
            <Pencil size={16} />
            Modifier
          </button>
        )}
      </div>

      {message && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{message}</p>}
      {erreur && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erreur}</p>}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
            {initiales}
          </div>
          <h3 className="mt-5 text-xl font-bold text-slate-800">{prenom} {nom}</h3>
          <p className="mt-1 text-sm text-slate-500">{libelleRole}</p>
          <span className="mt-3 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {profil.status ?? "Active"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {edition ? (
            <form onSubmit={sauvegarder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prénom</label>
                  <input type="text" value={form.first_name} onChange={(e) => gererChamp("first_name", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nom</label>
                  <input type="text" value={form.last_name} onChange={(e) => gererChamp("last_name", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</label>
                <input type="email" value={form.email} onChange={(e) => gererChamp("email", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Téléphone</label>
                <input type="text" value={form.phone} onChange={(e) => gererChamp("phone", e.target.value)} placeholder="Optionnel" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nouveau mot de passe</label>
                <input type="password" value={form.password} onChange={(e) => gererChamp("password", e.target.value)} placeholder="Laisser vide pour conserver" className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={chargement} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50">
                  <Save size={16} />
                  {chargement ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button type="button" onClick={annulerEdition} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <X size={16} />
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <Mail className="text-indigo-600" size={16} />
                <span>{profil.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-indigo-600" size={16} />
                <span>Rôle : {libelleRole}</span>
              </div>

              {intern && (
                <>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-indigo-600" size={16} />
                    <span>{intern.training} — {intern.level} ({intern.institution})</span>
                  </div>
                  {intern.type_stage && (
                    <div className="flex items-center gap-3">
                      <BriefcaseBusiness className="text-indigo-600" size={16} />
                      <span>
                        Type de stage :{" "}
                        <span className="capitalize font-medium text-slate-800">{intern.type_stage}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <UserRound className="text-indigo-600" size={16} />
                    <span>Encadreur : {intern.supervisor?.user ? `${intern.supervisor.user.first_name} ${intern.supervisor.user.last_name}` : "—"}</span>
                  </div>
                  {Array.isArray(intern.projects) && intern.projects.length > 0 && (
                    <div className="flex items-start gap-3">
                      <FolderKanban className="mt-0.5 text-indigo-600" size={16} />
                      <span>
                        Projets : {intern.projects.map((p) => p.name).join(", ")}
                      </span>
                    </div>
                  )}
                </>
              )}

              {supervisor && !intern && (
                <div className="flex items-center gap-3">
                  <BriefcaseBusiness className="text-indigo-600" size={16} />
                  <span>Position : {supervisor.position ?? "—"}</span>
                </div>
              )}

              {profil.phone && (
                <div className="flex items-center gap-3">
                  <Building2 className="text-indigo-600" size={16} />
                  <span>{profil.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profil;