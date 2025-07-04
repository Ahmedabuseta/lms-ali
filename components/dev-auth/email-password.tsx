// sign in and sign up with email and password
"use client"
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function EmailPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateEmail(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }
    setLoading(true);
    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      setSuccess("تم تسجيل الدخول بنجاح!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "فشل تسجيل الدخول. تأكد من صحة البيانات.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateEmail(signUpEmail)) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }
    if (signUpPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await signUp.email({
        email: signUpEmail,
        password: signUpPassword,
        name: "test",
      });
      if (signUpError) throw new Error(signUpError.message);
      setSuccess("تم إنشاء الحساب بنجاح! سيتم تحويلك للوحة التحكم.");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "فشل إنشاء الحساب. تأكد من صحة البيانات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg dark:bg-gray-900">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        {error && <div className="mb-2 text-red-600 text-sm text-center">{error}</div>}
        {success && <div className="mb-2 text-green-600 text-sm text-center">{success}</div>}
        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring"
              required
              disabled={loading}
              aria-label="البريد الإلكتروني"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring pr-10"
                required
                disabled={loading}
                aria-label="كلمة المرور"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? "إخفاء" : "إظهار"}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "...جاري الدخول" : "Sign In"}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring"
              required
              disabled={loading}
              aria-label="البريد الإلكتروني"
            />
            <div className="relative">
              <input
                type={showSignUpPassword ? "text" : "password"}
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring pr-10"
                required
                disabled={loading}
                aria-label="كلمة المرور"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-500"
                onClick={() => setShowSignUpPassword((v) => !v)}
                aria-label={showSignUpPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showSignUpPassword ? "إخفاء" : "إظهار"}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "...جاري التسجيل" : "Sign Up"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
