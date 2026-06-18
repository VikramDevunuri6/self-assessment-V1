import { useEffect, useState } from "react";
import { listFormulas } from "../../../services/adminService";
import FormulaVersionModal from "../../../components/admin/FormulaVersionModal";

export default function FormulasTab() {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalFormula, setModalFormula] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setFormulas(await listFormulas());
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load formulas");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshKey]);

  const handleSaved = () => {
    setModalFormula(null);
    setRefreshKey((key) => key + 1);
  };

  if (loading) {
    return <div className="admin-loading">Loading formulas…</div>;
  }

  return (
    <div>
      {error && <div className="admin-error">{error}</div>}

      {formulas.map((formula) => {
        const current = formula.formula_versions?.find((version) => version.is_current);

        return (
          <div className="admin-card" key={formula.id}>
            <div className="admin-page-header">
              <div>
                <h3>{formula.name}</h3>
                <p>{formula.description}</p>
              </div>
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => setModalFormula(formula)}>
                Publish New Version
              </button>
            </div>
            <p>
              <strong>Current Version:</strong> {current?.version ?? "—"} &middot;{" "}
              <strong>Published:</strong> {current ? new Date(current.created_at).toLocaleString() : "—"}
            </p>
            <pre className="admin-json-preview">{JSON.stringify(current?.definition ?? {}, null, 2)}</pre>
          </div>
        );
      })}

      {modalFormula && (
        <FormulaVersionModal formula={modalFormula} onClose={() => setModalFormula(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
