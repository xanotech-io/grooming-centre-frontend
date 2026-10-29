import jsPDF from "jspdf";

const PAGE_MARGIN = 14;
const LINE_HEIGHT = 4.5;
const CELL_PAD_Y = 2.5;
const BRAND = [102, 0, 102];
const TEXT = [16, 25, 40];
const MUTED = [102, 112, 133];
const BORDER = [228, 231, 236];

const dash = (value) => (value === null || value === undefined || value === "" ? "—" : String(value));

const humanizeKey = (key) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

const formatCell = (key, value) => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    const n = value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return /rate|percentage|percent/i.test(key) ? `${n}%` : n;
  }
  if (typeof value === "object") return value.title ?? value.name ?? "—";
  return String(value);
};

// Raw UUID columns (id, courseId, ...) mean nothing on paper — drop them
// unless they're all the row has.
const visibleColumns = (rows) => {
  const all = Object.keys(rows[0] ?? {});
  const named = all.filter((k) => k !== "id" && !/Id$/.test(k));
  return named.length > 0 ? named : all;
};

/**
 * Builds the Interactive Dashboard export in the browser. The backend's PDF
 * dumps raw `key: value` lines and pipe-joined rows (UUIDs included), so the
 * PDF format is rendered here from the data the tab already loaded.
 *
 * @param {object} report
 * @param {string} report.title
 * @param {Array<[string, string]>} report.meta   label/value pairs under the title
 * @param {Array<{title: string, value: any}>} report.kpis
 * @param {Array<{title: string, data: object[]}>} report.tables
 */
export const buildDashboardPdf = ({ title, meta = [], kpis = [], tables = [] }) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const bottom = pageHeight - PAGE_MARGIN;
  let y = PAGE_MARGIN + 6;

  const ensureSpace = (needed) => {
    if (y + needed > bottom) {
      pdf.addPage();
      y = PAGE_MARGIN;
      return true;
    }
    return false;
  };

  // Title + meta
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...BRAND);
  pdf.text(title, PAGE_MARGIN, y);
  y += 7;

  pdf.setFontSize(9);
  meta.forEach(([label, value]) => {
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...MUTED);
    pdf.text(`${label}:`, PAGE_MARGIN, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...TEXT);
    pdf.text(dash(value), PAGE_MARGIN + 28, y);
    y += 5;
  });
  y += 4;

  // KPI tiles, 4 per row
  const perRow = 4;
  const gap = 4;
  const tileW = (contentWidth - gap * (perRow - 1)) / perRow;
  const tileH = 18;
  kpis.forEach((kpi, i) => {
    const col = i % perRow;
    if (col === 0 && i > 0) y += tileH + gap;
    if (col === 0) ensureSpace(tileH);
    const x = PAGE_MARGIN + col * (tileW + gap);
    pdf.setDrawColor(...BORDER);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, y, tileW, tileH, 2, 2, "FD");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text(pdf.splitTextToSize(kpi.title, tileW - 6)[0], x + 3, y + 6);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...TEXT);
    pdf.text(pdf.splitTextToSize(dash(kpi.value), tileW - 6)[0], x + 3, y + 14);
  });
  if (kpis.length > 0) y += tileH + 10;

  // Tables
  tables.forEach((table) => {
    const rows = (table.data ?? []).filter(Boolean);
    ensureSpace(24);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...TEXT);
    pdf.text(table.title, PAGE_MARGIN, y);
    y += 4;

    if (rows.length === 0) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...MUTED);
      pdf.text("No data available.", PAGE_MARGIN, y + 5);
      y += 14;
      return;
    }

    const columns = visibleColumns(rows);
    // First (label) column gets the spare width; the rest are usually short numbers.
    const firstW = columns.length === 1 ? contentWidth : Math.max(contentWidth * 0.5, contentWidth - (columns.length - 1) * 32);
    const otherW = columns.length === 1 ? 0 : (contentWidth - firstW) / (columns.length - 1);
    const widths = columns.map((_, i) => (i === 0 ? firstW : otherW));
    const xs = widths.reduce((acc, w, i) => [...acc, i === 0 ? PAGE_MARGIN : acc[i - 1] + widths[i - 1]], []);
    const headerH = LINE_HEIGHT + CELL_PAD_Y * 2;

    const drawHeader = () => {
      pdf.setFillColor(...BRAND);
      pdf.rect(PAGE_MARGIN, y, contentWidth, headerH, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      columns.forEach((c, i) => pdf.text(humanizeKey(c), xs[i] + 2, y + CELL_PAD_Y + 3.2));
      y += headerH;
    };

    drawHeader();
    pdf.setFontSize(9);
    rows.forEach((row, idx) => {
      pdf.setFont("helvetica", "normal");
      const cellLines = columns.map((c, i) => pdf.splitTextToSize(formatCell(c, row[c]), widths[i] - 4));
      const rowH = Math.max(...cellLines.map((l) => l.length)) * LINE_HEIGHT + CELL_PAD_Y * 2;
      if (ensureSpace(rowH)) drawHeader();
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT);
      if (idx % 2 === 1) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(PAGE_MARGIN, y, contentWidth, rowH, "F");
      }
      cellLines.forEach((lines, i) => pdf.text(lines, xs[i] + 2, y + CELL_PAD_Y + 3.2, { lineHeightFactor: 1.4 }));
      pdf.setDrawColor(...BORDER);
      pdf.line(PAGE_MARGIN, y + rowH, PAGE_MARGIN + contentWidth, y + rowH);
      y += rowH;
    });
    y += 10;
  });

  // Page footer
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text(`Page ${p} of ${pages}`, pageWidth - PAGE_MARGIN, pageHeight - 6, { align: "right" });
  }

  return pdf.output("blob");
};
