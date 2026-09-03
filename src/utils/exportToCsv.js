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
  URL.revokeObjectURL(url);
};

export const exportRowsToCsv = (rows, filename) => {
  const csv = rows
    .map((row) =>
      row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
};

export const exportRowsToExcel = (rows, filename) => {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
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
