const express = require("express");
const cors = require("cors");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const terbilang = require("terbilang");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Fungsi helper (tidak berubah)
function generateDoc(templateSubfolder, templateName, data) {
  const templatePath = path.resolve(
    __dirname,
    "templates",
    templateSubfolder,
    templateName
  );
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  doc.render(data);
  return doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
}

// Rute untuk paket INPASSING (tidak berubah)
app.post("/generate-inpassing-package", (req, res) => {
  try {
    const formData = req.body;
    const suratPengantarBuffer = generateDoc(
      "inpassing",
      "surat_pengantar.docx",
      formData
    );
    const suratPernyataanBuffer = generateDoc(
      "inpassing",
      "surat_pernyataan.docx",
      formData
    );
    const penilaianPrestasiBuffer = generateDoc(
      "inpassing",
      "penilaian_prestasi.docx",
      formData
    );

    const zipName = `Paket_Inpassing_${formData.dinilai_nama || "Dosen"}.zip`;
    res.attachment(zipName);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.append(suratPengantarBuffer, { name: "1_Surat_Pengantar.docx" });
    archive.append(suratPernyataanBuffer, { name: "2_Surat_Pernyataan.docx" });
    archive.append(penilaianPrestasiBuffer, {
      name: "3_Penilaian_Prestasi.docx",
    });
    archive.finalize();
  } catch (error) {
    console.error("Error saat generate paket Inpassing:", error);
    res
      .status(500)
      .json({
        message: "Gagal membuat paket dokumen Inpassing.",
        error: error.message,
      });
  }
});

// Rute Final Definitif untuk paket JAD (Disederhanakan)
app.post("/generate-jad-package", (req, res) => {
  try {
    let formData = req.body;

    // Logika untuk tanggal terbilang tetap di sini
    if (formData.tanggal_surat && typeof formData.tanggal_surat === "string") {
      const parts = formData.tanggal_surat.split(" ");
      if (parts.length === 3) {
        const tanggalAngka = parseInt(parts[0], 10);
        formData.tanggal_teks = terbilang(tanggalAngka).replace(/\b\w/g, (l) =>
          l.toUpperCase()
        );
        formData.bulan_teks = parts[1];
        formData.tahun_teks = parts[2];
      }
    }
    // Logika untuk format Status Ikatan Kerja tetap di sini
    if (
      formData.status_ikatan_kerja &&
      typeof formData.status_ikatan_kerja === "string"
    ) {
      formData.status_ikatan_kerja = formData.status_ikatan_kerja
        .replace("Yayasan", "")
        .trim();
    }

    // LANGSUNG GENERATE DOKUMEN DENGAN formData LENGKAP DARI FRONTEND
    const pengantarJafung = generateDoc(
      "jad",
      "pengantar_jafung.docx",
      formData
    );
    const baSenat = generateDoc("jad", "ba_senat.docx", formData);
    const pernyataanKeabsahan = generateDoc(
      "jad",
      "pernyataan_keabsahan.docx",
      formData
    );
    const pernyataanFaktaIntegritas = generateDoc(
      "jad",
      "pernyataan_fakta_integritas.docx",
      formData
    );
    const baKomite = generateDoc("jad", "ba_komite.docx", formData);
    const pernyataanPi = generateDoc("jad", "pernyataan_pi_jad.docx", formData);
    const penilaianPrestasi = generateDoc(
      "inpassing",
      "penilaian_prestasi.docx",
      formData
    );

    const zipName = `Paket_JAD_${formData.nama_dosen_gelar || "Dosen"}.zip`;
    res.attachment(zipName);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    // Masukkan semua 7 file ke dalam ZIP
    archive.append(pengantarJafung, { name: "1_Pengantar_Jafung.docx" });
    archive.append(baSenat, { name: "2_BA_Senat.docx" });
    archive.append(pernyataanKeabsahan, {
      name: "3_Pernyataan_Keabsahan.docx",
    });
    archive.append(pernyataanFaktaIntegritas, {
      name: "4_Pernyataan_Fakta_Integritas.docx",
    });
    archive.append(baKomite, { name: "5_BA_Komite.docx" });
    archive.append(pernyataanPi, { name: "6_Pernyataan_PI.docx" });
    archive.append(penilaianPrestasi, { name: "7_Penilaian_Prestasi.docx" });

    archive.finalize();
  } catch (error) {
    console.error("Error saat generate paket JAD:", error);
    res
      .status(500)
      .json({
        message: "Gagal membuat paket dokumen JAD.",
        error: error.message,
      });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
