"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"controller" | "driver" | "commuter">("controller");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    emailOrId: "",
    password: "",
    email: "",
    phone: "",
  });

  const handleRoleChange = (selectedRole: "controller" | "driver" | "commuter") => {
    setRole(selectedRole);
    // Autofill templates to make hackathon testing smooth
    if (selectedRole === "driver") {
      setFormData({
        name: "Ramesh Kumar",
        emailOrId: "",
        email: "ramesh.driver@best.org",
        phone: "9876543210",
        password: "password123",
      });
    } else if (selectedRole === "controller") {
      setFormData(prev => ({ ...prev, emailOrId: "controller@best.org", password: "password123" }));
    } else {
      setFormData(prev => ({ ...prev, emailOrId: "priya.mehta@gmail.com", password: "password123" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const API_URL = "/api";
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    
    // Use the actual state password, unless it is the visual mask placeholder, in which case we map it for hackathon ease
    const passwordToSend = formData.password.includes("••") ? "password123" : formData.password;

    let payload: any = {};
    if (role === "driver") {
      if (isLogin) {
        payload = {
          email: formData.email,
          password: passwordToSend,
          role
        };
      } else {
        payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: passwordToSend,
          role
        };
      }
    } else {
      payload = isLogin
        ? { emailOrId: formData.emailOrId, password: passwordToSend, role }
        : { name: formData.name, emailOrId: formData.emailOrId, password: passwordToSend, role };
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      // Store auth state
      localStorage.setItem("samavesh_token", data.token);
      localStorage.setItem("samavesh_user", JSON.stringify(data.user));

      toast.success(isLogin ? "Welcome back! Authenticated successfully." : "Account created successfully!");

      // Redirect delay for toast visibility
      setTimeout(() => {
        setLoading(false);
        if (role === "controller") {
          router.push("/dashboard");
        } else if (role === "driver") {
          router.push("/driver");
        } else {
          router.push("/commuter");
        }
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Network error. Please make sure the backend is running.");
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE6DE] dark:bg-[#0E0E0E] flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      
      {/* Background abstract zebra pattern line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.015]">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-foreground"
            style={{
              left: `${i * 8}%`,
              width: "4%",
              height: "200%",
              top: "-50%",
              transform: "rotate(-35deg)",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card text-card-foreground rounded-3xl border border-border shadow-xl p-6 sm:p-8 relative z-10 overflow-hidden"
      >
        {/* Top brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg mb-3 flex items-center justify-center border border-slate-200">
            <img src="/logo.png" alt="SAMAVESH Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-heading text-3xl tracking-tight text-foreground">{APP_NAME}</h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">{APP_DESCRIPTION}</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-muted/60 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              isLogin
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              !isLogin
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign Up
          </button>
        </div>

        {/* Role selector */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
            Select Your Role
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "controller", label: "Controller", icon: Shield },
              { id: "driver", label: "Driver", icon: User },
              { id: "commuter", label: "Commuter", icon: User },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/25 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={16} strokeWidth={isSelected ? 2.2 : 1.5} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "driver" ? (
            /* ── DRIVER EMAIL + PASSWORD SIGNUP/LOGIN ── */
            <div className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User size={14} className="absolute left-3 text-muted-foreground" />
                    <input
                      required
                      type="text"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors font-semibold"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-muted-foreground">+91</span>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      placeholder="Enter 10-digit number"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, "") }))}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={14} className="absolute left-3 text-muted-foreground" />
                  <input
                    required
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ── CONTROLLER / COMMUTER EMAIL + PASSWORD LOGIN ── */
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User size={14} className="absolute left-3 text-muted-foreground" />
                      <input
                        required
                        type="text"
                        placeholder="Enter name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {role === "controller" ? "Email Address" : "Email or Phone"}
                </label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    placeholder="Enter email / username"
                    value={formData.emailOrId}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailOrId: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={14} className="absolute left-3 text-muted-foreground" />
                  <input
                    required
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-primary rounded" />
              <span>Remember me</span>
            </label>
            <button type="button" className="hover:text-primary transition-colors">
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground text-sm font-bold rounded-2xl hover:bg-primary/95 transition-colors relative overflow-hidden mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                <span>Redirecting...</span>
              </div>
            ) : (
              <>
                <span>
                  {isLogin
                    ? "Authenticate Login"
                    : "Create Account"}
                </span>
                <ArrowRight size={14} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 pt-5 border-t border-border/60 flex items-center gap-2 bg-muted/30 p-3 rounded-2xl">
          <CheckCircle size={14} className="text-success shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground">Hackathon Shortcut:</span>
            {role === "driver"
              ? " For Driver login, enter ramesh.driver@best.org / password123. For Driver signup, fill name, email, phone, and password."
              : " Selecting a role autofills demo credentials. Clicking submit authenticates and redirects to the dashboard views."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
