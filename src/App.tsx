import React, { useState, useEffect } from "react";
import { LogOut, Settings, User } from "lucide-react";
import Login from "./Login";
import AdminPanel from "./AdminPanel";
import PAHCalculator from "./PAHCalculator"; // Il tuo componente esistente
import { UserService } from "./api/userService"; // 🔥 NUOVO: Import UserService
import { User as UserType } from "./api/supabase"; // 🔥 NUOVO: Import tipo User

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // 🔥 NUOVO: Stati per gestire caricamento e utenti da Supabase
  const [authorizedUsers, setAuthorizedUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 NUOVO: Funzione per caricare utenti da Supabase
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const users = await UserService.getAllUsers();
      setAuthorizedUsers(users);
      console.log("📥 Utenti caricati da Supabase:", users);
    } catch (error) {
      console.error("❌ Errore durante caricamento utenti:", error);
      setError("Errore durante il caricamento dei dati");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 NUOVO: Carica utenti all'avvio + gestione sessioni esistente
  useEffect(() => {
    // Prima carica gli utenti dal database
    loadUsers();

    // Poi controlla se c'è una sessione attiva (LOGICA IDENTICA)
    const savedAuth = sessionStorage.getItem("pahAuth");
    if (savedAuth) {
      try {
        const userData = JSON.parse(savedAuth);
        // Verifica che la sessione non sia scaduta (24 ore)
        const loginTime = new Date(userData.loginTime);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          setUser(userData);
        } else {
          // Sessione scaduta
          sessionStorage.removeItem("pahAuth");
        }
      } catch (error) {
        sessionStorage.removeItem("pahAuth");
      }
    }
  }, []);

  // 🔥 AGGIORNATO: handleLogin ora riceve direttamente i dati dall'autenticazione
  const handleLogin = (userData: any) => {
    setUser(userData);
    // Mantieni la sessione nel sessionStorage (LOGICA IDENTICA)
    sessionStorage.setItem(
      "pahAuth",
      JSON.stringify({
        ...userData,
        loginTime: new Date().toISOString(),
      })
    );
  };

  // IDENTICO: Nessuna modifica al logout
  const handleLogout = () => {
    sessionStorage.removeItem("pahAuth");
    setUser(null);
    setShowAdminPanel(false);
  };

  // 🔥 AGGIORNATO: Funzione per aggiornare utenti (ora ricarica da Supabase)
  const handleUpdateUsers = async () => {
    console.log("🔄 Ricarico utenti da Supabase...");
    await loadUsers(); // Ricarica i dati aggiornati dal database
  };

  // 🔥 NUOVO: Ping automatico ogni 5 minuti per mantenere Supabase attivo
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      try {
        await UserService.pingDatabase();
        console.log("🏓 Ping database riuscito");
      } catch (error) {
        console.log("🏓 Ping database fallito:", error);
      }
    }, 5 * 60 * 1000); // 5 minuti

    // Cleanup
    return () => clearInterval(pingInterval);
  }, []);

  // 🔥 NUOVO: Gestione loading e errori
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento in corso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  // Se non c'è utente loggato, mostra il login
  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        authorizedUsers={authorizedUsers} // 🔥 Ora passa array da Supabase
      />
    );
  }

  // IDENTICO: Tutto il resto del rendering rimane uguale
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con info utente e logout - IDENTICO */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  Benvenuto, {user.name}
                </p>
                <p className="text-sm text-gray-600">
                  Accesso autorizzato •{" "}
                  {user.role === "admin" ? "Amministratore" : "Medico"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Pulsante Admin Panel (solo per admin) - IDENTICO */}
              {user.role === "admin" && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Gestione Utenti</span>
                </button>
              )}

              {/* Pulsante Logout - IDENTICO */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Esci</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* App principale PAH Calculator - IDENTICO */}
      <PAHCalculator />

      {/* Modal Admin Panel - IDENTICO */}
      {showAdminPanel && user.role === "admin" && (
        <AdminPanel
          currentUser={user}
          onClose={() => setShowAdminPanel(false)}
          authorizedUsers={authorizedUsers} // 🔥 Ora passa array da Supabase
          onUpdateUsers={handleUpdateUsers} // 🔥 Ora ricarica da Supabase
        />
      )}
    </div>
  );
};

export default App;
