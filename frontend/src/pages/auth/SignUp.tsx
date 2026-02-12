import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signup } from "@/services/authService";
import { Link } from "react-router-dom";

interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const [form, setForm] = useState<SignUpForm>({
    name: "",
    email: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await signup({
        name: form.name,
        email: form.email,
        password: form.password
      });

      // Store access token (short-lived)
      localStorage.setItem("accessToken", data.token);

      // Redirect to protected area
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Unlimited projects",
    "24/7 Priority support",
    "Advanced analytics"
  ];

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-6 flex items-center justify-between">
            <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white rounded-lg"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Create your account
              </h1>
              <p className="text-slate-400">
                Join thousands of teams already using our platform
              </p>
            </div>
          </div>

          {/* Form */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full bg-slate-800/50 border ${
                    focusedField === "name"
                      ? "border-indigo-500 ring-2 ring-indigo-500/20"
                      : "border-slate-700"
                  } rounded-xl px-12 py-3.5 text-white placeholder-slate-500
                             focus:outline-none transition-all duration-200`}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full bg-slate-800/50 border ${
                    focusedField === "email"
                      ? "border-indigo-500 ring-2 ring-indigo-500/20"
                      : "border-slate-700"
                  } rounded-xl px-12 py-3.5 text-white placeholder-slate-500
                             focus:outline-none transition-all duration-200`}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full bg-slate-800/50 border ${
                    focusedField === "password"
                      ? "border-indigo-500 ring-2 ring-indigo-500/20"
                      : "border-slate-700"
                  } rounded-xl px-12 py-3.5 text-white placeholder-slate-500
                             focus:outline-none transition-all duration-200`}
                  placeholder="Create a strong password"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Must be at least 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`group w-full rounded-xl py-3.5 text-sm font-semibold text-white
                transition-all duration-200 flex items-center justify-center gap-2
                ${
                  loading
                    ? "bg-slate-600 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                }
              `}
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-700 rounded-2xl justify-center text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Footer */}
          <p className="text-sm text-slate-400 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>

          {/* <p className="text-xs text-slate-500 text-center mt-3">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-slate-400 hover:text-slate-300 underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-slate-400 hover:text-slate-300 underline">
              Privacy Policy
            </a>
          </p> */}
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-linear-to-br from-indigo-600/10 to-purple-600/10 backdrop-blur-3xl border-l border-slate-800/50">
        <div className="max-w-md">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-slate-400 text-lg">
              Join our platform and unlock powerful features designed to accelerate your growth
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature}</h3>
                  <p className="text-slate-400 text-sm">
                    Get access to premium features that help you work smarter
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt="User"
                className="w-12 h-12 rounded-full border-2 border-indigo-500/50"
              />
              <div>
                <div className="text-white font-semibold">Sarah Johnson</div>
                <div className="text-slate-400 text-sm">Product Designer</div>
              </div>
            </div>
            <p className="text-slate-300 text-sm italic">
              "This platform has transformed how our team collaborates. The intuitive interface and powerful features make it indispensable."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;