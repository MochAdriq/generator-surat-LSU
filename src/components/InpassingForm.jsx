import React, { useState, useEffect } from "react";
import { dataDosen } from "../data.js";
import "./InpassingForm.css";

function InpassingForm({ onBackClick }) {
  const [formData, setFormData] = useState({
    nomor_surat: "…/Sper/UNsP/VII/2025",
    status_kepegawaian: "Dosen Tetap Yayasan",
  });

  // --- STATE UNTUK FUNGSI PENCARIAN ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDosen, setFilteredDosen] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // --- END STATE PENCARIAN ---

  const [dinilaiId, setDinilaiId] = useState("");
  const [penilaiId, setPenilaiId] = useState("");

  // --- LOGIKA UNTUK MELAKUKAN FILTER SAAT PENCARIAN ---
  useEffect(() => {
    if (searchQuery) {
      const filtered = dataDosen.filter(
        (d) =>
          !d.jabatan_struktural &&
          (d.namaDosenGelar || d.namaDosen)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredDosen(filtered);
    } else {
      // Kosongkan hasil jika input search kosong
      setFilteredDosen([]);
    }
  }, [searchQuery]);
  // --- END LOGIKA FILTER ---

  useEffect(() => {
    const selectedDinilai = dataDosen.find((d) => d.NIDN == dinilaiId) || null;
    const selectedPenilai = dataDosen.find((d) => d.NIDN == penilaiId) || null;

    const namaTampilDinilai =
      selectedDinilai?.namaDosenGelar || selectedDinilai?.namaDosen || "";
    const namaTampilPenilai =
      selectedPenilai?.namaDosenGelar || selectedPenilai?.namaDosen || "";
    const pendidikanTerakhir =
      selectedDinilai?.pendidikanS3 || selectedDinilai?.pendidikanS2 || "";

    setFormData((prevData) => ({
      ...prevData,
      dinilai_nama: namaTampilDinilai,
      dinilai_id: selectedDinilai?.NUPTK || "",
      dinilai_nidn: selectedDinilai?.NIDN || "",
      dinilai_nuptk: selectedDinilai?.NUPTK || "",
      dinilai_pangkat_gol: selectedDinilai?.Inpassing || "",
      dinilai_jabatan: selectedDinilai?.jabatanAkademik || "",
      dinilai_pts: selectedDinilai ? "Universitas Nusa Putra" : "",
      dinilai_prodi: selectedDinilai?.programStudi || "",
      pendidikan_terakhir: pendidikanTerakhir,

      penilai_nama: namaTampilPenilai,
      penilai_id: selectedPenilai?.NUPTK || "",
      penilai_pangkat_gol: selectedPenilai?.Inpassing || "",
      penilai_jabatan:
        selectedPenilai?.jabatan_struktural ||
        selectedPenilai?.jabatanAkademik ||
        "",
      penilai_pts: selectedPenilai ? "Universitas Nusa Putra" : "",

      atasan_nama: "Dr. Kurniawan, S.T., M.Si., M.M.",
      atasan_id: "0142752653130173",
      atasan_pangkat_gol: "Pembina golongan IV/a",
      atasan_jabatan: "Rektor",
      atasan_pts: "Universitas Nusa Putra",

      nama_dosen: namaTampilDinilai,
      nidn_dosen: selectedDinilai?.NUPTK || "",
      pangkat_awal: selectedDinilai?.Inpassing || "",
      nama_lengkap: namaTampilDinilai,
      nidn_nuptk: selectedDinilai?.NUPTK || "",
      jabatan_fungsional: selectedDinilai?.jabatanAkademik || "",
      pangkat_golongan: selectedDinilai?.Inpassing || "",
      prodi: selectedDinilai?.programStudi || "",
    }));
  }, [dinilaiId, penilaiId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // --- FUNGSI BARU UNTUK PENCARIAN ---
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownVisible(true);
  };

  const handleSelectDosen = (dosen) => {
    setDinilaiId(dosen.NIDN);
    setSearchQuery(dosen.namaDosenGelar || dosen.namaDosen);
    setIsDropdownVisible(false);
  };
  // --- END FUNGSI BARU ---

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Mengirim data untuk paket Inpassing:", formData);

    try {
      const response = await fetch("/api/generate-inpassing-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Gagal membuat paket di server.");

      const disposition = response.headers.get("content-disposition");
      let filename = `Paket_Inpassing.zip`;

      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menghubungi server. Pastikan server sudah berjalan.");
    }
  };

  const dinilaiData = dataDosen.find((d) => d.NIDN == dinilaiId) || null;

  return (
    <div className="super-form-container">
      <button onClick={onBackClick} className="back-button">
        &larr; Kembali ke Pilihan Paket
      </button>

      <h2>Form Kelengkapan Inpassing</h2>
      <p>Isi data di bawah ini untuk men-generate 3 surat sekaligus.</p>

      <form className="super-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>1. Data Utama</legend>
          <div className="form-group">
            <label>Cari & Pilih Dosen yang Diajukan:</label>
            {/* --- ELEMEN INPUT DENGAN FITUR SEARCH --- */}
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsDropdownVisible(true)}
              onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)} // Menutup dropdown saat fokus hilang
              placeholder="Ketik nama dosen untuk mencari..."
              autoComplete="off"
              required
            />
            {isDropdownVisible && searchQuery && (
              <ul className="search-results">
                {filteredDosen.length > 0 ? (
                  filteredDosen.map((d) => (
                    <li
                      key={d.NIDN || d.NUPTK}
                      onClick={() => handleSelectDosen(d)}
                    >
                      {d.namaDosenGelar || d.namaDosen}
                    </li>
                  ))
                ) : (
                  <li className="no-result">Dosen tidak ditemukan</li>
                )}
              </ul>
            )}
            {/* --- END ELEMEN INPUT --- */}
          </div>
          {dinilaiId && (
            <div className="details-view">
              <p>
                <b>NIDN:</b> {dinilaiData?.NIDN || "-"}
              </p>
              <p>
                <b>NUPTK:</b> {dinilaiData?.NUPTK || "-"}
              </p>
              <p>
                <b>Jabatan:</b> {dinilaiData?.jabatanAkademik || "-"}
              </p>
            </div>
          )}
        </fieldset>

        {dinilaiId && (
          <>
            <fieldset>
              <legend>2. Data Pelengkap (Input Manual)</legend>
              <div className="form-group">
                <label>Nomor Surat Pengantar:</label>
                <input
                  type="text"
                  name="nomor_surat"
                  value={formData.nomor_surat || ""}
                  onChange={handleInputChange}
                  placeholder="Contoh: 020/Sper/UNsP/2025"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal Surat:</label>
                <input
                  type="text"
                  name="tanggal_surat"
                  value={formData.tanggal_surat || ""}
                  onChange={handleInputChange}
                  placeholder="Contoh: 18 Juli 2025"
                  required
                />
              </div>
              <div className="form-group">
                <label>Pangkat / Golongan Usulan:</label>
                <input
                  type="text"
                  name="pangkat_usulan"
                  value={formData.pangkat_usulan || ""}
                  onChange={handleInputChange}
                  placeholder="Contoh: Penata, III/c"
                  required
                />
              </div>
              <div className="form-group">
                <label>Status Kepegawaian:</label>
                <select
                  name="status_kepegawaian"
                  value={formData.status_kepegawaian}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Dosen Tetap Yayasan">
                    Dosen Tetap Yayasan
                  </option>
                  <option value="Dosen Tidak Tetap">Dosen Tidak Tetap</option>
                </select>
              </div>
            </fieldset>

            <fieldset>
              <legend>3. Data Penilai</legend>
              <div className="form-group">
                <label>Pilih Pejabat Penilai:</label>
                <select
                  value={penilaiId}
                  onChange={(e) => setPenilaiId(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Penilai --</option>
                  {dataDosen
                    .filter((d) => d.jabatan_struktural)
                    .map((d) => (
                      <option key={d.NIDN} value={d.NIDN}>
                        {d.namaDosenGelar || d.namaDosen} (
                        {d.jabatan_struktural})
                      </option>
                    ))}
                </select>
              </div>
            </fieldset>

            <button type="submit" className="generate-button">
              Generate Paket Inpassing (.zip)
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default InpassingForm;
