import { supabase, User, LoginCredentials, CreateUserData } from "./supabase";

export class UserService {
  // Funzione per autenticare un utente (sostituisce il login attuale)
  static async authenticateUser(
    credentials: LoginCredentials
  ): Promise<User | null> {
    console.log("🔍 DEBUG: Tentativo autenticazione con:", credentials);

    try {
      // Prima: test di connessione base
      console.log("🔗 DEBUG: Testing connessione Supabase...");
      const { data: testData, error: testError } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      console.log("🔗 DEBUG: Test connessione risultato:", {
        testData,
        testError,
      });

      // Poi: cerca tutti gli utenti per debug
      const { data: allUsers, error: allUsersError } = await supabase
        .from("users")
        .select("*");

      console.log("👥 DEBUG: Tutti gli utenti nel database:", allUsers);
      console.log("👥 DEBUG: Errore query utenti:", allUsersError);

      // Infine: query autenticazione specifica
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", credentials.username)
        .eq("password", credentials.password)
        .single();

      console.log("🔐 DEBUG: Query autenticazione risultato:", { data, error });

      if (error || !data) {
        console.log(
          "❌ DEBUG: Credenziali non valide:",
          error?.message || "Utente non trovato"
        );
        return null;
      }

      console.log("✅ DEBUG: Autenticazione riuscita:", data);
      return data as User;
    } catch (error) {
      console.error("❌ DEBUG: Errore durante autenticazione:", error);
      return null;
    }
  }

  // Funzione per ottenere tutti gli utenti (per il pannello admin)
  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Errore durante recupero utenti:", error);
        return [];
      }

      return data as User[];
    } catch (error) {
      console.error("Errore durante recupero utenti:", error);
      return [];
    }
  }

  // Funzione per creare un nuovo utente
  static async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            username: userData.username,
            password: userData.password,
            role: userData.role,
            name: userData.name,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Errore durante creazione utente:", error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error("Errore durante creazione utente:", error);
      return null;
    }
  }

  // Funzione per aggiornare password di un utente
  static async updateUserPassword(
    username: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          password: newPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("username", username);

      if (error) {
        console.error("Errore durante aggiornamento password:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Errore durante aggiornamento password:", error);
      return false;
    }
  }

  // Funzione per eliminare un utente (protegge admin)
  static async deleteUser(username: string): Promise<boolean> {
    try {
      // Non permettere l'eliminazione dell'admin
      if (username === "admin") {
        console.log("Impossibile eliminare utente admin");
        return false;
      }

      const { error } = await supabase
        .from("users")
        .delete()
        .eq("username", username);

      if (error) {
        console.error("Errore durante eliminazione utente:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Errore durante eliminazione utente:", error);
      return false;
    }
  }

  // Funzione per verificare se un username esiste già
  static async userExists(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  // Funzione per ottenere statistiche utenti
  static async getUserStats(): Promise<{
    total: number;
    admins: number;
    users: number;
  }> {
    try {
      // Ottieni tutti gli utenti per calcolare le statistiche
      const { data, error } = await supabase.from("users").select("role");

      if (error || !data) {
        console.error("Errore durante recupero statistiche:", error);
        return { total: 0, admins: 0, users: 0 };
      }

      const total = data.length;
      const admins = data.filter((user) => user.role === "admin").length;
      const users = data.filter((user) => user.role === "user").length;

      return { total, admins, users };
    } catch (error) {
      console.error("Errore durante recupero statistiche:", error);
      return { total: 0, admins: 0, users: 0 };
    }
  }

  // Funzione di "ping" per mantenere attivo il database
  static async pingDatabase(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      return !error;
    } catch (error) {
      console.error("Errore durante ping database:", error);
      return false;
    }
  }
}
