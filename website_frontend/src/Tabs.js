import React from "react";

/**
 * PUBLIC_INTERFACE
 * Tabs component: Modern, animated, accessible tabs for alternate panels (nutrition, shopping list, etc).
 *
 * @param {Object[]} tabs - array of { label: string, content: JSX }
 * @param {number} initialTab - starting tab index (default 0)
 * @param {string} className - extra classes
 */
export default function Tabs({ tabs, initialTab = 0, className = "" }) {
  const [tab, setTab] = React.useState(initialTab);

  return (
    <div className={className} style={{ width: "100%" }}>
      <div className="tabs" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={i}
            className={`tab-btn${i === tab ? " active" : ""}`}
            aria-selected={i === tab}
            aria-controls={`tabpanel-${i}`}
            id={`tab-${i}`}
            tabIndex={i === tab ? 0 : -1}
            onClick={() => setTab(i)}
            type="button"
            style={{
              outline: i === tab ? "2px solid #73f2a5" : "none"
            }}
          >
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>
      <div
        className="tab-content"
        id={`tabpanel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        style={{
          animation: "fadeInTab .3s cubic-bezier(.3,1.3,.42,1)",
          minHeight: 78,
        }}
      >
        {tabs[tab].content}
      </div>
    </div>
  );
}
