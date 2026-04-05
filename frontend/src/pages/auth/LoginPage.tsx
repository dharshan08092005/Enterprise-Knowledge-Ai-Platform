import { useState } from "react";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login({
        email,
        password
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


  return (
    <div className="h-full flex" style={{ background: 'var(--bg-auth)' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 backdrop-blur-2xl" style={{ borderRight: '1px solid var(--border-primary)' }}>
        <div className="max-w-md">
          <div className="w-16 h-16 bg-accent-gradient rounded-lg flex items-center justify-center mb-8 shadow-accent">
            <div className="w-8 h-8 border-3 border-white rounded-lg"></div>
          </div>

          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Welcome back to your workspace
          </h2>
          <p className="text-lg mb-12" style={{ color: 'var(--text-muted)' }}>
            Securely access your account and continue where you left off
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Bank-level security</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Your data is protected with 256-bit encryption
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Lightning fast</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Optimized performance for seamless productivity
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-slate-900"
                />
              ))}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>10,000+</span> teams trust us
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <div className="w-12 h-12 bg-accent-gradient rounded-lg flex items-center justify-center shadow-accent">
              <div className="w-6 h-6 border-2 border-white rounded-lg"></div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full border ${focusedField === "email"
                    ? "border-accent ring-2 ring-accent/20"
                    : ""
                    } rounded-lg px-12 py-3.5 placeholder-gray-400
                             focus:outline-none transition-all duration-200`}
                  style={{ background: 'var(--bg-input)', borderColor: focusedField === 'email' ? undefined : 'var(--border-input)', color: 'var(--text-primary)' }}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-accent hover:opacity-80 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full border ${focusedField === "password"
                    ? "border-accent ring-2 ring-accent/20"
                    : ""
                    } rounded-lg px-12 py-3.5 placeholder-gray-400
                             focus:outline-none transition-all duration-200`}
                  style={{ background: 'var(--bg-input)', borderColor: focusedField === 'password' ? undefined : 'var(--border-input)', color: 'var(--text-primary)' }}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                 className="w-4 h-4 rounded border-slate-700 bg-slate-800/50 text-accent 
                         focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}
              >
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`group w-full rounded-lg py-3.5 text-sm font-semibold text-gray-900 dark:text-white
                transition-all duration-200 flex items-center justify-center gap-2
                ${loading
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-accent-gradient shadow-accent shadow-lg"
                }`}
            >
              {loading ? "Signing in..." : "Sign In"}
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
              <span className="px-4" style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-secondary)' }}>
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
            <button className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-secondary)' }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Footer */}
          <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-accent font-medium hover:opacity-80 transition-colors"
            >
              Create one
            </a>
          </p>

          {/* <div className="mt-8 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-300 font-medium mb-1">
                  Secure Sign In
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-500">
                  Your connection is encrypted and your data is protected with industry-leading security measures
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;