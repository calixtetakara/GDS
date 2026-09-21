import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Connexion from "./pages/Connexion";
import Dashboard from "./pages/Dashboard";
import Stagiaires from "./pages/Stagiaires";
import Encadreurs from "./pages/Encadreurs";
import Affectations from "./pages/Affectations";
import Activites from "./pages/Activites";
import Rapports from "./pages/Rapports";
import Utilisateurs from "./pages/Utilisateurs";
import Projets from "./pages/Projets";
import Taches from "./pages/Taches";
import Profil from "./pages/Profil";
import Layout from "./components/Layout";
import { login, logout, getUtilisateur, fetchUtilisateur } from "./api/authService";

function App() {
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(() => getUtilisateur());

  return (
    <BrowserRouter>
      <ContenuApp
        utilisateurConnecte={utilisateurConnecte}
        setUtilisateurConnecte={setUtilisateurConnecte}
      />
    </BrowserRouter>
  );
}

function RouteProtegee({ utilisateurConnecte, onDeconnexion }) {
  if (!utilisateurConnecte) return <Navigate to="/login" />;
  return (
    <Layout utilisateur={utilisateurConnecte} onDeconnexion={onDeconnexion}>
      <Outlet />
    </Layout>
  );
}

const accesParPage = {
  "/utilisateurs": ["administrateur"],
  "/stagiaires": ["administrateur", "encadreur"],
  "/encadreurs": ["administrateur", "encadreur"],
  "/affectations": ["administrateur", "encadreur"],
  "/projets": ["administrateur", "encadreur", "stagiaire"],
  "/taches": ["administrateur", "encadreur", "stagiaire"],
  "/activites": ["administrateur", "encadreur", "stagiaire"],
  "/rapports": ["administrateur", "encadreur", "stagiaire"],
  "/dashboard": ["administrateur", "encadreur", "stagiaire"],
  "/profil": ["administrateur", "encadreur", "stagiaire"],
};

function AccesParRole({ utilisateur, children, chemin }) {
  const role = utilisateur?.role;
  const rolesAutorises = accesParPage[chemin] || [];
  if (role && rolesAutorises.length > 0 && !rolesAutorises.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ContenuApp({ utilisateurConnecte, setUtilisateurConnecte }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (getUtilisateur()) {
      fetchUtilisateur()
        .then((utilisateur) => {
          if (utilisateur) setUtilisateurConnecte(utilisateur);
        })
        .catch(() => {
          logout();
          setUtilisateurConnecte(null);
        });
    }
  }, [setUtilisateurConnecte]);

  async function gererConnexion(email, motDePasse) {
    try {
      const utilisateur = await login(email, motDePasse);
      setUtilisateurConnecte(utilisateur);

      const redirectionParRole = {
        administrateur: "/dashboard",
        encadreur: "/dashboard",
        stagiaire: "/dashboard",
        profil: "/profil",
      };

      navigate(redirectionParRole[utilisateur.role] || "/dashboard");
      return { succes: true };
    } catch (err) {
      return { succes: false, message: err.response?.data?.message || "Identifiants incorrects." };
    }
  }

  function gererDeconnexion() {
    logout();
    setUtilisateurConnecte(null);
    navigate("/");
  }

  return (
    <Routes>
      <Route path="/" element={utilisateurConnecte ? <Navigate to="/dashboard" replace /> : <Accueil />} />
      <Route path="/login" element={utilisateurConnecte ? <Navigate to="/dashboard" replace /> : <Connexion onConnexion={gererConnexion} />} />

      <Route element={<RouteProtegee utilisateurConnecte={utilisateurConnecte} onDeconnexion={gererDeconnexion} />}>
        <Route path="/dashboard" element={<AccesParRole chemin="/dashboard" utilisateur={utilisateurConnecte}><Dashboard utilisateur={utilisateurConnecte} /></AccesParRole>} />
        <Route path="/utilisateurs" element={<AccesParRole chemin="/utilisateurs" utilisateur={utilisateurConnecte}><Utilisateurs /></AccesParRole>} />
        <Route path="/stagiaires" element={<AccesParRole chemin="/stagiaires" utilisateur={utilisateurConnecte}><Stagiaires utilisateur={utilisateurConnecte} /></AccesParRole>} />
        <Route path="/encadreurs" element={<AccesParRole chemin="/encadreurs" utilisateur={utilisateurConnecte}><Encadreurs /></AccesParRole>} />
        <Route path="/affectations" element={<AccesParRole chemin="/affectations" utilisateur={utilisateurConnecte}><Affectations /></AccesParRole>} />
        <Route path="/projets" element={<AccesParRole chemin="/projets" utilisateur={utilisateurConnecte}><Projets utilisateur={utilisateurConnecte} /></AccesParRole>} />
        <Route path="/taches" element={<AccesParRole chemin="/taches" utilisateur={utilisateurConnecte}><Taches utilisateur={utilisateurConnecte} /></AccesParRole>} />
        <Route path="/activites" element={<AccesParRole chemin="/activites" utilisateur={utilisateurConnecte}><Activites /></AccesParRole>} />
        <Route path="/profil" element={<AccesParRole chemin="/profil" utilisateur={utilisateurConnecte}><Profil /></AccesParRole>} />
        <Route path="/rapports" element={<AccesParRole chemin="/rapports" utilisateur={utilisateurConnecte}><Rapports utilisateur={utilisateurConnecte} /></AccesParRole>} />
      </Route>
    </Routes>
  );
}

export default App;
