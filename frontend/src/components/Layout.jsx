import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

function Layout({ utilisateur, onDeconnexion, children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <Sidebar utilisateur={utilisateur} onDeconnexion={onDeconnexion} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header utilisateur={utilisateur} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
