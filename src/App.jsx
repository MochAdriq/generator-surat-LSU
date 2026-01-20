import React, { useEffect } from "react"; // Tambah useEffect
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./lib/supabaseClient"; // Pastikan import supabase ada
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import AdminPage from "./components/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Layout standar dengan Header & Fitur Auto Logout
function DashboardLayout({ children }) {
  // --- LOGIKA AUTO LOGOUT ---
  useEffect(() => {
    // Setting Waktu: 30 Menit (dalam milidetik)
    // Rumus: Menit * 60 * 1000
    const MAX_IDLE_TIME = 20 * 60 * 1000;

    let timeoutId;

    // Fungsi Logout Paksa
    const doLogout = async () => {
      await supabase.auth.signOut();
      alert(
        "Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.",
      );
      window.location.href = "/login"; // Lempar ke halaman login
    };

    // Fungsi Reset Waktu (Setiap kali user gerak, waktu diulang dari 0)
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(doLogout, MAX_IDLE_TIME);
    };

    // Daftar aktivitas yang dianggap "User Masih Aktif"
    const events = [
      "click", // Klik mouse
      "mousemove", // Gerakan mouse
      "keydown", // Ketik keyboard
      "scroll", // Scroll layar
      "touchstart", // Sentuh layar (HP)
    ];

    // Pasang "CCTV" untuk memantau aktivitas di atas
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Nyalakan timer pertama kali
    resetTimer();

    // Bersihkan memori saat pindah halaman (Cleanup)
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);
  // --------------------------

  return (
    <div className="app-container">
      <Header />
      <main className="content">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Halaman Utama */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <HomePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Halaman Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdminPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
