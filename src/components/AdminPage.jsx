import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { formatDateIndo } from "../utils/dateUtils";
import "./AdminPage.css";

function AdminPage() {
  const [dosenList, setDosenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" atau "edit"
  const [currentId, setCurrentId] = useState(null);

  // Form State (Menampung data inputan)
  const [formData, setFormData] = useState({
    nidn: "",
    nuptk: "",
    nama: "",
    nama_gelar: "",
    prodi: "",
    jabatan_fungsional: "",
    tmt_jabatan: "",
    jabatan_struktural: "",
    // Tambahkan field lain jika perlu diedit
  });

  // 1. FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dosen")
      .select("*")
      .order("nama", { ascending: true });

    if (error) console.error("Error:", error);
    else setDosenList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. HANDLER BUKA MODAL (TAMBAH)
  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({
      nidn: "",
      nuptk: "",
      nama: "",
      nama_gelar: "",
      prodi: "",
      jabatan_fungsional: "",
      tmt_jabatan: "",
      jabatan_struktural: "",
    });
    setIsModalOpen(true);
  };

  // 3. HANDLER BUKA MODAL (EDIT)
  const handleOpenEdit = (dosen) => {
    setModalMode("edit");
    setCurrentId(dosen.id);
    setFormData({
      nidn: dosen.nidn || "",
      nuptk: dosen.nuptk || "",
      nama: dosen.nama || "",
      nama_gelar: dosen.nama_gelar || "",
      prodi: dosen.prodi || "",
      jabatan_fungsional: dosen.jabatan_fungsional || "",
      // Pastikan format tanggal YYYY-MM-DD untuk input type="date"
      tmt_jabatan: dosen.tmt_jabatan || "",
      jabatan_struktural: dosen.jabatan_struktural || "",
    });
    setIsModalOpen(true);
  };

  // 4. SIMPAN DATA (INSERT / UPDATE)
  const handleSave = async (e) => {
    e.preventDefault();

    // Validasi sederhana
    if (!formData.nama) return alert("Nama wajib diisi!");

    let error;
    if (modalMode === "add") {
      // Logic Tambah Baru
      const { error: insertError } = await supabase
        .from("dosen")
        .insert([formData]);
      error = insertError;
    } else {
      // Logic Update (Edit)
      const { error: updateError } = await supabase
        .from("dosen")
        .update(formData)
        .eq("id", currentId);
      error = updateError;
    }

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      alert("Data berhasil disimpan!");
      setIsModalOpen(false);
      fetchData(); // Refresh tabel
    }
  };

  // Filter pencarian
  const filteredData = dosenList.filter((d) =>
    (d.nama_gelar || d.nama || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Data Dosen & Jabatan</h2>
        <button className="add-btn" onClick={handleOpenAdd}>
          + Tambah Dosen
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Cari nama dosen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
        />
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>Prodi</th>
                <th>Jabatan Fungsional</th>
                <th>TMT</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.nama_gelar}</strong>
                    <br />
                    <small>NIDN: {d.nidn}</small>
                  </td>
                  <td>{d.prodi}</td>
                  <td>{d.jabatan_fungsional}</td>
                  <td>{formatDateIndo(d.tmt_jabatan)}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => handleOpenEdit(d)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalMode === "add" ? "Tambah Dosen" : "Edit Data Dosen"}</h3>
            <form onSubmit={handleSave}>
              {/* Form Input Data - Bisa disesuaikan mau field apa saja */}
              <div className="form-group">
                <label>Nama Lengkap (dengan Gelar)</label>
                <input
                  value={formData.nama_gelar}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_gelar: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Nama Tanpa Gelar</label>
                <input
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>NIDN</label>
                <input
                  value={formData.nidn}
                  onChange={(e) =>
                    setFormData({ ...formData, nidn: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Prodi</label>
                <input
                  value={formData.prodi}
                  onChange={(e) =>
                    setFormData({ ...formData, prodi: e.target.value })
                  }
                />
              </div>

              {/* FIELD UTAMA YANG BOSS MAU UBAH */}
              <div
                style={{
                  background: "#f0f8ff",
                  padding: "10px",
                  borderRadius: "4px",
                  margin: "10px 0",
                }}
              >
                <div className="form-group">
                  <label style={{ color: "#2d1a4d", fontWeight: "bold" }}>
                    Jabatan Fungsional
                  </label>
                  <input
                    value={formData.jabatan_fungsional}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jabatan_fungsional: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: "#2d1a4d", fontWeight: "bold" }}>
                    TMT Jabatan
                  </label>
                  <input
                    type="date"
                    value={formData.tmt_jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, tmt_jabatan: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="add-btn cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="add-btn">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
