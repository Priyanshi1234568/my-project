import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const dashboardPath =
    auth?.role === "admin" ? "/admin" :
    auth?.role === "agent" ? "/agent" :
    "/chat";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to={dashboardPath} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-sm">
            C
          </div>

          <div>
            <h1 className="text-base font-black text-slate-900">Chat Support</h1>
            <p className="text-xs text-slate-500">Helpdesk Dashboard</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {auth?.role === "user" && (
            <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" to="/chat">
              Chat
            </Link>
          )}

          {auth?.role === "admin" && (
            <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" to="/admin">
              Admin
            </Link>
          )}

          {auth?.role === "agent" && (
            <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" to="/agent">
              Agent
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}