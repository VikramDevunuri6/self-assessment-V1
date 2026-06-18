import { useEffect, useState } from "react";
import { listTraits, createTrait, updateTrait } from "../../../services/adminService";
import StatusBadge from "../../../components/admin/StatusBadge";

export default function TraitsTab() {
  const [traits, setTraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setTraits(await listTraits());
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load traits");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshKey]);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      await createTrait(form);
      setForm({ code: "", name: "", description: "" });
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to create trait");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (trait) => {
    setEditingId(trait.id);
    setEditForm({ name: trait.name, description: trait.description || "" });
  };

  const handleSaveEdit = async (id) => {
    try {
      setError(null);
      await updateTrait(id, editForm);
      setEditingId(null);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update trait");
    }
  };

  const handleToggleActive = async (trait) => {
    try {
      setError(null);
      await updateTrait(trait.id, { isActive: !trait.is_active });
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update trait");
    }
  };

  return (
    <div>
      {error && <div className="admin-error">{error}</div>}

      <form className="admin-card" onSubmit={handleCreate}>
        <h3>Add Trait</h3>
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
            {saving ? "Saving…" : "Add Trait"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="admin-loading">Loading traits…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {traits.map((trait) => (
                <tr key={trait.id}>
                  <td>{trait.code}</td>
                  <td>
                    {editingId === trait.id ? (
                      <input
                        className="admin-input"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      trait.name
                    )}
                  </td>
                  <td className="wrap">
                    {editingId === trait.id ? (
                      <input
                        className="admin-input"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    ) : (
                      trait.description || "—"
                    )}
                  </td>
                  <td><StatusBadge status={trait.is_active ? "active" : "inactive"} /></td>
                  <td>
                    <div className="admin-toolbar" style={{ marginBottom: 0 }}>
                      {editingId === trait.id ? (
                        <>
                          <button type="button" className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => handleSaveEdit(trait.id)}>
                            Save
                          </button>
                          <button type="button" className="admin-btn admin-btn--sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="admin-btn admin-btn--sm" onClick={() => startEdit(trait)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--sm admin-btn--danger"
                            onClick={() => handleToggleActive(trait)}
                          >
                            {trait.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
