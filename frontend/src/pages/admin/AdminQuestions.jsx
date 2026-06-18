import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { listQuestions, listCategories, listTraits, deleteQuestion, updateQuestion } from "../../services/adminService";
import Pagination from "../../components/admin/Pagination";
import StatusBadge from "../../components/admin/StatusBadge";
import QuestionFormModal from "../../components/admin/QuestionFormModal";
import "../../styles/Admin.css";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [traits, setTraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError(null);
        const data = await listQuestions({ page, pageSize: 20 });
        setQuestions(data.questions);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [page, refreshKey]);

  useEffect(() => {
    async function loadLookups() {
      try {
        const [categoryData, traitData] = await Promise.all([listCategories(), listTraits()]);
        setCategories(categoryData);
        setTraits(traitData);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load categories/traits");
      }
    }

    loadLookups();
  }, []);

  const handleToggleActive = async (question) => {
    try {
      if (question.isActive) {
        await deleteQuestion(question.id);
      } else {
        await updateQuestion(question.id, { isActive: true });
      }
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update question status");
    }
  };

  const handleSaved = () => {
    setModalState(null);
    setRefreshKey((key) => key + 1);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Questions</h1>
          <p>Manage assessment questions, categories, traits and option scores.</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setModalState({ mode: "create" })}>
          <Plus size={14} />
          <span>New Question</span>
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading questions…</div>
      ) : questions.length === 0 ? (
        <div className="admin-empty">No questions found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Trait</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id}>
                  <td className="wrap">{question.questionText}</td>
                  <td>{question.category?.name || "—"}</td>
                  <td>{question.trait?.name || "—"}</td>
                  <td><StatusBadge status={question.isActive ? "active" : "inactive"} /></td>
                  <td>
                    <div className="admin-toolbar">
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        onClick={() => setModalState({ mode: "edit", question })}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => handleToggleActive(question)}
                      >
                        {question.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {modalState && (
        <QuestionFormModal
          question={modalState.mode === "edit" ? modalState.question : null}
          categories={categories}
          traits={traits}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
