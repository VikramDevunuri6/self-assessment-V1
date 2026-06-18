const FRAMEWORK_LABELS = {
  big_five: "Big Five",
  riasec: "RIASEC",
};

function FormulaBadge({ formula }) {
  if (!formula?.type) return null;
  return <span className="admin-badge admin-badge--info">{formula.type}</span>;
}

export default function ScoreBreakdownTab({ data }) {
  if (!data) return null;

  const { traitScores, dimensionScores, confidence } = data;

  return (
    <div>
      <div className="admin-card admin-breakdown-section">
        <div className="admin-section-header">
          <h3>Trait Scores</h3>
          <FormulaBadge formula={traitScores[0]?.formula} />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Trait</th>
                <th className="numeric">Score</th>
                <th className="numeric">Answers</th>
              </tr>
            </thead>
            <tbody>
              {traitScores.map((trait) => (
                <tr key={trait.code}>
                  <td>{trait.name}</td>
                  <td className="numeric">{Math.round(trait.score)}</td>
                  <td className="numeric">{trait.answers.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {Object.entries(dimensionScores).map(([framework, dimensions]) => (
        <div className="admin-card admin-breakdown-section" key={framework}>
          <div className="admin-section-header">
            <h3>{FRAMEWORK_LABELS[framework] || framework}</h3>
            <FormulaBadge formula={dimensions[0]?.formula} />
          </div>

          {dimensions.map((dimension) => (
            <div key={dimension.code}>
              <h4>
                {dimension.name} &middot; <span className="numeric">{Math.round(dimension.score)}</span>
              </h4>
              {dimension.weights.map((weight) => (
                <div className="admin-weight-row" key={weight.traitCode}>
                  <span>
                    {weight.traitName} (weight {weight.weight}, score {Math.round(weight.traitScore)})
                  </span>
                  <span>{Math.round(weight.traitScore * weight.weight)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <div className="admin-card admin-breakdown-section">
        <div className="admin-section-header">
          <h3>Confidence</h3>
          <FormulaBadge formula={confidence.formula} />
        </div>
        <p>
          <strong>Confidence Score:</strong> {Math.round(confidence.value)}%
        </p>
        <details className="admin-report-section">
          <summary>Trait score inputs</summary>
          <pre className="admin-json-preview">{JSON.stringify(confidence.traitScores, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
