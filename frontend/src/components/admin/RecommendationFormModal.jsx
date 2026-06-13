import { useState } from "react";
import Modal from "./Modal";
import { createRecommendation, updateRecommendation } from "../../services/adminService";

const TYPES = ["career", "learning", "interview_focus", "strength", "weakness"];

export default function RecommendationFormModal({ recommendation, traits, dimensions, personalityTypes, onClose, onSaved }) {
  const isEdit = Boolean(recommendation);
  const [type, setType] = useState(recommendation?.type || TYPES[0]);
  const [traitId, setTraitId] = useState(recommendation?.trait_id ? String(recommendation.trait_id) : "");
  const [dimensionId, setDimensionId] = useState(recommendation?.dimension_id ? String(recommendation.dimension_id) : "");
  const [personalityTypeId, setPersonalityTypeId] = useState(
    recommendation?.personality_type_id ? String(recommendation.personality_type_id) : ""
  );
  const [title, setTitle] = useState(recommendation?.title || "");
  const [content, setContent] = useState(recommendation?.content || "");
  const [priority, setPriority] = useState(recommendation?.priority ?? 0);
  const [isActive, setIsActive] = useState(recommendation?.is_active ?? true);
  const [conditionText, setConditionText] = useState(JSON.stringify(recommendation?.condition ?? {}, null, 2));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      let condition;
      try {
        condition = JSON.parse(conditionText);
      } catch {
        throw new Error("Condition must be valid JSON");
      }

      const payload = { type, condition, title, content, priority: Number(priority) };

      if (isEdit) {
        payload.traitId = traitId ? Number(traitId) : null;
        payload.dimensionId = dimensionId ? Number(dimensionId) : null;
        payload.personalityTypeId = personalityTypeId ? Number(personalityTypeId) : null;
        payload.isActive = isActive;
        await updateRecommendation(recommendation.id, payload);
      } else {
        if (traitId) payload.traitId = Number(traitId);
        if (dimensionId) payload.dimensionId = Number(dimensionId);
        if (personalityTypeId) payload.personalityTypeId = Number(personalityTypeId);
        await createRecommendation(payload);
      }

      onSaved();
    } catch (err) {
      setError(err.message || err.response?.data?.error?.message || "Failed to save recommendation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Recommendation" : "New Recommendation"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-grid">
          <div className="admin-field">
            <label>Type</label>
            <select className="admin-select" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label>Priority</label>
            <input className="admin-input" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
          </div>

          <div className="admin-field">
            <label>Trait</label>
            <select className="admin-select" value={traitId} onChange={(e) => setTraitId(e.target.value)}>
              <option value="">—</option>
              {traits.map((trait) => (
                <option key={trait.id} value={trait.id}>
                  {trait.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label>Dimension</label>
            <select className="admin-select" value={dimensionId} onChange={(e) => setDimensionId(e.target.value)}>
              <option value="">—</option>
              {dimensions.map((dimension) => (
                <option key={dimension.id} value={dimension.id}>
                  {dimension.name} ({dimension.framework})
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label>Personality Type</label>
            <select className="admin-select" value={personalityTypeId} onChange={(e) => setPersonalityTypeId(e.target.value)}>
              <option value="">—</option>
              {personalityTypes.map((personalityType) => (
                <option key={personalityType.id} value={personalityType.id}>
                  {personalityType.name}
                </option>
              ))}
            </select>
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
            <label>Title</label>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="admin-field admin-field--full">
            <label>Content</label>
            <textarea className="admin-textarea" value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>

          <div className="admin-field admin-field--full">
            <label>Condition (JSON)</label>
            <textarea className="admin-textarea" rows={5} value={conditionText} onChange={(e) => setConditionText(e.target.value)} />
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
