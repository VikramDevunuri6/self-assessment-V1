import { useState } from "react";
import Modal from "./Modal";
import { createQuestion, updateQuestion } from "../../services/adminService";

const EMPTY_OPTIONS = [1, 2, 3, 4].map((order) => ({ optionOrder: order, optionText: "", score: 0 }));

export default function QuestionFormModal({ question, categories, traits, onClose, onSaved }) {
  const isEdit = Boolean(question);
  const [questionText, setQuestionText] = useState(question?.questionText || "");
  const [questionType, setQuestionType] = useState(question?.questionType || "mcq");
  const [imageUrl, setImageUrl] = useState(question?.imageUrl || "");
  const [categoryId, setCategoryId] = useState(question?.categoryId ? String(question.categoryId) : "");
  const [traitId, setTraitId] = useState(question?.traitId ? String(question.traitId) : "");
  const [isActive, setIsActive] = useState(question?.isActive ?? true);
  const [options, setOptions] = useState(
    isEdit && question.options?.length
      ? question.options.map((option) => ({ ...option }))
      : EMPTY_OPTIONS.map((option) => ({ ...option }))
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleOptionChange = (index, field, value) => {
    setOptions((prev) => prev.map((option, i) => (i === index ? { ...option, [field]: value } : option)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const payload = {
        questionText,
        questionType,
        imageUrl: imageUrl || null,
        categoryId: categoryId ? Number(categoryId) : undefined,
        traitId: traitId ? Number(traitId) : undefined,
        options: options.map((option) => ({
          ...(option.id ? { id: option.id } : {}),
          optionText: option.optionText,
          optionOrder: option.optionOrder,
          score: Number(option.score),
        })),
      };

      if (isEdit) {
        payload.isActive = isActive;
        await updateQuestion(question.id, payload);
      } else {
        await createQuestion(payload);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Question" : "New Question"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-grid">
          <div className="admin-field admin-field--full">
            <label>Question Text</label>
            <textarea
              className="admin-textarea"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>

          <div className="admin-field">
            <label>Question Type</label>
            <input className="admin-input" value={questionType} onChange={(e) => setQuestionType(e.target.value)} required />
          </div>

          <div className="admin-field">
            <label>Image URL</label>
            <input
              className="admin-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="admin-field">
            <label>Category</label>
            <select className="admin-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">—</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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

          {isEdit && (
            <div className="admin-field">
              <label className="admin-checkbox">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span>Active</span>
              </label>
            </div>
          )}
        </div>

        <h4>Options</h4>
        {options.map((option, index) => (
          <div className="admin-option-row" key={option.id ?? index}>
            <input
              className="admin-input"
              placeholder={`Option ${option.optionOrder}`}
              value={option.optionText}
              onChange={(e) => handleOptionChange(index, "optionText", e.target.value)}
              required
            />
            <input
              className="admin-input"
              type="number"
              min="0"
              max="100"
              placeholder="Score"
              value={option.score}
              onChange={(e) => handleOptionChange(index, "score", e.target.value)}
              required
            />
          </div>
        ))}

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
