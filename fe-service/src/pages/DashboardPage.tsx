import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  BarChart3,
  Package,
  LogOut,
} from "lucide-react";

import {
  signOut,
  clearSession,
  getUser,
} from "@/lib/auth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      clearSession();
      navigate("/signin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 pt-12">

        <div className="bg-gradient-to-br from-slate-50 to-indigo-100 rounded-[32px] p-12 mb-10">

          <h1 className="text-5xl font-bold text-slate-900">
            Grow smarter,
            <br />
            sell further.
          </h1>

          <p className="text-slate-500 mt-4 text-lg">
            Market intelligence and AI insights
            purpose-built for Indonesian online sellers.
          </p>

          <div className="mt-8">
            <p className="text-sm text-slate-500">
              Signed in as
            </p>

            <p className="font-semibold text-slate-900">
              {user?.email}
            </p>
          </div>

        </div>

        {/* Module Section */}

        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Business Intelligence Modules
          </h2>

          <p className="text-slate-500 mt-1">
            Select a module to start your analysis.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Market Entry */}

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition">

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <TrendingUp className="text-blue-600" />
            </div>

            <h3 className="text-xl font-semibold">
              Market Entry Analysis
            </h3>

            <p className="text-slate-500 mt-3 mb-6">
              Evaluate market potential,
              competitors, and expansion
              opportunities before entering
              a new market.
            </p>

            <button
              className="bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-5 py-3 rounded-xl"
            >
              Open Module
            </button>

          </div>

          {/* Product Management */}

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition">

            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
              <Package className="text-orange-600" />
            </div>

            <h3 className="text-xl font-semibold">
              Product Management
            </h3>

            <p className="text-slate-500 mt-3 mb-6">
              Product registration,
              demand forecasting,
              clustering, inventory
              planning, and pricing.
            </p>

            <button
              onClick={() =>
                navigate("/products")
              }
              className="bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-5 py-3 rounded-xl"
            >
              Open Module
            </button>

          </div>

          {/* Marketing */}

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition">

            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <BarChart3 className="text-green-600" />
            </div>

            <h3 className="text-xl font-semibold">
              Intelligence Marketing
            </h3>

            <p className="text-slate-500 mt-3 mb-6">
              Understand customer behaviour,
              sales trends, and marketing
              performance to improve growth.
            </p>

            <button
              onClick={() => navigate("/marketing")}
              className="bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-5 py-3 rounded-xl"
            >
              Open Module
            </button>

          </div>



        </div>

        {/* Footer */}

        <div className="mt-12 pb-12">

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 border border-slate-200 hover:border-red-400 hover:text-red-500 px-5 py-3 rounded-xl transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>

        </div>

      </div>

    </div>
  );
}