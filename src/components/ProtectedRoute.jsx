import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// --- KONFIGURASI DOMAIN ---
// Ganti dengan domain kampus atau email spesifik Boss
// Contoh: "@nusaputra.ac.id" atau ["boss@gmail.com", "admin@kampus.id"]
const ALLOWED_DOMAIN = "@nusaputra.ac.id";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // 1. Cek sesi saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session);
    });

    // 2. Listen perubahan auth (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async (session) => {
    if (session?.user) {
      const email = session.user.email;

      // Logika Pengecekan Domain
      // Jika ALLOWED_DOMAIN string, cek endsWith. Jika array, cek includes.
      const isValid = email.endsWith(ALLOWED_DOMAIN);

      if (isValid) {
        setSession(session);
        setIsAllowed(true);
      } else {
        // Jika email tidak valid, logout paksa
        await supabase.auth.signOut();
        alert(`Akses Ditolak! Email ${email} tidak memiliki izin.`);
        setSession(null);
        setIsAllowed(false);
      }
    } else {
      setSession(null);
      setIsAllowed(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Memeriksa akses...
      </div>
    );
  }

  // Jika tidak ada sesi atau tidak diizinkan, lempar ke halaman login
  if (!session || !isAllowed) {
    return <Navigate to="/login" replace />;
  }

  // Jika lolos, tampilkan halaman rahasia (children)
  return children;
}

export default ProtectedRoute;
