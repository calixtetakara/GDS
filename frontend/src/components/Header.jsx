import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, CheckCheck } from "lucide-react";
import * as notificationService from "../api/notificationService";

function Header({ utilisateur }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const [requete, setRequete] = useState("");
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const initiales = utilisateur.nom
    .split(" ")
    .map((mot) => mot[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    chargerNotifications();
    const interval = setInterval(chargerNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setRequete(new URLSearchParams(location.search).get("recherche") ?? "");
  }, [location]);

  function gererRecherche(e) {
    e.preventDefault();
    const q = requete.trim();
    const cible = utilisateur?.role === "stagiaire" ? "/rapports" : "/stagiaires";
    navigate(q ? `${cible}?recherche=${encodeURIComponent(q)}` : cible);
    setRequete("");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function chargerNotifications() {
    try {
      const [data, count] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch {}
  }

  async function marquerCommeLu(id) {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }

  async function marquerToutLu() {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }

  function formaterDate(dateStr) {
    const d = new Date(dateStr);
    const maintenant = new Date();
    const diffMs = maintenant - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffHeures = Math.floor(diffMin / 60);
    if (diffHeures < 24) return `Il y a ${diffHeures}h`;
    const diffJours = Math.floor(diffHeures / 24);
    if (diffJours < 7) return `Il y a ${diffJours}j`;
    return d.toLocaleDateString("fr-FR");
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={gererRecherche} className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm shadow-slate-200/50 max-w-xl">
          <Search size={16} className="text-slate-400" />
          <input
            value={requete}
            onChange={(e) => setRequete(e.target.value)}
            placeholder="Rechercher un stagiaire, un rapport..."
            className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOuvert((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {ouvert && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={marquerToutLu}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <CheckCheck size={12} />
                      Tout marquer lu
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-400">
                      Aucune notification
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) marquerCommeLu(n.id);
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-slate-50 transition hover:bg-slate-50 ${
                          !n.is_read ? "bg-indigo-50/40" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!n.is_read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{formaterDate(n.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 shadow-sm">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{utilisateur.nom}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{utilisateur.role}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white shadow-md shadow-indigo-200">
              {initiales}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
