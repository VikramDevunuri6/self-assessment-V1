import { useEffect, useState } from "react";
import { listCategories, createCategory } from "../../../services/adminService";

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setCategories(await listCategories());
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      await createCategory(form);
      setForm({ code: "", name: "", description: "" });
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {error && <div className="admin-error">{error}</div>}

      <form className="admin-card" onSubmit={handleSubmit}>
        <h3>Add Category</h3>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label>Code</label>
            <input className="admin-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div className="admin-field">
            <label>Name</label>
            <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="admin-field admin-field--full">
            <label>Description</label>
            <textarea
              className="admin-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? "Saving…" : "Add Category"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="admin-loading">Loading categories…</div>
      ) : categories.length === 0 ? (
        <div className="admin-empty">No categories yet</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.code}</td>
                  <td>{category.name}</td>
                  <td className="wrap">{category.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
