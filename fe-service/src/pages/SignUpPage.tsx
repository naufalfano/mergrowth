import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthIllustration from "@/components/AuthIllustration";
import { signUp, saveSession } from "@/lib/auth";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signUp(email, password, fullName);
      saveSession(data);
      navigate(data.onboarding_completed ? "/dashboard" : "/onboarding");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-screen bg-white p-3 gap-3">
      {/* Left — form */}
      <div className="flex flex-col w-full max-w-xl px-10 lg:px-16">
        {/* Logo pinned to top */}
        <div className="pt-10 flex flex-col gap-1">
          <img src="/logo.png" alt="mergrowth" className="h-10 w-auto object-contain object-left" />
          <span className="text-sm font-normal text-gray-400 mt-1">Helping Indonesia SME's merchant to achieve growth.</span>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-black mb-1">Create account</h1>
        <p className="text-lg text-gray-400 mb-8">Register for free.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/10 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/10 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-[#1565c0]/10 transition pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-[#194be7] hover:bg-[#1340cc] text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#194be7] font-medium hover:underline">
            Sign in
          </Link>
        </p>
        </div>
      </div>

      {/* Right — illustration */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative rounded-3xl overflow-hidden">
        <AuthIllustration />
      </div>
    </div>
  );
}
