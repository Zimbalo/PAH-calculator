import React, { useState } from "react";
import {
  Settings,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";
import { UserService } from "./api/userService"; // 🔥 NUOVO: Import UserService
import { User } from "./api/supabase"; // 🔥 NUOVO: Import tipo User

interface AdminPanelProps {
  currentUser: any;
  onClose: () => void;
  authorizedUsers: User[]; // 🔥 AGGIORNATO: Ora riceve array da Supabase
  onUpdateUsers: () => void; // 🔥 AGGIORNATO: Ora ricarica da Supabase
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onClose,
  authorizedUsers,
  onUpdateUsers,
}) => {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
  });
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 🔥 NUOVO: Loading state

  // 🔥 AGGIORNATO: Trova utente nell'array invece che nell'oggetto
  const handleEditUser = (username: string) => {
    const user = authorizedUsers.find((u) => u.username === username);
    if (user) {
      setEditingUser({
        username: user.username,
        password: user.password,
        role: user.role,
        name: user.name,
      });
    }
  };

  // 🔥 AGGIORNATO: Usa UserService per salvare modifiche
  const handleSaveEdit = async () => {
    if (editingUser) {
      setIsLoading(true);
      try {
        // Aggiorna password nel database
        const success = await UserService.updateUserPassword(
          editingUser.username,
          editingUser.password
        );

        if (success) {
          console.log("✅ Utente modificato:", editingUser.username);
          setEditingUser(null);
          // Ricarica utenti dal database
          await onUpdateUsers();
        } else {
          alert("Errore durante l'aggiornamento dell'utente");
        }
      } catch (error) {
        console.error("Errore durante salvataggio:", error);
        alert("Errore durante l'aggiornamento dell'utente");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 🔥 AGGIORNATO: Usa UserService per eliminare
  const handleDeleteUser = async (username: string) => {
    if (username === "admin") {
      alert("Non puoi eliminare l'account amministratore!");
      return;
    }

    if (confirm(`Sei sicuro di voler eliminare l'utente ${username}?`)) {
      setIsLoading(true);
      try {
        const success = await UserService.deleteUser(username);

        if (success) {
          console.log("🗑️ Utente eliminato:", username);
          // Ricarica utenti dal database
          await onUpdateUsers();
        } else {
          alert("Errore durante l'eliminazione dell'utente");
        }
      } catch (error) {
        console.error("Errore durante eliminazione:", error);
        alert("Errore durante l'eliminazione dell'utente");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 🔥 AGGIORNATO: Usa UserService per aggiungere
  const handleAddUser = async () => {
    if (newUser.username && newUser.password && newUser.name) {
      // Verifica se username esiste già
      const existingUser = authorizedUsers.find(
        (u) => u.username === newUser.username.toLowerCase()
      );

      if (existingUser) {
        alert("Username già esistente!");
        return;
      }

      setIsLoading(true);
      try {
        const createdUser = await UserService.createUser({
          username: newUser.username.toLowerCase(),
          password: newUser.password,
          role: "user",
          name: newUser.name,
        });

        if (createdUser) {
          console.log("➕ Utente aggiunto:", newUser.username);
          setNewUser({ username: "", password: "", name: "" });
          setShowNewUserForm(false);
          // Ricarica utenti dal database
          await onUpdateUsers();
        } else {
          alert("Errore durante la creazione dell'utente");
        }
      } catch (error) {
        console.error("Errore durante creazione:", error);
        alert("Errore durante la creazione dell'utente");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = (username: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  // 🔥 AGGIORNATO: Calcola statistiche dall'array
  const totalUsers = authorizedUsers.length;
  const userCount = authorizedUsers.filter((u) => u.role === "user").length;
  const adminCount = authorizedUsers.filter((u) => u.role === "admin").length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header - IDENTICO */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Pannello Amministrazione</h2>
                <p className="text-purple-200">
                  Gestione Utenti PAH Calculator
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Benvenuto Admin - IDENTICO */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-800">
                  Benvenuto, {currentUser.name}
                </h3>
                <p className="text-blue-600 text-sm">
                  Gestisci gli accessi al sistema PAH Calculator
                </p>
                <p className="text-xs text-blue-500">
                  🔄 Database Supabase - Modifiche permanenti
                </p>
              </div>
            </div>
          </div>

          {/* Statistiche - AGGIORNATO per array */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalUsers}
              </div>
              <div className="text-sm text-green-700">Utenti Totali</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userCount}
              </div>
              <div className="text-sm text-blue-700">Medici Autorizzati</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {adminCount}
              </div>
              <div className="text-sm text-purple-700">Amministratori</div>
            </div>
          </div>

          {/* Pulsante Aggiungi Utente - IDENTICO */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Lista Utenti Autorizzati
            </h3>
            <button
              onClick={() => setShowNewUserForm(true)}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Utente</span>
            </button>
          </div>

          {/* Form Nuovo Utente - IDENTICO eccetto handleAddUser */}
          {showNewUserForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-green-800 mb-3">
                ➕ Aggiungi Nuovo Utente
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  disabled={isLoading}
                />
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleAddUser}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? "Salvando..." : "Salva Utente"}
                </button>
                <button
                  onClick={() => setShowNewUserForm(false)}
                  disabled={isLoading}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}

          {/* Lista Utenti - AGGIORNATO da Object.entries a array.map */}
          <div className="space-y-3">
            {authorizedUsers.map((user) => (
              <div
                key={user.username}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                {editingUser && editingUser.username === user.username ? (
                  // Modalità Editing - IDENTICO eccetto handleSaveEdit
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser((prev: any) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      value={editingUser.password}
                      onChange={(e) =>
                        setEditingUser((prev: any) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin" ? "👑 Admin" : "👨‍⚕️ Medico"}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        disabled={isLoading}
                        className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modalità Visualizzazione - IDENTICO
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div>
                      <div className="font-bold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        @{user.username}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type={showPassword[user.username] ? "text" : "password"}
                        value={user.password}
                        readOnly
                        className="px-3 py-2 bg-white border border-gray-300 rounded text-sm flex-1"
                      />
                      <button
                        onClick={() => togglePasswordVisibility(user.username)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword[user.username] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin" ? "👑 Admin" : "👨‍⚕️ Medico"}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user.username)}
                        disabled={isLoading}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.username !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(user.username)}
                          disabled={isLoading}
                          className="bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Loading Indicator - NUOVO */}
          {isLoading && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-blue-600 text-sm">Aggiornamento in corso...</p>
            </div>
          )}

          {/* Note di Sicurezza - AGGIORNATO */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">
              🔒 Note di Sicurezza
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Le credenziali sono memorizzate in Supabase PostgreSQL</li>
              <li>• Ogni modifica è salvata permanentemente nel database</li>
              <li>• Le sessioni scadono automaticamente per sicurezza</li>
              <li>• Ogni accesso è tracciato per audit di sicurezza</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
