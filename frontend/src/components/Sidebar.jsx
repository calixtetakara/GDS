import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Link2,
  ClipboardList,
  FileText,
  Briefcase,
  CheckSquare,
  LogOut,
  UserRound,
  FolderKanban,
  ChartColumnBig,
} from "lucide-react";

const liensParRole = {
  administrateur: [
    { chemin: "/dashboard", label: "Dashboard", icone: LayoutDashboard },
    { chemin: "/utilisateurs", label: "Utilisateurs", icone: Users },
    { chemin: "/stagiaires", label: "Stagiaires", icone: UserRound },
    { chemin: "/encadreurs", label: "Encadreurs", icone: UserCog },
    { chemin: "/affectations", label: "Affectations", icone: Link2 },
    { chemin: "/projets", label: "Projets", icone: FolderKanban },
    { chemin: "/taches", label: "Tâches", icone: CheckSquare },
    { chemin: "/rapports", label: "Rapports", icone: FileText },
  ],
  encadreur: [
    { chemin: "/dashboard", label: "Dashboard", icone: LayoutDashboard },
    { chemin: "/stagiaires", label: "Mes stagiaires", icone: Users },
    { chemin: "/projets", label: "Projets", icone: Briefcase },
    { chemin: "/taches", label: "Tâches", icone: CheckSquare },
    { chemin: "/rapports", label: "Rapports", icone: FileText },
  ],
  stagiaire: [
    { chemin: "/dashboard", label: "Dashboard", icone: LayoutDashboard },
    { chemin: "/profil", label: "Mon profil", icone: UserRound },
    { chemin: "/projets", label: "Mes projets", icone: Briefcase },
    { chemin: "/taches", label: "Mes tâches", icone: ClipboardList },
    { chemin: "/rapports", label: "Mes rapports", icone: FileText },
  ],
};

function Sidebar({ utilisateur, onDeconnexion }) {
  const role = utilisateur?.role || "stagiaire";
  const liens = liensParRole[role] || [];
  const location = useLocation();

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur-sm flex flex-col shadow-sm">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-indigo-500">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white shadow-inner shadow-indigo-950/30">
          S
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-white">Stagio</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-indigo-100">Gestion des stages</p>
        </div>
      </div>

      <div className="px-3 py-4">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Navigation
        </p>
        <nav className="flex flex-col gap-1">
          {liens.map((lien) => {
            const Icone = lien.icone;
            const estActif = location.pathname === lien.chemin;
            return (
              <Link
                key={lien.chemin}
                to={lien.chemin}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  estActif
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    estActif ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icone size={16} />
                </div>
                <span>{lien.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-200 px-3 py-4">
        <button
          onClick={onDeconnexion}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <LogOut size={16} />
          </div>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
