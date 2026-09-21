// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ============================================================
// CONSTANTES DE DONNÉES
// ============================================================

/**
 * Statistiques affichées dans le bloc "Aperçu du tableau de bord".
 * @type {Array<{
 *   value: number,
 *   label: string,
 *   icon: string,
 *   featured?: boolean
 * }>}
 */
const STATS = [
  { value: 24, label: "Stagiaires", icon: "groups" },
  { value: 8, label: "Encadreurs", icon: "supervisor_account" },
  { value: 12, label: "Projets", icon: "folder_open" },
  { value: 17, label: "À valider", icon: "pending_actions", featured: true },
];

/**
 * Cartes de la section "Fonctionnalités clés".
 * Chaque entrée regroupe ses classes Tailwind pour rester lisible.
 * @type {Array<{
 *   icon: string,
 *   halo: string,
 *   iconBg: string,
 *   iconColor: string,
 *   title: string,
 *   description: string
 * }>}
 */
const FEATURES = [
  {
    icon: "badge",
    halo: "bg-indigo-50/50 group-hover:bg-indigo-100/50",
    iconBg: "from-indigo-50 to-indigo-100 border-indigo-200/60",
    iconColor: "text-indigo-600",
    title: "Suivi & progression",
    description:
      "Centralisez les dossiers, suivez l'avancement et visualisez le parcours de chaque stagiaire en temps réel.",
  },
  {
    icon: "person_add",
    halo: "bg-blue-50/50 group-hover:bg-blue-100/50",
    iconBg: "from-indigo-50 to-indigo-100 border-indigo-200/60",
    iconColor: "text-indigo-600",
    title: "Affectations & encadrement",
    description:
      "Liaison fluide stagiaire-tuteur et répartition équilibrée de la charge des encadreurs en quelques clics.",
  },
  {
    icon: "fact_check",
    halo: "bg-emerald-50/50 group-hover:bg-emerald-100/50",
    iconBg: "from-emerald-50 to-emerald-100 border-emerald-200/60",
    iconColor: "text-emerald-600",
    title: "Dépôt & validation",
    description:
      "Échanges hebdomadaires transparents, annotations en direct et validation officielle des livrables de stage.",
  },
];

/**
 * Cartes de la section "Rôles & Espaces".
 * `icon` est un nœud JSX (SVG inline) pour éviter une dépendance externe.
 * @type {Array<{
 *   id: string,
 *   tag: string,
 *   tagClass: string,
 *   title: string,
 *   description: string,
 *   bullets: string[],
 *   featured: boolean,
 *   icon: JSX.Element
 * }>}
 */
