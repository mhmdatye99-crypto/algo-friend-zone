import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from "lucide-react";
import OnboardingSlides from "@/components/onboarding/OnboardingSlides";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error("فشل تسجيل الدخول بـ Google");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد التسجيل.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-secondary/40 rounded-xl px-4 py-3 pr-11 text-sm font-mono border border-border/20 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/40";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5" dir="rtl">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {showOnboarding ? (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-sm">
            <OnboardingSlides onComplete={() => setShowOnboarding(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            className="w-full max-w-sm space-y-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Logo */}
            <div className="text-center space-y-2">
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center glow-gold"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-7 h-7 text-primary" />
              </motion.div>
              <h1 className="text-2xl font-display font-bold tracking-wider">NEXUS TRADE AI</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {mode === "login" ? "سجّل دخولك للاتصال بـ Nexus" : "أنشئ حسابك وانضم إلى Nexus"}
              </p>
            </div>

            {/* Google Fast-Track */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-3 text-sm font-mono font-bold transition-all border border-border/30 bg-secondary/30 hover:bg-secondary/50 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              الدخول السريع بـ Google
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/20" />
              <span className="text-[10px] font-mono text-muted-foreground">أو بالبريد الإلكتروني</span>
              <div className="flex-1 h-px bg-border/20" />
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 bg-secondary/30 border border-border/20 rounded-xl p-1 gap-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 ${
                    mode === m
                      ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "تسجيل الدخول" : "حساب جديد"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative">
                      <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <input
                        type="text"
                        placeholder="الاسم الظاهر"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl bg-primary/15 text-primary text-sm font-mono font-bold border border-primary/25 hover:bg-primary/25 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 glow-gold"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : mode === "login" ? (
                  "الاتصال بـ Nexus"
                ) : (
                  "إنشاء الحساب"
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
