import { useState } from "react";
import Modal from "./Modal";
import { createPersonalityType, updatePersonalityType } from "../../services/adminService";

export default function PersonalityTypeFormModal({ type, onClose, onSaved }) {
  const isEdit = Boolean(type);
  const [code, setCode] = useState(type?.code || "");
  const [name, setName] = useState(type?.name || "");
  const [description, setDescription] = useState(type?.description || "");
  const [priority, setPriority] = useState(type?.priority ?? 0);
  const [isActive, setIsActive] = useState(type?.is_active ?? true);
  const [criteriaText, setCriteriaText] = useState(JSON.stringify(type?.criteria ?? {}, null, 2));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      let criteria;
      try {
        criteria = JSON.parse(criteriaText);
      } catch {
        throw new Error("Criteria must be valid JSON");
      }

      if (isEdit) {
        await updatePersonalityType(type.id, { name, description, criteria, priority: Number(priority), isActive });
      } else {
        await createPersonalityType({ code, name, description, criteria, priority: Number(priority) });
      }

      onSaved();
    } catch (err) {
      setError(err.message || err.response?.data?.error?.message || "Failed to save personality type");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Personality Type" : "New Personality Type"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-grid">
          <div className="admin-field">
            <label>Code</label>
            <input className="admin-input" value={code} onChange={(e) => setCode(e.target.value)} required disabled={isEdit} />
          </div>

          <div className="admin-field">
            <label>Name</label>
            <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="admin-field admin-field--full">
            <label>Description</label>
            <textarea className="admin-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="admin-field">
            <label>Priority</label>
            <input className="admin-input" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
          </div>

          {isEdit && (
            <div className="admin-field">
              <label className="admin-checkbox">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span>Active</span>
              </label>
            </div>
          )}

          <div className="admin-field admin-field--full">
            <label>Criteria (JSON)</label>
            <textarea className="admin-textarea" rows={6} value={criteriaText} onChange={(e) => setCriteriaText(e.target.value)} />
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="admin-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
