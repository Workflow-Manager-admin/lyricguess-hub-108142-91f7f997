import React, { useState, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * ShoppingList component: Lets users add ingredients (from a recipe), edit/remove items,
 * download as text, and print. Lively, cheerful color style.
 * 
 * Props:
 *   - ingredients: array [{ ingredient, measure }]
 *   - recipeName: string (optional, for list title/header)
 *   - defaultOpen: bool (optional)
 */
export default function ShoppingList({ ingredients = [], recipeName = "", defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const [items, setItems] = useState(
    (ingredients || []).map(({ ingredient, measure }) =>
      ({ ingredient, measure, checked: false })
    )
  );
  const [inputValue, setInputValue] = useState("");
  const printRef = useRef(null);

  // Add new item field handler
  function addItem() {
    let val = inputValue.trim();
    if (!val) return;
    setItems([...items, { ingredient: val, measure: "", checked: false }]);
    setInputValue("");
  }
  // Handle item check toggle
  function toggleChecked(idx) {
    setItems(items =>
      items.map((itm, i) => i === idx ? { ...itm, checked: !itm.checked } : itm)
    );
  }
  // Delete item
  function deleteItem(idx) {
    setItems(items => items.filter((_, i) => i !== idx));
  }
  // Download handler: Prepare plain text
  function downloadList() {
    const header = recipeName
      ? `Shopping List for: ${recipeName}\n\n`
      : "Shopping List\n\n";
    const body = items
      .map(
        (itm, idx) =>
          `- ${itm.ingredient}${itm.measure ? ` (${itm.measure})` : ""}${
            itm.checked ? " [x]" : ""
          }`
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${recipeName ? recipeName.replace(/\s+/g, "_").slice(0,50) : "shopping_list"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  // Print handler: only print the list area
  function printList() {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const popup = window.open("", "_blank", "width=560,height=700");
    popup.document.write(`
      <html>
      <head>
        <title>Shopping List${recipeName ? ": " + recipeName : ""}</title>
        <style>
          body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: #fffbe3; color: #191414; }
          .shoplist-heading { color: #fc7e2a; font-weight: 900; font-size: 30px; margin-bottom: 0.3em; }
          .shoplist-sub { color: #5118da; font-size: 17px; font-weight: 600; margin-bottom: 12px;}
          ul { padding-left: 22px; max-width: 420px;}
          li { font-size: 19px; color: #fc7e2a; margin-bottom: 6px; font-weight: 500;}
        </style>
      </head>
      <body>
        ${printContents}
      </body>
      </html>
    `);
    setTimeout(() => {
      popup.print();
      popup.close();
    }, 300);
  }

  return (
    <div
      style={{
        margin: "28px auto 18px auto",
        maxWidth: 475,
        background: "#fffbe3",
        border: "2.5px solid #ffd36c",
        borderRadius: 17,
        boxShadow: "0 7px 28px #e6ae33a0, 0 1.2px 8px #63aff220",
        transition: "box-shadow 0.19s",
        padding: open ? "0 0 20px 0" : "0"
      }}
      className="card shopping-list-card"
    >
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          cursor: "pointer",
          padding: 0,
          background: "#faeec8",
          borderRadius: "15px 15px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: open ? "2px solid #ffd36c" : "none",
        }}
        tabIndex={0}
        aria-label={open ? "Collapse shopping list" : "Expand shopping list"}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") setOpen(o => !o);
        }}
      >
        <span
          style={{
            fontSize: 30,
            margin: "8px 0 7px 14px",
          }}
          role="img"
          aria-label="shopping-cart"
        >
          🛒
        </span>
        <span
          className="shoplist-heading"
          style={{
            color: "#fc7e2a",
            fontWeight: 900,
            fontSize: 23,
            letterSpacing: ".035em",
            margin: "8px 0 0 0",
            flexGrow: 1
          }}
        >
          Shopping List
        </span>
        <span
          style={{
            color: "#5118da",
            fontWeight: 700,
            fontSize: 19,
            marginRight: 16,
            opacity: 0.86
          }}
        >
          {open ? "▴" : "▾"}
        </span>
      </div>
      {open && (
        <div style={{ padding: "12px 19px 0 22px" }}>
          <div
            ref={printRef}
            style={{
              marginBottom: 12,
              background: "#f8f3d8",
              borderRadius: 14,
              padding: "13px 8px 7px 12px",
              border: "1.1px solid #ffd36c",
            }}
          >
            {recipeName && (
              <div
                className="shoplist-sub"
                style={{
                  color: "#5118da",
                  fontSize: 17,
                  fontWeight: 700,
                  marginBottom: 9,
                  letterSpacing: ".02em"
                }}
              >
                For: <span style={{ color: "#fc7e2a" }}>{recipeName}</span>
              </div>
            )}
            {items.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  color: "#729c2c",
                  fontWeight: 500,
                  minHeight: 42
                }}
              >
                Add ingredients to your list!
              </div>
            ) : (
              <ul style={{ margin: "0 0 7px 0", paddingLeft: 15 }}>
                {items.map((itm, idx) => (
                  <li
                    key={idx}
                    style={{
                      color: itm.checked ? "#aaa" : "#fc7e2a",
                      textDecoration: itm.checked ? "line-through" : "none",
                      fontSize: 18,
                      fontWeight: itm.checked ? 400 : 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 7
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!itm.checked}
                      tabIndex={0}
                      onChange={() => toggleChecked(idx)}
                      aria-label={`Mark ${itm.ingredient} as bought`}
                      style={{
                        accentColor: "#2ddc6a",
                        marginRight: 7,
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        border: "1.2px solid #ffd36c"
                      }}
                    />
                    <span>
                      <span style={{ color: "#5118da", fontWeight: 700 }}>{itm.ingredient}</span>
                      {itm.measure && (
                        <>
                          <span style={{ color: "#b18b27" }}> – </span>
                          <span style={{ color: "#785f0d", fontWeight: 400 }}>{itm.measure}</span>
                        </>
                      )}
                    </span>
                    <button
                      onClick={() => deleteItem(idx)}
                      style={{
                        border: "none",
                        background: "none",
                        marginLeft: 9,
                        color: "#fb5252",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 17,
                        marginTop: 1,
                        padding: 0
                      }}
                      aria-label={`Remove ${itm.ingredient}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Add item row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
            <input
              type="text"
              placeholder="Add item (e.g. chili flakes)"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && inputValue.trim()) addItem();
              }}
              style={{
                fontSize: 15.4,
                padding: "6.5px 10px",
                borderRadius: 7,
                border: "1.2px solid #fc7e2a",
                background: "#fff",
                marginRight: 5,
                flexGrow: 1,
                fontFamily: "inherit"
              }}
              aria-label="Add shopping item"
            />
            <button
              className="btn accent"
              onClick={addItem}
              disabled={!inputValue.trim()}
              style={{
                fontWeight: 700,
                fontSize: 15.1,
                borderRadius: 7,
                background: "#73f2a5",
                color: "#191414",
                border: "none",
                padding: "7px 14px",
                marginRight: 2
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", gap: 13, marginTop: 3 }}>
            <button
              className="btn accent"
              onClick={downloadList}
              style={{
                background: "#fff6eb",
                color: "#fc7e2a",
                fontWeight: 700,
                border: "1.5px solid #ffd36c",
                fontSize: 15,
                padding: "7.5px 14px",
                borderRadius: 8
              }}
              title="Download shopping list as text file"
            >
              ⬇ Download
            </button>
            <button
              className="btn accent"
              onClick={printList}
              style={{
                background: "#efdeff",
                color: "#5118da",
                fontWeight: 700,
                border: "1.5px solid #9976f7",
                fontSize: 15,
                padding: "7.5px 14px",
                borderRadius: 8
              }}
              title="Print shopping list"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
