import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking synchronously can cancel the download before the browser reads it
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportRowsToCsv = (rows, filename) => {
  const csv = rows
    .map((row) =>
      row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  // BOM so Excel decodes the file as UTF-8 (otherwise "—" renders as "â€”")
  downloadBlob(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    filename,
  );
};

const DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;
// No leading zeros, so IDs/phone numbers like "0803…" stay text
const NUMBER_RE = /^-?(0|[1-9]\d{0,14})(\.\d+)?$/;

// Turn the display strings rows are built from into typed Excel cells, so
// dates, times and numbers aren't all stored as plain text.
const toExcelCell = (value) => {
  if (typeof value !== "string") return value ?? "";
  const v = value.trim();
  const date = v.match(DATE_RE);
  if (date) {
    const [, d, m, y] = date.map(Number);
    // Excel date serial (days since 1899-12-30), timezone-independent
    const serial = (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000;
    return { t: "n", v: serial, z: "dd/mm/yyyy" };
  }
  const time = v.match(TIME_RE);
  if (time && Number(time[1]) < 24) {
    return {
      t: "n",
      v: (Number(time[1]) * 60 + Number(time[2])) / 1440,
      z: "hh:mm",
    };
  }
  if (NUMBER_RE.test(v)) return { t: "n", v: Number(v) };
  return { t: "s", v: value };
};

export const exportRowsToExcel = (rows, filename) => {
  const [header = [], ...body] = rows;
  const worksheet = XLSX.utils.aoa_to_sheet([
    header,
    ...body.map((row) => row.map(toExcelCell)),
  ]);
  worksheet["!cols"] = header.map((_, colIndex) => ({
    wch: Math.min(
      50,
      Math.max(
        10,
        ...rows.map((row) => String(row[colIndex] ?? "").length + 2),
      ),
    ),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename, { bookSST: true });
};

export const exportRowsToPdf = (rows, filename, title) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  const marginX = 24;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const colCount = rows[0]?.length || 1;
  const colWidth = (pageWidth - marginX * 2) / colCount;
  const rowHeight = 18;
  const maxCharsPerCol = Math.max(6, Math.floor(colWidth / 5));
  let y = 40;

  if (title) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(title, marginX, y);
    y += 24;
  }
  doc.setFontSize(9);

  rows.forEach((row, rowIndex) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 40;
    }
    doc.setFont(undefined, rowIndex === 0 ? "bold" : "normal");
    row.forEach((cell, colIndex) => {
      const text = String(cell ?? "");
      const truncated =
        text.length > maxCharsPerCol
          ? `${text.slice(0, maxCharsPerCol - 1)}…`
          : text;
      doc.text(truncated, marginX + colIndex * colWidth, y);
    });
    y += rowHeight;
  });

  doc.save(filename);
};
