import "./FormComponents.css";

/**
 * Generic sortable, filterable table component
 */
function FormTable({ columns, data, onRowClick, emptyMessage = "No records found", loading }) {
  if (loading) {
    return <div className="form-table-empty">Loading…</div>;
  }

  return (
    <div className="form-table-wrapper">
      <table className="form-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="form-table-empty">{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? "form-table-row--clickable" : ""}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default FormTable;
