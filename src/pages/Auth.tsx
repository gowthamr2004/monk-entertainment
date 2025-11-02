import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Music, Mail, Lock, User as UserIcon, Phone, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetMethod, setResetMethod] = useState<"email" | "phone" | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPhone, setResetPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(signInEmail, signInPassword);
      navigate("/");
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(signUpEmail, signUpPassword, fullName);
      // After successful signup, user can sign in
      setSignInEmail(signUpEmail);
      setSignInPassword(signUpPassword);
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign in error:", error);
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      if (resetMethod === "email") {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/auth`,
        });
        
        if (error) throw error;
        
        toast.success("Password reset link sent to your email!");
        setOtpSent(true);
      } else if (resetMethod === "phone") {
        // For phone OTP, this would require a third-party service like Twilio
        // For now, we'll show a message
        toast.info("Phone OTP feature coming soon! Please use email reset.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    setResetMethod(null);
    setResetEmail("");
    setResetPhone("");
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
  };

  return (
    <div className="min-h-screen flex relative">
      <ParticleBackground />
      
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 bg-cover bg-center" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="w-32 h-32 mb-8 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-2xl">
            <Music className="w-16 h-16 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none items-center justify-center mb-6">
            <span className="font-bebas text-7xl bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent tracking-wider">
              MONK
            </span>
            <span className="font-bebas text-3xl bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent tracking-widest -mt-2">
              ENTERTAINMENT
            </span>
          </div>
          <p className="text-xl text-muted-foreground text-center max-w-md">
            Your gateway to unlimited music streaming
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-card/95 backdrop-blur-sm border-border animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <Music className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none items-center justify-center mb-2">
              <span className="font-bebas text-4xl sm:text-5xl bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent tracking-wider">
                MONK
              </span>
              <span className="font-bebas text-lg sm:text-xl bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent tracking-widest -mt-1">
                ENTERTAINMENT
              </span>
            </div>
            <p className="text-muted-foreground">Sign in to access your music</p>
          </div>

          <div className="hidden lg:block text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue your music journey</p>
          </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="pl-10 bg-secondary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <Dialog open={forgotPasswordOpen} onOpenChange={(open) => {
                    setForgotPasswordOpen(open);
                    if (!open) resetForgotPasswordState();
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-xs text-primary">
                        Forgot Password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          {!resetMethod ? "Choose how you want to reset your password" : 
                           otpSent ? "Check your email for the reset link" :
                           "Enter your details to receive a reset link"}
                        </DialogDescription>
                      </DialogHeader>

                      {!resetMethod ? (
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-3"
                            onClick={() => setResetMethod("email")}
                          >
                            <Mail className="w-5 h-5" />
                            <span>Reset via Email</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-3"
                            onClick={() => setResetMethod("phone")}
                          >
                            <Phone className="w-5 h-5" />
                            <span>Reset via Mobile (Coming Soon)</span>
                          </Button>
                        </div>
                      ) : !otpSent ? (
                        <div className="space-y-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setResetMethod(null)}
                            className="p-0 h-auto"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                          </Button>

                          {resetMethod === "email" ? (
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">Email Address</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label htmlFor="reset-phone">Mobile Number</Label>
                              <Input
                                id="reset-phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={resetPhone}
                                onChange={(e) => setResetPhone(e.target.value)}
                                required
                              />
                            </div>
                          )}

                          <Button
                            onClick={handleSendOTP}
                            disabled={isLoading || (resetMethod === "email" ? !resetEmail : !resetPhone)}
                            className="w-full"
                          >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <p className="text-sm text-muted-foreground">
                            We've sent a password reset link to your email. Please check your inbox and follow the instructions.
                          </p>
                          <Button
                            onClick={() => {
                              setForgotPasswordOpen(false);
                              resetForgotPasswordState();
                            }}
                            className="w-full"
                          >
                            Close
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="pl-10 bg-secondary"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-secondary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="pl-10 bg-secondary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="pl-10 bg-secondary"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
          Sign in with Google
        </Button>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
