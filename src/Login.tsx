import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, Shield } from "lucide-react";
import { UserService } from "./api/userService"; // 🔥 NUOVO: Import UserService
import { User as UserType } from "./api/supabase"; // 🔥 NUOVO: Import tipo User

interface LoginProps {
  onLogin: (userData: {
    username: string;
    name: string;
    role: string;
    loginTime: string;
  }) => void;
  authorizedUsers: UserType[]; // 🔥 AGGIORNATO: Ora riceve array da Supabase
}

const Login: React.FC<LoginProps> = ({ onLogin, authorizedUsers }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 🔥 NUOVO: Gestione login con Supabase
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 🔥 USA DIRETTAMENTE SUPABASE per autenticazione
      const user = await UserService.authenticateUser({
        username: username.toLowerCase(),
        password: password,
      });

      if (user) {
        // Login riuscito
        const userData = {
          username: user.username,
          name: user.name,
          role: user.role,
          loginTime: new Date().toISOString(),
        };

        console.log("✅ Login riuscito per:", userData.name);
        onLogin(userData);
      } else {
        setError("Credenziali non valide. Accesso negato.");
        console.log("❌ Login fallito per username:", username);
      }
    } catch (error) {
      console.error("❌ Errore durante login:", error);
      setError("Errore di connessione. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Titolo - IDENTICO */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PAH Calculator</h1>
          <p className="text-blue-200">
            Sistema di Previsione Statura Adulta Finale
          </p>
          <p className="text-blue-300 text-sm mt-1">Metodo Greulich & Pyle</p>
        </div>

        {/* Form di Login - IDENTICO eccetto handleSubmit */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Accesso Riservato
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Solo personale medico autorizzato
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username - IDENTICO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUsername(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inserisci username"
                  required
                />
              </div>
            </div>

            {/* Password - IDENTICO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inserisci password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Pulsante Login - IDENTICO */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Autenticazione...
                </div>
              ) : (
                "🔐 Accedi al Sistema"
              )}
            </button>
          </form>

          {/* Info per test - IDENTICO */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              🔒 Sistema sicuro per personale medico autorizzato
            </p>
            {/* 🔥 NUOVO: Mostra conteggio utenti caricati */}
            {authorizedUsers.length > 0 && (
              <p className="text-xs text-green-600 text-center mt-1">
                ✅ Database connesso ({authorizedUsers.length} utenti
                autorizzati)
              </p>
            )}
          </div>
        </div>

        {/* Footer - IDENTICO */}
        <div className="text-center mt-6">
          <p className="text-blue-200 text-xs">
            © {new Date().getFullYear()} PAH Calculator - Sistema Professionale
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
