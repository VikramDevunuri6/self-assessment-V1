import { useState } from "react";
import Modal from "./Modal";
import { publishFormulaVersion } from "../../services/adminService";

export default function FormulaVersionModal({ formula, onClose, onSaved }) {
  const current = formula.formula_versions?.find((version) => version.is_current);
  const [definitionText, setDefinitionText] = useState(JSON.stringify(current?.definition ?? {}, null, 2));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      let definition;
      try {
        definition = JSON.parse(definitionText);
      } catch {
        throw new Error("Definition must be valid JSON");
      }

      await publishFormulaVersion(formula.code, definition);
      onSaved();
    } catch (err) {
      setError(err.message || err.response?.data?.error?.message || "Failed to publish formula version");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Publish New Version — ${formula.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-field admin-field--full">
          <label>Definition (JSON)</label>
          <textarea className="admin-textarea" rows={10} value={definitionText} onChange={(e) => setDefinitionText(e.target.value)} />
        </div>

        <div className="admin-form-actions">
          <button type="button" className="admin-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? "Publishing…" : "Publish New Version"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
