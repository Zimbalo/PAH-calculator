import { createClient } from "@supabase/supabase-js";

// URL e chiave dal dashboard Supabase
const supabaseUrl = "https://rujrjgyuudrovsstaqll.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1anJqZ3l1dWRyb3Zzc3RhcWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NTYsImV4cCI6MjA2NDYxODQ1Nn0.lT6JMVCteycl0OE_mpiAjEPL15iQu9aeBHfX6a4izsA";

// Crea client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipi TypeScript per i dati
export interface User {
  id: number;
  username: string;
  password: string;
  role: "admin" | "user";
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  role: "admin" | "user";
  name: string;
}
