import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./Login.css"; // Kita buat CSS-nya nanti

function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        // Tambahkan queryParams ini untuk memaksa pemilihan akun
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      alert("Error logging in: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login Sistem Surat LSU</h2>
        <p>Silakan masuk menggunakan akun Google resmi divisi.</p>
        <button onClick={handleLogin} disabled={loading} className="google-btn">
          {loading ? "Menghubungkan..." : "Masuk dengan Google"}
        </button>
      </div>
    </div>
  );
}

export default Login;
