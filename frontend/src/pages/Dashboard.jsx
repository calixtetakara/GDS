import { useEffect, useState } from "react";
import {
  Users,
  UserCog,
  ClipboardList,
  FolderKanban,
  FileText,
  BriefcaseBusiness,
  CheckCircle2,
  FileSignature,
} from "lucide-react";
import * as internService from "../api/internService";
import * as supervisorService from "../api/supervisorService";
import * as projectService from "../api/projectService";
import * as taskService from "../api/taskService";
import * as reportService from "../api/reportService";

function Dashboard({ utilisateur }) {
  const role = utilisateur?.role || "stagiaire";
  const [stats, setStats] = useState({ internes: 0, encadreurs: 0, projets: 0, rapportsEnAttente: 0, taches: 0, rapports: 0 });
  const [rapportsRecents, setRapportsRecents] = useState([]);

  useEffect(() => {
    Promise.all([internService.getAll(), supervisorService.getAll(), projectService.getAll(), taskService.getAll(), reportService.getAll()])
      .then(([internes, encadreurs, projets, taches, rapports]) => {
        const listeRapports = Array.isArray(rapports) ? rapports : [];
        setStats({
          internes: internes.length,
          encadreurs: encadreurs.length,
          projets: projets.length,
          taches: taches.length,
          rapports: listeRapports.length,
          rapportsEnAttente: listeRapports.filter((r) => r.status === "En attente").length,
        });
        setRapportsRecents(
          listeRapports.slice(0, 3).map((r) => ({
            id: r.id,
            titre: "Nouveau rapport déposé",
            detail: `${r.intern?.user?.first_name ?? "Un"} ${r.intern?.user?.last_name ?? "stagiaire"} — ${r.week ?? ""}`,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const adminStats = [
    { label: "Stagiaires", valeur: stats.internes, icone: Users, couleur: "bg-indigo-50 text-indigo-600" },
    { label: "Encadreurs", valeur: stats.encadreurs, icone: UserCog, couleur: "bg-teal-50 text-teal-600" },
    { label: "Projets", valeur: stats.projets, icone: FolderKanban, couleur: "bg-amber-50 text-amber-600" },
    { label: "Rapports en attente", valeur: stats.rapportsEnAttente, icone: FileText, couleur: "bg-rose-50 text-rose-600" },
  ];

  const encadreurStats = [
    { label: "Stagiaires suivis", valeur: stats.internes, icone: Users, couleur: "bg-indigo-50 text-indigo-600" },
    { label: "Projets", valeur: stats.projets, icone: BriefcaseBusiness, couleur: "bg-teal-50 text-teal-600" },
    { label: "Tâches", valeur: stats.taches, icone: ClipboardList, couleur: "bg-amber-50 text-amber-600" },
    { label: "Rapports à valider", valeur: stats.rapportsEnAttente, icone: FileText, couleur: "bg-rose-50 text-rose-600" },
  ];

  const stagiaireStats = [
    { label: "Projets", valeur: stats.projets, icone: FolderKanban, couleur: "bg-indigo-50 text-indigo-600" },
    { label: "Tâches", valeur: stats.taches, icone: ClipboardList, couleur: "bg-teal-50 text-teal-600" },
    { label: "Rapports", valeur: stats.rapports, icone: FileText, couleur: "bg-amber-50 text-amber-600" },
    { label: "Statut", valeur: "Actif", icone: CheckCircle2, couleur: "bg-emerald-50 text-emerald-600" },
  ];

  const statsParRole = {
    administrateur: adminStats,
    encadreur: encadreurStats,
    stagiaire: stagiaireStats,
  };

  const statsAffichees = statsParRole[role] || stagiaireStats;

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Tableau de bord</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Bienvenue, {utilisateur?.nom || "Utilisateur"}</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
          <CheckCircle2 size={14} />
          {role === "administrateur" ? "Accès administrateur" : role === "encadreur" ? "Accès encadreur" : "Accès stagiaire"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsAffichees.map((stat) => {
          const Icone = stat.icone;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${stat.couleur}`}>
                <Icone size={20} />
              </div>
              <p className="text-3xl font-black text-slate-900">{stat.valeur}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-slate-800">Activités récentes</h3>
          </div>

          <div className="space-y-4">
            {rapportsRecents.length === 0 && <p className="text-sm text-slate-400">Aucune activité récente.</p>}
            {rapportsRecents.map((activite) => (
              <div key={activite.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FileSignature size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{activite.titre}</p>
                  <p className="mt-1 text-sm text-slate-500">{activite.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;