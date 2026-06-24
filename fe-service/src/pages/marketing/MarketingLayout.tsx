import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Package,
  Zap,
  Lightbulb,
  Layers,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { path: "/marketing", label: "Revenue Overview", icon: BarChart3, exact: true },
  { path: "/marketing/sales", label: "Top Sales", icon: Package },
  { path: "/marketing/nett", label: "Net Profit", icon: Zap },
  { path: "/marketing/product-insight", label: "Product Insight", icon: Layers },
  { path: "/marketing/recommendation", label: "Product Intelligence", icon: Lightbulb },
];

export default function MarketingLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-100 min-h-screen sticky top-0 self-start">
        <div className="p-5 border-b border-slate-100">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm mb-5 transition"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <BarChart3 size={17} className="text-green-600" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Module</p>
              <p className="font-semibold text-slate-900 text-sm leading-tight">
                Intelligence Marketing
              </p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === path
              : location.pathname.startsWith(path);

            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
