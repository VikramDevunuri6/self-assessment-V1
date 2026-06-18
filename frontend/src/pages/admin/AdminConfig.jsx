import { useState } from "react";
import CategoriesTab from "./config/CategoriesTab";
import TraitsTab from "./config/TraitsTab";
import WeightsTab from "./config/WeightsTab";
import PersonalityTypesTab from "./config/PersonalityTypesTab";
import RecommendationsTab from "./config/RecommendationsTab";
import FormulasTab from "./config/FormulasTab";
import "../../styles/Admin.css";

const TABS = [
  { key: "traits", label: "Traits", Component: TraitsTab },
  { key: "weights", label: "Weights", Component: WeightsTab },
  { key: "personality-types", label: "Personality Types", Component: PersonalityTypesTab },
  { key: "recommendations", label: "Recommendations", Component: RecommendationsTab },
  { key: "formulas", label: "Formulas", Component: FormulasTab },
  { key: "categories", label: "Categories", Component: CategoriesTab },
];

export default function AdminConfig() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const ActiveComponent = TABS.find((tab) => tab.key === activeTab)?.Component;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Configuration</h1>
          <p>Manage scoring formulas, weights, traits, personality types and recommendations.</p>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {ActiveComponent && <ActiveComponent />}
    </div>
  );
}
