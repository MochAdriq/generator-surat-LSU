import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import AdminPage from "./components/AdminPage"; // <--- IMPORT INI
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Layout standar dengan Header
function DashboardLayout({ children }) {
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

        {/* --- HALAMAN ADMIN BARU --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdminPage /> {/* Render AdminPage di sini */}
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
