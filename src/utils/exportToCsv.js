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
  const marginTop = 40;
  const marginBottom = 30;
  const cellPadding = 4;
  const fontSize = 8;
  const lineHeight = fontSize * 1.25;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableWidth = pageWidth - marginX * 2;
  const [header = [], ...body] = rows;
  const colCount = Math.max(1, ...rows.map((row) => row.length));
  const toText = (cell) => String(cell ?? "");

  // Size columns by their content so short numeric columns don't waste
  // space that long name/email columns need. Each column is at least as wide
  // as its longest header word (so headers wrap between words, not inside
  // them); remaining space is shared out by cell length. Text that still
  // doesn't fit wraps instead of being cut off.
  doc.setFontSize(fontSize);
  doc.setFont(undefined, "bold");
  const minWidths = Array.from({ length: colCount }, (_, colIndex) =>
    Math.max(
      30,
      ...toText(header[colIndex])
        .split(/\s+/)
        .map((w) => doc.getTextWidth(w)),
    ) + cellPadding * 2,
  );
  doc.setFont(undefined, "normal");
  const desired = minWidths.map((min, colIndex) => {
    const longestCell = Math.max(
      0,
      ...body.map((row) => doc.getTextWidth(toText(row[colIndex]))),
    );
    return Math.max(min, Math.min(200, longestCell) + cellPadding * 2);
  });
  const minTotal = minWidths.reduce((a, b) => a + b, 0);
  const desiredTotal = desired.reduce((a, b) => a + b, 0);
  let colWidths;
  if (desiredTotal <= tableWidth || minTotal >= tableWidth) {
    // Everything fits (stretch to fill), or even the minimums don't (shrink)
    colWidths = desired.map((w) => (w / desiredTotal) * tableWidth);
  } else {
    const spare = tableWidth - minTotal;
    const extraTotal = desiredTotal - minTotal;
    colWidths = minWidths.map(
      (min, i) => min + ((desired[i] - min) / extraTotal) * spare,
    );
  }

  const wrapRow = (row) =>
    colWidths.map((width, colIndex) =>
      doc.splitTextToSize(toText(row[colIndex]), width - cellPadding * 2),
    );

  let y = marginTop;
  if (title) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(title, marginX, y);
    y += 20;
    doc.setFontSize(fontSize);
  }

  const drawRow = (lines, isHeader) => {
    const height =
      Math.max(1, ...lines.map((l) => l.length)) * lineHeight + cellPadding * 2;
    doc.setFont(undefined, isHeader ? "bold" : "normal");
    if (isHeader) {
      doc.setFillColor(237, 242, 247);
      doc.rect(marginX, y, tableWidth, height, "F");
    }
    let x = marginX;
    lines.forEach((cellLines, colIndex) => {
      doc.setDrawColor(203, 213, 224);
      doc.rect(x, y, colWidths[colIndex], height);
      doc.text(cellLines, x + cellPadding, y + cellPadding + fontSize);
      x += colWidths[colIndex];
    });
    y += height;
  };

  const headerLines = wrapRow(header);
  const headerHeight =
    Math.max(1, ...headerLines.map((l) => l.length)) * lineHeight +
    cellPadding * 2;
  drawRow(headerLines, true);

  body.forEach((row) => {
    const lines = wrapRow(row);
    const height =
      Math.max(1, ...lines.map((l) => l.length)) * lineHeight + cellPadding * 2;
    if (y + height > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
      // Repeat the header so continuation pages stay readable
      if (y + headerHeight + height <= pageHeight - marginBottom) {
        drawRow(headerLines, true);
      }
    }
    drawRow(lines, false);
  });

  doc.save(filename);
};
