// ============================================================
// IMPORTS
// ============================================================
import { useState } from "react";
import { Button } from "@/components/ui/button";

// ============================================================
// CHAMP — Label flottant
// ============================================================
function ChampFlottant({ id, label, type = "text", value, onChange, disabled }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder=" "
        autoComplete={id === "motDePasse" ? "current-password" : "email"}
        className="peer w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 pt-4 text-[15px] text-slate-900 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-1.5 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5"
      >
        {label}
      </label>
    </div>
  );
}

// ============================================================
// PAGE — Connexion
// ============================================================
function Connexion({ onConnexion }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function gererEnvoi(e) {
    e.preventDefault();
    if (!email || !motDePasse) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }
    setChargement(true);
    setErreur("");
    const res = await onConnexion(email, motDePasse);
    setChargement(false);
    if (!res.succes) setErreur(res.message || "Email ou mot de passe incorrect.");
  }

  return (
    <div className="fixed inset-0 overflow-hidden font-sans">

      {/* =========================================================
          FOND — Image plein écran
          ========================================================= */}
      <img
        src="/2.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Voile pour garantir la lisibilité de la carte */}
      <div className="absolute inset-0 bg-slate-950/50" />

      {/* Légère teinte indigo pour cohérence avec la marque */}
      <div className="absolute inset-0 bg-indigo-950/30" />

      {/* =========================================================
          CARTE — Centrée
          ========================================================= */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl shadow-slate-950/30 p-8 sm:p-10">

          {/* Logo + marque */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo.png"
              alt="Stagio"
              className="h-14 w-auto object-contain mb-2"
            />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Stagio
            </h1>
            <p className="text-xs text-slate-500 mt-1 italic">
              La gestion des stages simplifiée
            </p>
          </div>

          {/* Titre */}
          <div className="text-center mb-7">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Connexion à votre compte
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Accédez à votre espace de suivi de stage.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={gererEnvoi} className="space-y-4">
            <ChampFlottant
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              disabled={chargement}
            />

            <ChampFlottant
              id="motDePasse"
              label="Mot de passe"
              type="password"
              value={motDePasse}
              onChange={setMotDePasse}
              disabled={chargement}
            />

            {erreur && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  error
                </span>
                {erreur}
              </p>
            )}

            <Button
              type="submit"
              disabled={chargement}
              className="w-full h-12 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[15px] rounded-xl transition-colors disabled:opacity-60"
            >
              {chargement ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Mentions */}
          <p className="text-xs text-slate-400 text-center mt-8">
            © 2026 Stagio Technologies
          </p>
        </div>
      </div>
    </div>
  );
}

export default Connexion;