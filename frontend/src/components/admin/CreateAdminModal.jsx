import { useState } from "react";
import Modal from "./Modal";
import { createAdminUser } from "../../services/adminService";
import { STAFF_ASSIGNABLE_ROLES, ROLE_LABELS } from "../../constants/roles";

export default function CreateAdminModal({ onClose, onSaved }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(STAFF_ASSIGNABLE_ROLES[0]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      await createAdminUser({ fullName, email, password, role });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to create account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Create Admin" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-grid">
          <div className="admin-field admin-field--full">
            <label>Full Name</label>
            <input className="admin-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="admin-field">
            <label>Email</label>
            <input
              className="admin-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-field">
            <label>Temporary Password</label>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="admin-field admin-field--full">
            <label>Role</label>
            <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {STAFF_ASSIGNABLE_ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {ROLE_LABELS[roleOption]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="admin-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? "Creating…" : "Create Admin"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
