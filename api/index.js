import express from "express";
import cors from "cors";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";
import terbilang from "terbilang";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

/**
 * @param {string} name - Nama asli yang akan dibersihkan.
 * @returns {string} Nama yang sudah bersih.
 */
function sanitizeFilename(name) {
  if (!name) return "Dosen";
  return name
    .replace(/,.*$/, "") // Hapus gelar
    .trim() // Hapus spasi di awal/akhir
    .replace(/[^a-zA-Z0-9\s]/g, "") // Hapus karakter aneh
    .replace(/\s+/g, "_"); // Ganti spasi dengan underscore
}

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

app.use((req, res, next) => {
  console.log(`[DEBUG] Path yang diterima oleh Express: ${req.path}`);
  console.log(`[DEBUG] URL Asli yang diterima: ${req.originalUrl}`);
  next();
});

app.post("/api/generate-inpassing-package", (req, res) => {
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

    const safeName = sanitizeFilename(formData.dinilai_nama);
    const zipName = `Paket_Inpassing_${safeName}.zip`;

    res.attachment(zipName);
    res.setHeader("Content-Type", "application/zip");

    console.log("Nama file yang dibuat:", zipName);

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
    res.status(500).json({
      message: "Gagal membuat paket dokumen Inpassing.",
      error: error.message,
    });
  }
});

app.post("/api/generate-jad-package", (req, res) => {
  try {
    let formData = req.body;

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

    const dataPengantar = {
      nomor_surat_pengantar: formData.nomor_surat_pengantar,
      tanggal_surat: formData.tanggal_surat,
      nama_dosen_gelar: formData.nama_dosen_gelar,
      pangkat_awal: formData.pangkat_awal,
      pangkat_usulan: formData.pangkat_usulan,
      prodi: formData.prodi,
    };
    const dataUmum = {
      nama_dosen_gelar: formData.nama_dosen_gelar,
      id_dosen: formData.id_dosen,
      status_ikatan_kerja: formData.status_ikatan_kerja,
      ttl_dosen: formData.ttl_dosen,
      pangkat_golongan_dosen: formData.pangkat_golongan_dosen,
      jabatan_tmt_dosen: formData.jabatan_tmt_dosen,
      pendidikan_tertinggi: formData.pendidikan_tertinggi,
      fakultas_dosen: formData.fakultas_dosen,
      prodi: formData.prodi,
      pangkat_usulan: formData.pangkat_usulan,
      bidang_ilmu: formData.bidang_ilmu,
      tanggal_surat: formData.tanggal_surat,
      hari_teks: formData.hari_teks,
      tanggal_teks: formData.tanggal_teks,
      bulan_teks: formData.bulan_teks,
      tahun_teks: formData.tahun_teks,
    };

    const pengantarJafung = generateDoc(
      "jad",
      "pengantar_jafung.docx",
      dataPengantar
    );
    const baSenat = generateDoc("jad", "ba_senat.docx", {
      ...dataUmum,
      nomor_surat_senat: formData.nomor_surat_senat,
    });
    const pernyataanKeabsahan = generateDoc(
      "jad",
      "pernyataan_keabsahan.docx",
      dataUmum
    );
    const pernyataanFaktaIntegritas = generateDoc(
      "jad",
      "pernyataan_fakta_integritas.docx",
      { ...dataUmum, nomor_surat_integritas: formData.nomor_surat_integritas }
    );
    const baKomite = generateDoc("jad", "ba_komite.docx", {
      ...dataUmum,
      nomor_surat_komite: formData.nomor_surat_komite,
      tanggal_surat_senat: formData.tanggal_surat,
      nomor_surat_senat: formData.nomor_surat_senat,
    });
    const pernyataanPi = generateDoc("jad", "pernyataan_pi_jad.docx", {
      ...dataUmum,
      nomor_surat_pi: formData.nomor_surat_pi,
      bidang_kepakaran: formData.bidang_ilmu,
    });
    const penilaianPrestasi = generateDoc(
      "inpassing",
      "penilaian_prestasi.docx",
      formData
    );

    const safeName = sanitizeFilename(formData.nama_dosen_gelar);
    const zipName = `Paket_JAD_${safeName}.zip`;

    res.attachment(zipName);
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

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
    res.status(500).json({
      message: "Gagal membuat paket dokumen JAD.",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// Export app untuk Vercel
export default app;
