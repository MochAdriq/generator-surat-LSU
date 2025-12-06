import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { dataDosen } from "./src/data.js"; // Pastikan path ini benar

// --- GANTI DENGAN DATA DARI SUPABASE SETTINGS > API ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
// -----------------------------------------------------

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL atau Key belum disetting di file .env!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper untuk ubah format tanggal Indonesia ke format SQL (YYYY-MM-DD)
function parseIndoDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const months = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
    January: "01",
    February: "02",
    March: "03",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    October: "10",
    December: "12", // Jaga-jaga ada typo bahasa inggris
  };

  const parts = dateStr.trim().split(" ");
  if (parts.length < 3) return null;

  const day = parts[0].padStart(2, "0");
  const monthName = parts[1];
  const year = parts[2];

  const month = months[monthName];

  if (!month) return null; // Jika nama bulan tidak dikenali
  return `${year}-${month}-${day}`;
}

async function migrate() {
  console.log("Mulai migrasi data...");

  const formattedData = dataDosen.map((d) => ({
    nidn: d.NIDN ? d.NIDN.trim() : null,
    nuptk: d.NUPTK ? d.NUPTK.trim() : null,
    nama: d.namaDosen,
    nama_gelar: d.namaDosenGelar,
    prodi: d.programStudi,
    jabatan_fungsional: d.jabatanAkademik,
    tmt_jabatan: parseIndoDate(d.tmtJad),
    pangkat_golongan: d.Inpassing,
    tmt_pangkat: parseIndoDate(d.tmtInpassing),
    pendidikan_s2: d.pendidikanS2,
    pendidikan_s3: d.pendidikanS3,
    jabatan_struktural: d.jabatan_struktural,
  }));

  const { data, error } = await supabase.from("dosen").insert(formattedData);

  if (error) {
    console.error("Gagal migrasi:", error);
  } else {
    console.log(
      `Sukses! ${formattedData.length} data dosen berhasil masuk ke Supabase.`
    );
  }
}

migrate();
