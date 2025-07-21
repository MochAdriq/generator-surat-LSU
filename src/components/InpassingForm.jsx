import React, { useState, useEffect } from "react";
import { dataDosen } from "../data.js";
import "./InpassingForm.css";

function InpassingForm({ onBackClick }) {
  const [formData, setFormData] = useState({});

  const [dinilaiId, setDinilaiId] = useState("");
  const [penilaiId, setPenilaiId] = useState("");

  useEffect(() => {
    const selectedDinilai = dataDosen.find((d) => d.NIDN == dinilaiId) || null;
    const selectedPenilai = dataDosen.find((d) => d.NIDN == penilaiId) || null;

    const namaTampilDinilai =
      selectedDinilai?.namaDosenGelar || selectedDinilai?.namaDosen || "";
    const namaTampilPenilai =
      selectedPenilai?.namaDosenGelar || selectedPenilai?.namaDosen || "";
    const pendidikanTerakhir =
      selectedDinilai?.pendidikanS3 || selectedDinilai?.pendidikanS2 || "";

    const newFormData = {
      // Data manual dari form (dipertahankan nilainya)
      nomor_surat: formData.nomor_surat || "",
      tanggal_surat: formData.tanggal_surat || "",
      pangkat_usulan: formData.pangkat_usulan || "",
      status_kepegawaian: formData.status_kepegawaian || "Dosen Tetap Yayasan",

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
    };

    setFormData(newFormData);
  }, [dinilaiId, penilaiId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

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
            <label>Pilih Dosen yang Diajukan:</label>
            <select onChange={(e) => setDinilaiId(e.target.value)} required>
              <option value="">-- Pilih Nama Dosen --</option>
              {dataDosen
                .filter((d) => !d.jabatan_struktural)
                .map((d) => {
                  const displayName = d.namaDosenGelar || d.namaDosen;
                  return (
                    <option key={d.NIDN || d.NUPTK} value={d.NIDN}>
                      {displayName}
                    </option>
                  );
                })}
            </select>
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
                  value={formData.status_kepegawaian || "Dosen Tetap Yayasan"}
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
                <select onChange={(e) => setPenilaiId(e.target.value)} required>
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
