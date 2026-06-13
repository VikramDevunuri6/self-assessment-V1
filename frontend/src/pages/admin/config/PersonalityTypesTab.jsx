import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { listPersonalityTypes } from "../../../services/adminService";
import StatusBadge from "../../../components/admin/StatusBadge";
import PersonalityTypeFormModal from "../../../components/admin/PersonalityTypeFormModal";

export default function PersonalityTypesTab() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setTypes(await listPersonalityTypes());
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load personality types");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshKey]);

  const handleSaved = () => {
    setModalState(null);
    setRefreshKey((key) => key + 1);
  };

  return (
    <div>
      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setModalState({ mode: "create" })}>
          <Plus size={14} />
          <span>New Personality Type</span>
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading personality types…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th className="numeric">Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id}>
                  <td>{type.code}</td>
                  <td>{type.name}</td>
                  <td className="wrap">{type.description || "—"}</td>
                  <td className="numeric">{type.priority}</td>
                  <td><StatusBadge status={type.is_active ? "active" : "inactive"} /></td>
                  <td>
                    <button type="button" className="admin-btn admin-btn--sm" onClick={() => setModalState({ mode: "edit", type })}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalState && (
        <PersonalityTypeFormModal
          type={modalState.mode === "edit" ? modalState.type : null}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
