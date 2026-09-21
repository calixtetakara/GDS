import { useState } from "react";
import { Mail, KeyRound, Copy, Check, X } from "lucide-react";

function CredentialsModal({ email, motDePasse, nom, emailEnvoye, onFermer }) {
  const [copies, setCopies] = useState({});

  async function copier(valeur, champ) {
    try {
      await navigator.clipboard.writeText(valeur);
      setCopies({ ...copies, [champ]: true });
      setTimeout(() => setCopies((prev) => ({ ...prev, [champ]: false })), 1500);
    } catch {}
  }

  const champAffichage = "mt-2 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-200";
  const boutonCopie = "rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onFermer}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Compte créé 🎉</h3>
            <p className="mt-1 text-sm text-slate-500">
              {emailEnvoye
                ? "Un email avec ces identifiants vient d'être envoyé."
                : `Transmettez ces identifiants à ${nom || "l'utilisateur"} pour qu'il puisse se connecter.`}
            </p>
          </div>
          <button onClick={onFermer} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Mail size={13} />
              Email de connexion
            </p>
            <div className={champAffichage}>
              <span className="text-sm font-medium text-slate-800 break-all">{email}</span>
              <button className={boutonCopie} onClick={() => copier(email, "email")} title="Copier">
                {copies.email ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <KeyRound size={13} />
              Mot de passe
            </p>
            {motDePasse ? (
              <div className={champAffichage}>
                <span className="text-sm font-bold text-slate-800">{motDePasse}</span>
                <button className={boutonCopie} onClick={() => copier(motDePasse, "motDePasse")} title="Copier">
                  {copies.motDePasse ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Envoyé par email.</p>
            )}
          </div>

          <p className="mt-4 text-xs text-emerald-700">
            Astuce : changez ce mot de passe après la première connexion si vous le souhaitez.
          </p>
        </div>

        <button
          onClick={onFermer}
          className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
        >
          J'ai bien noté ces identifiants
        </button>
      </div>
    </div>
  );
}

export default CredentialsModal;