import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { listRecommendations, deleteRecommendation, listTraits, listWeights, listPersonalityTypes } from "../../../services/adminService";
import Pagination from "../../../components/admin/Pagination";
import StatusBadge from "../../../components/admin/StatusBadge";
import RecommendationFormModal from "../../../components/admin/RecommendationFormModal";

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "career", label: "Career" },
  { value: "learning", label: "Learning" },
  { value: "interview_focus", label: "Interview Focus" },
  { value: "strength", label: "Strength" },
  { value: "weakness", label: "Weakness" },
];

export default function RecommendationsTab() {
  const [recommendations, setRecommendations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [traits, setTraits] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [personalityTypes, setPersonalityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listRecommendations({ page, pageSize: 20, type: type || undefined });
        setRecommendations(data.recommendations);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, type, refreshKey]);

  useEffect(() => {
    async function loadLookups() {
      try {
        const [traitData, weightData, typeData] = await Promise.all([listTraits(), listWeights(), listPersonalityTypes()]);
        setTraits(traitData);

        const dimensionMap = new Map();
        weightData.forEach((row) => dimensionMap.set(row.dimension.id, row.dimension));
        setDimensions(Array.from(dimensionMap.values()));

        setPersonalityTypes(typeData);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load lookups");
      }
    }

    loadLookups();
  }, []);

  const handleTypeChange = (e) => {
    setPage(1);
    setType(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await deleteRecommendation(id);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to deactivate recommendation");
    }
  };

  const handleSaved = () => {
    setModalState(null);
    setRefreshKey((key) => key + 1);
  };

  return (
    <div>
      <div className="admin-toolbar">
        <select className="admin-select" value={type} onChange={handleTypeChange}>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setModalState({ mode: "create" })}>
          <Plus size={14} />
          <span>New Recommendation</span>
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading recommendations…</div>
      ) : recommendations.length === 0 ? (
        <div className="admin-empty">No recommendations found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th className="numeric">Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((recommendation) => (
                <tr key={recommendation.id}>
                  <td>{recommendation.type}</td>
                  <td className="wrap">{recommendation.title}</td>
                  <td className="numeric">{recommendation.priority}</td>
                  <td><StatusBadge status={recommendation.is_active ? "active" : "inactive"} /></td>
                  <td>
                    <div className="admin-toolbar" style={{ marginBottom: 0 }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        onClick={() => setModalState({ mode: "edit", recommendation })}
                      >
                        Edit
                      </button>
                      {recommendation.is_active && (
                        <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(recommendation.id)}>
                          Deactivate
                        </button>
                      )}
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
        <RecommendationFormModal
          recommendation={modalState.mode === "edit" ? modalState.recommendation : null}
          traits={traits}
          dimensions={dimensions}
          personalityTypes={personalityTypes}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
