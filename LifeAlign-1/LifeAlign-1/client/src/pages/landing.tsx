import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Hero Background */}
      <div 
        className="flex-1 bg-cover bg-center relative"
        style={{
          backgroundImage: "linear-gradient(rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.6)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')"
        }}
      >
        {/* Header Content */}
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          {/* Logo & Branding */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg mx-auto">
              <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Congruence</h1>
            <p className="text-white/90 text-lg">Stay aligned with who you want to become</p>
          </div>

          {/* Auth Card */}
          <Card className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Get Started</h2>
            
            {/* Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              data-testid="button-login"
            >
              Continue with Replit
            </Button>
            
            <p className="text-sm text-gray-600 text-center mt-4">
              Create your personal blueprint and start building habits that align with your identity goals.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
