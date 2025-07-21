import React, { useState } from "react";
import "./HomePage.css";
import InpassingForm from "./InpassingForm";
import JadForm from "./JadForm";

function HomePage() {
  const [activePackage, setActivePackage] = useState(null);

  const handleGoBack = () => {
    setActivePackage(null);
  };

  if (!activePackage) {
    return (
      <div className="homepage-container">
        <h2>Pilih Paket Dokumen yang Akan Dibuat</h2>
        <p>
          Pilih salah satu paket di bawah ini untuk memulai proses pembuatan
          surat.
        </p>
        <div className="card-container">
          <div className="document-card">
            <h3>Kelengkapan Inpassing</h3>
            <p>
              Paket ini akan menghasilkan 3 jenis surat yang dibutuhkan untuk
              proses penyetaraan pangkat (Inpassing).
            </p>
            <button onClick={() => setActivePackage("inpassing")}>
              Mulai Buat
            </button>
          </div>
          <div className="document-card">
            <h3>Kelengkapan JAD</h3>
            <p>
              Paket ini akan menghasilkan 7 jenis surat untuk pengajuan Jabatan
              Akademik Dosen (JAD).
            </p>
            <button onClick={() => setActivePackage("jad")}>Mulai Buat</button>
          </div>
        </div>
      </div>
    );
  }

  if (activePackage === "inpassing") {
    return <InpassingForm onBackClick={handleGoBack} />;
  }

  if (activePackage === "jad") {
    return <JadForm onBackClick={handleGoBack} />;
  }

  return null;
}

export default HomePage;