const ROLES = [
  {
    id: "admin",
    tag: "Pilotage",
    tagClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
    title: "Administrateur",
    description:
      "Tableau de bord global, gestion des utilisateurs, affectations et bilans.",
    bullets: [
      "Supervision intégrale des promotions & bilans",
      "Affectation encadreur / stagiaire simplifiée",
    ],
    featured: false,
    icon: (
      <svg
        className="w-6 h-6 stroke-current fill-none stroke-2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect height="7" width="7" x="3" y="3" />
        <rect height="7" width="7" x="14" y="3" />
        <rect height="7" width="7" x="14" y="14" />
        <rect height="7" width="7" x="3" y="14" />
      </svg>
    ),
  },
  {
    id: "encadreur",
    tag: "Suivi Actif",
    tagClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
    title: "Encadreur",
    description: "Suivi des stagiaires, projets, tâches et validation des rapports.",
    bullets: [
      "Validation hebdomadaire des livrables",
      "Feedbacks et annotations en direct",
    ],
    featured: true,
    icon: (
      <svg
        className="w-6 h-6 stroke-current fill-none stroke-2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "stagiaire",
    tag: "Apprenant",
    tagClass: "text-slate-600 bg-slate-100 border-slate-200",
    title: "Stagiaire",
    description: "Profil, tâches, projets et soumission des rapports personnels.",
    bullets: [
      "Dépôt simple des comptes-rendus",
      "Suivi de validation en direct avec le tuteur",
    ],
    featured: false,
    icon: (
      <svg
        className="w-6 h-6 stroke-current fill-none stroke-2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

// ============================================================
// HOOKS PERSONNALISÉS
// ============================================================

/**
 * Anime une valeur numérique de 0 jusqu'à `target`.
 * Utilise requestAnimationFrame + easing easeOutCubic.
 *
 * @param {number} target - Valeur finale à atteindre.
 * @param {number} [duration=1400] - Durée de l'animation en ms.
 * @param {boolean} [start=false] - Déclenche l'animation quand true.
 * @returns {number} Valeur courante (entière).
 */
function useCountUp(target, duration = 1400, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let rafId;
    const t0 = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, start]);

  return count;
}

/**
 * Détecte si l'élément référencé entre dans le viewport.
 * Ne déclenche qu'une seule fois (utile pour animer au scroll).
 *
 * @param {React.RefObject<HTMLElement>} ref - Référence DOM à observer.
 * @param {number} [threshold=0.25] - Ratio de visibilité requis (0 → 1).
 * @returns {boolean} `true` dès que l'élément est visible.
 */
function useInView(ref, threshold = 0.25) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

// ============================================================
// COMPOSANTS
// ============================================================

/**
 * Carte statistique individuelle du bloc "Aperçu du tableau de bord".
 *
 * @param {object} props
 * @param {number} props.value - Nombre cible (animé).
 * @param {string} props.label - Libellé sous le chiffre.
 * @param {string} props.icon - Nom de l'icône Material Symbols.
 * @param {boolean} [props.featured] - Style mis en avant (indigo vif).
 * @param {boolean} props.animate - Lance l'animation d'apparition.
 * @param {number} props.delay - Délai en ms pour l'effet cascade.
 */
function StatCard({ value, label, icon, featured, animate, delay }) {
  const count = useCountUp(value, 1400, animate);
  const display = String(count).padStart(2, "0");

  return (
    <div
      className={[
        "relative rounded-xl px-2 py-3 border text-center",
        "transition-all duration-500 hover:-translate-y-0.5",
        featured
          ? "bg-indigo-600/40 border-indigo-300/50 hover:border-indigo-200/70"
          : "bg-indigo-950/60 border-white/20 hover:border-white/35 hover:bg-indigo-950/70",
      ].join(" ")}
      style={{
        opacity: animate ? 1 : 0,
        transform: animate ? "translateY(0)" : "translateY(10px)",
        transitionDelay: `${delay}ms`,
        transitionProperty: "opacity, transform, background-color, border-color",
      }}
    >
      {/* Icône */}
      <span
        className={[
          "material-symbols-outlined text-[14px]",
          featured ? "text-white" : "text-indigo-100",
        ].join(" ")}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Chiffre animé */}
      <div className="mt-1 text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-white">
        {display}
      </div>

      {/* Libellé */}
      <div
        className={[
          "mt-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
          featured ? "text-white" : "text-indigo-50",
        ].join(" ")}
      >
        {label}
      </div>
    </div>
  );
}

/**
 * Bloc "Aperçu du tableau de bord" — image de fond + 4 stats animées.
 * @returns {JSX.Element}
 */
function HeroStats() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef);

  return (
    <section ref={sectionRef} className="mt-12 sm:mt-14 max-w-3xl mx-auto">
      {/* Cadre extérieur — léger fond indigo */}
      <div className="rounded-3xl p-2 bg-indigo-100/50 ring-1 ring-indigo-200/50">
        {/* Carte interne — image de fond */}
        <div
          className="relative rounded-[20px] overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/1 (2).jpg')" }}
        >
          {/* Voile sombre pour garantir la lisibilité du contenu */}
          <div className="absolute inset-0 bg-black/50 z-[1]" aria-hidden="true" />
          <div className="absolute inset-0 bg-indigo-750/90 z-[1]" aria-hidden="true" />

          {/* Contenu */}
          <div className="relative z-[2] px-5 sm:px-7 py-7 sm:py-8">
            {/* En-tête du bloc */}
            <div className="flex items-center gap-2 mb-5">
              <span
                className="material-symbols-outlined text-indigo-200 text-[16px]"
                aria-hidden="true"
              >
                dashboard
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-50">
                Aperçu du tableau de bord
              </span>
            </div>

            {/* Grille statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {STATS.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  {...stat}
                  animate={inView}
                  delay={index * 70}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

/**
 * Page d'accueil publique de Stagio.
 * Structure : Header → Hero → Fonctionnalités → Rôles → CTA → Footer.
 * @returns {JSX.Element}
 */
export default function Accueil() {
  // Change l'apparence du header au scroll
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#F8FAFC] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white relative overflow-x-hidden min-h-screen">
      {/* ---------------------------------------------------------
          Fond décoratif (blobs + grille)
          --------------------------------------------------------- */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-indigo-200/40 via-purple-100/35 to-blue-200/30 blur-[110px] rounded-full" />
        <div className="absolute top-[35%] -left-32 w-[600px] h-[500px] bg-gradient-to-br from-indigo-100/40 to-purple-100/30 blur-[130px] rounded-full" />
        <div className="absolute top-[65%] -right-32 w-[600px] h-[500px] bg-blue-100/40 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-grid-pattern opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      {/* =========================================================
          1. HEADER
          ========================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg border-b border-slate-200/80 shadow-sm"
            : "bg-white/80 backdrop-blur-md border-b border-slate-200/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl animate-pulse" />
              <img
                src="/logo.png"
                alt="Stagio"
                className="relative h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </Link>

          {/* Navigation principale */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-slate-600 hover:text-indigo-600 text-lg font-medium transition-colors duration-150"
            >
              Fonctionnalités
            </a>
            <a
              href="#roles"
              className="text-slate-600 hover:text-indigo-600 text-lg font-medium transition-colors duration-150"
            >
              Rôles &amp; Espaces
            </a>
          </nav>

          {/* CTA header */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-150"
            >
              <span>Accéder à l'espace</span>
              <span className="material-symbols-outlined text-[14px] ml-1 font-semibold">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* =========================================================
            2. HERO
            ========================================================= */}
        <section className="pt-20 sm:pt-28 px-6 pb-20 sm:pb-28 relative overflow-hidden">
          {/* Image de fond du hero */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src="/accueil.png"
              alt=""
              className="w-full h-full object-cover opacity-40"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/50 via-transparent to-[#F8FAFC]" />
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Titre */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto"
              style={{ lineHeight: 1.3 }}
            >
              Gérez tous vos stages{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
                en un seul endroit.
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="mt-7 text-slate-600 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
              Stagio aide les administrations, encadreurs et stagiaires à collaborer
              plus simplement, avec un suivi clair, rapide et professionnel.
            </p>

            {/* CTA principal */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/35 hover:shadow-indigo-600/45 hover:-translate-y-0.5 active:translate-y-0 text-base transition-all duration-150 text-center flex items-center justify-center gap-2 ring-1 ring-white/20"
              >
                <span>Accéder à l'espace</span>
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Bloc stats */}
            <HeroStats />
          </div>
        </section>

        {/* =========================================================
            3. FONCTIONNALITÉS
            ========================================================= */}
        <section className="py-24 relative" id="features">
          <div className="max-w-6xl mx-auto px-6">
            {/* En-tête de section */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span>Fonctionnalités clés</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                Tout ce qu'il faut pour piloter les stages
              </h2>
              <p className="text-slate-600 text-lg mt-4 leading-relaxed max-w-2xl mx-auto">
                Une plateforme unique pensée pour simplifier le suivi, la
                collaboration et la validation de chaque étape de cursus.
              </p>
            </div>

            {/* Cartes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="group relative bg-white/95 rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-colors pointer-events-none ${feature.halo}`}
                  />
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr border flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:bg-indigo-600 transition-all duration-300 mb-6 ${feature.iconBg} ${feature.iconColor}`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {feature.icon}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-indigo-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            4. RÔLES & ESPACES
            ========================================================= */}
        <section
          className="py-24 relative bg-slate-100/60 border-y border-slate-200/80"
          id="roles"
        >
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            {/* En-tête de section */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[14px] text-indigo-600">
                  groups
                </span>
                <span>Espaces sur-mesure</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                Une expérience pensée pour chaque profil
              </h2>
              <p className="text-slate-600 text-lg mt-3">
                Chaque utilisateur dispose d'un espace adapté à ses responsabilités.
              </p>
            </div>

            {/* Cartes rôles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {ROLES.map((role) => (
                <article
                  key={role.id}
                  className={`bg-white rounded-2xl p-8 border shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                    role.featured
                      ? "border-indigo-200 ring-1 ring-indigo-50"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                        {role.icon}
                      </div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider border px-3 py-1 rounded-md shrink-0 ${role.tagClass}`}
                      >
                        {role.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {role.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                      {role.description}
                    </p>
                    <div className="h-px bg-slate-100 my-6" />
                    <ul className="space-y-3.5 text-sm text-slate-600">
                      {role.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[15px] font-bold">
                              check
                            </span>
                          </span>
                          <span
                            className={
                              role.featured ? "font-medium text-slate-800" : ""
                            }
                          >
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            5. CTA FINAL
            ========================================================= */}
        <section className="max-w-5xl mx-auto px-6 my-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0e0c38] to-indigo-950 border border-indigo-500/30 p-10 md:p-16 text-center text-white shadow-2xl shadow-indigo-950/60">
            {/* Halos décoratifs */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/25 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/25 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              {/* Titre */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Centralisez la gestion de vos stages dès aujourd'hui.
              </h2>

              {/* Description */}
              <p className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed">
                Rejoignez les institutions qui font confiance à Stagio pour
                coordonner leurs stagiaires et encadreurs en toute sérénité.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-xl shadow-indigo-600/50 transition-all duration-150 inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 ring-1 ring-white/30"
                >
                  <span>Accéder à l'espace</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          6. FOOTER
          ========================================================= */}
      <footer className="border-t border-slate-200/80 py-10 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          {/* Copyright */}
          <div className="flex items-center gap-3 font-normal">
            <img
              src="/logo.png"
              alt="Stagio"
              className="h-7 w-7 object-contain"
            />
            <span>© 2026 Stagio Technologies. Tous droits réservés.</span>
          </div>

          {/* Liens + statut */}
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Conditions
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Mentions légales
            </a>
            <div className="font-medium text-slate-600 flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Systèmes opérationnels
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}