import React, { useState, useEffect } from "react";
import { dataDosen } from "../data.js";
import "./InpassingForm.css";

function JadForm({ onBackClick }) {
  const [formData, setFormData] = useState({
    status_ikatan_kerja: "Dosen Tetap",
    jabatan_usulan: "",
    tanggal_surat: "",
    hari_teks: "",
    ttl_dosen: "",
    bidang_ilmu: "",
    nomor_surat_pengantar: "…/Spn/UNSP/VII/2025",
    nomor_surat_senat: "…/BA/UNSP/VII/2025",
    nomor_surat_komite: "…/BA-K/UNSP/VII/2025",
    nomor_surat_pi: "…/Sper-PI/UNsP/VII/2025",
    nomor_surat_integritas: "…/Sper-PI/UNsP/VII/2025",
  });
  const [dinilaiId, setDinilaiId] = useState("");
  const [penilaiId, setPenilaiId] = useState("");

  const getFakultas = (prodi) => {
    if (!prodi) return "";
    const ftkdProdi = [
      "Teknik Informatika (S1)",
      "Teknik Sipil (S1)",
      "Teknik Elektro (S1)",
      "Teknik Mesin (S1)",
      "DKV (S1)",
      "Sistem Informasi (S1)",
    ];
    if (ftkdProdi.includes(prodi)) return "Teknik, Komputer dan Desain";
    return "Fakultas Bisnis, Hukum, dan Pendidikan";
  };

  useEffect(() => {
    const selectedDinilai = dataDosen.find((d) => d.NIDN == dinilaiId) || null;
    const selectedPenilai = dataDosen.find((d) => d.NIDN == penilaiId) || null;

    setFormData((prevData) => {
      const namaTampilDinilai =
        selectedDinilai?.namaDosenGelar || selectedDinilai?.namaDosen || "";
      const namaTampilPenilai =
        selectedPenilai?.namaDosenGelar || selectedPenilai?.namaDosen || "";
      const pendidikanTerakhir =
        selectedDinilai?.pendidikanS3 || selectedDinilai?.pendidikanS2 || "";

      const autoFilledData = {
        dinilai_nama: namaTampilDinilai,
        dinilai_id: selectedDinilai?.NUPTK || "",
        dinilai_pangkat_gol: selectedDinilai?.Inpassing || "",
        dinilai_jabatan: selectedDinilai?.jabatanAkademik || "",
        dinilai_pts: selectedDinilai ? "Universitas Nusa Putra" : "",

        penilai_nama: namaTampilPenilai,
        penilai_id: selectedPenilai?.NUPTK ? String(selectedPenilai.NUPTK) : "",
        penilai_pangkat_gol: selectedPenilai?.Inpassing || "",
        penilai_jabatan:
          selectedPenilai?.jabatan_struktural ||
          selectedPenilai?.jabatanAkademik ||
          "",

        atasan_nama: "Dr. Kurniawan, S.T., M.Si., M.M.",
        atasan_id: "0142752653130173",

        id_dosen: selectedDinilai?.NUPTK || "",
        nama_dosen_gelar: namaTampilDinilai,
        prodi: selectedDinilai?.programStudi || "",
        fakultas_dosen: getFakultas(selectedDinilai?.programStudi),
        pendidikan_tertinggi: pendidikanTerakhir,
        pangkat_awal: selectedDinilai?.jabatanAkademik || "",
        jabatan_tmt_dosen: selectedDinilai?.jabatanAkademik
          ? `${selectedDinilai.jabatanAkademik}, ${selectedDinilai.tmtJad}`
          : "",
        pangkat_golongan_dosen: selectedDinilai?.Inpassing
          ? `${selectedDinilai.Inpassing}, ${selectedDinilai.tmtInpassing}`
          : "",
      };

      return {
        ...prevData,
        ...autoFilledData,
      };
    });
  }, [dinilaiId, penilaiId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const finalData = { ...formData };
    for (const key in finalData) {
      if (finalData[key] === "" || finalData[key] == null) {
        finalData[key] = "-";
      }
    }
    console.log("Mengirim data untuk paket JAD:", finalData);

    try {
      const response = await fetch("/api/generate-jad-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) throw new Error("Gagal membuat paket di server.");

      const disposition = response.headers.get("content-disposition");
      let filename = `Paket_JAD.zip`;

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

  // const dinilaiData = dataDosen.find((d) => d.NIDN == dinilaiId) || null;

  return (
    <div className="super-form-container">
      <button onClick={onBackClick} className="back-button">
        &larr; Kembali ke Pilihan Paket
      </button>
      <h2>Form Kelengkapan JAD</h2>
      <form className="super-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>1. Data Dosen</legend>
          <div className="form-group">
            <label>Pilih Dosen:</label>
            <select
              name="nama_dosen_gelar"
              value={dinilaiId}
              onChange={(e) => setDinilaiId(e.target.value)}
              required
            >
              <option value="">-- Pilih Nama Dosen --</option>
              {dataDosen
                .filter((d) => !d.jabatan_struktural)
                .map((d) => (
                  <option key={d.NIDN || d.NUPTK} value={d.NIDN}>
                    {d.namaDosenGelar || d.namaDosen}
                  </option>
                ))}
            </select>
          </div>
          {dinilaiId && (
            <div className="details-view">
              <p>
                <b>Fakultas:</b> {formData.fakultas_dosen || "-"}
              </p>
              <p>
                <b>Prodi:</b> {formData.prodi || "-"}
              </p>
            </div>
          )}
        </fieldset>

        {dinilaiId && (
          <>
            <fieldset>
              <legend>2. Data Pelengkap Umum</legend>
              <div className="form-group">
                <label>Jabatan yang Diusulkan:</label>
                <input
                  type="text"
                  name="pangkat_usulan"
                  onChange={handleInputChange}
                  placeholder="Contoh: Lektor Kepala"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal Surat:</label>
                <input
                  type="text"
                  name="tanggal_surat"
                  onChange={handleInputChange}
                  placeholder="Contoh: 18 Juli 2025"
                  required
                />
              </div>
              <div className="form-group">
                <label>Hari Surat Dibuat:</label>
                <input
                  type="text"
                  name="hari_teks"
                  onChange={handleInputChange}
                  placeholder="Contoh: Senin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tempat, Tanggal Lahir:</label>
                <input
                  type="text"
                  name="ttl_dosen"
                  onChange={handleInputChange}
                  placeholder="Contoh: Surabaya, 27 April 1978"
                  required
                />
              </div>
              <div className="form-group">
                <label>Status Ikatan Kerja:</label>
                <select
                  name="status_ikatan_kerja"
                  value="Dosen Tetap"
                  onChange={handleInputChange}
                  required
                >
                  <option value="Dosen Tetap">Dosen Tetap</option>
                  <option value="Dosen Tidak Tetap">Dosen Tidak Tetap</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bidang Ilmu / Kepakaran:</label>
                <input
                  type="text"
                  name="bidang_ilmu"
                  onChange={handleInputChange}
                  placeholder="Contoh: Manajemen Energi"
                  required
                />
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
            <fieldset>
              <legend>4. Nomor Surat</legend>
              <div className="form-group">
                <label>
                  Nomor Surat Pengantar Jafung: (contoh : …/Spn/UNSP/VII/2025)
                </label>
                <input
                  type="text"
                  name="nomor_surat_pengantar"
                  value={formData.nomor_surat_pengantar || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Nomor Surat BA Senat: (contoh : …/BA/UNSP/VII/2025)
                </label>
                <input
                  type="text"
                  name="nomor_surat_senat"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Nomor Surat Fakta Integritas: …/Sper-PI/UNsP/VII/2025
                </label>
                <input
                  type="text"
                  name="nomor_surat_integritas"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Nomor Surat BA Komite: (contoh : …/BA-K/UNSP/VII/2025)
                </label>
                <input
                  type="text"
                  name="nomor_surat_komite"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Nomor Surat Pernyataan PI: (contoh : …/Sper-PI/UNsP/VII/2025)
                </label>
                <input
                  type="text"
                  name="nomor_surat_pi"
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>
            <button type="submit" className="generate-button">
              Generate Paket JAD (.zip)
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default JadForm;
