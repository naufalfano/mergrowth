import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { signOut, clearSession, getUser } from "@/lib/auth";

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <p className="text-sm text-gray-400 mb-6">
        Signed in as <span className="text-black font-medium">{user?.email}</span>
      </p>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 border border-gray-200 hover:border-black text-sm text-gray-600 hover:text-black px-5 py-2.5 rounded-xl transition"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  );
}
