(function () {
  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const escapeCell = (value) => String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");

  const splitRow = (line) => {
    const cells = [];
    let cell = "";
    let escaped = false;
    for (const character of line.trim()) {
      if (escaped) {
        cell += character;
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === "|") {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += character;
      }
    }
    cells.push(cell.trim());
    if (cells[0] === "") cells.shift();
    if (cells.at(-1) === "") cells.pop();
    return cells.map((value) => value.replace(/<br\s*\\?\/?\s*>/gi, "\n"));
  };

  const buildTable = ({ headers = [], rows = [] }) => {
    const columns = headers.length ? headers : ["Column 1", "Column 2"];
    const header = `| ${columns.map(escapeCell).join(" | ")} |`;
    const divider = `| ${columns.map(() => "---").join(" | ")} |`;
    const body = rows.map(({ cells = [] }) =>
      `| ${columns.map((_, index) => escapeCell(cells[index] ?? "")).join(" | ")} |`,
    );
    return `<!-- sveltia-table -->\n${[header, divider, ...body].join("\n")}\n<!-- /sveltia-table -->`;
  };

  CMS.registerEditorComponent({
    id: "table",
    label: "Table",
    icon: "table",
    fields: [
      {
        name: "headers",
        label: "Columns",
        widget: "list",
        field: { name: "header", label: "Column heading", widget: "string" },
        default: ["Column 1", "Column 2"],
      },
      {
        name: "rows",
        label: "Rows",
        widget: "list",
        fields: [{
          name: "cells",
          label: "Cells",
          widget: "list",
          field: { name: "cell", label: "Cell", widget: "string" },
        }],
        default: [{ cells: ["", ""] }],
      },
    ],
    pattern: /^<!-- sveltia-table -->\s*\n(?<table>(?:\|.*\|\s*\n?)+)<!-- \/sveltia-table -->$/m,
    fromBlock: ({ groups: { table } = {} }) => {
      const lines = (table ?? "").trim().split("\n");
      return {
        headers: splitRow(lines[0] ?? ""),
        rows: lines.slice(2).map((line) => ({ cells: splitRow(line) })),
      };
    },
    toBlock: buildTable,
    toPreview: ({ headers = [], rows = [] }) => {
      const columns = headers.length ? headers : ["Column 1", "Column 2"];
      const headingCells = columns.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
      const bodyRows = rows.map(({ cells = [] }) => `<tr>${columns
        .map((_, index) => `<td>${escapeHtml(cells[index] ?? "")}</td>`)
        .join("")}</tr>`).join("");
      return `<table><thead><tr>${headingCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    },
  });
}());
