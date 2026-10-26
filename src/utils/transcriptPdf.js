import jsPDF from "jspdf";

const PAGE_MARGIN = 14;
const ROW_HEIGHT = 8;
const HEADER_FILL = [44, 82, 130];

const dash = (value) => (value === null || value === undefined || value === "" ? "—" : String(value));
const pct = (value) => (value === null || value === undefined || value === "" ? "—" : `${value}%`);
const formatDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "—");

const instructorName = (instructor) => {
  if (!instructor) return "—";
  if (typeof instructor === "string") return instructor;
  return [instructor.firstName, instructor.lastName].filter(Boolean).join(" ") || instructor.name || "—";
};

const COLUMNS = [
  { label: "Course", width: 0.28, value: (r) => r?.course?.title ?? r?.courseTitle },
  { label: "Instructor", width: 0.22, value: (r) => instructorName(r.instructor) },
  { label: "Score", width: 0.1, value: (r) => (r.score != null ? `${r.score}%` : "—") },
  { label: "Grade", width: 0.1, value: (r) => r.grade },
  {
    label: "Certificate Issued",
    width: 0.15,
    value: (r) => (r.certificateId || r.certificateIssued ? "Yes" : "No"),
  },
  { label: "Completion Date", width: 0.15, value: (r) => formatDate(r.completionDate) },
];

/**
 * Builds the student transcript PDF in the browser so the header details render as
 * label/value rows instead of the backend's single pipe-separated line.
 */
export const buildTranscriptPdf = ({ transcript, summary, student }) => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...HEADER_FILL);
  pdf.text("Student Transcript", pageWidth / 2, 20, { align: "center" });

  // Details block: two label/value columns, one pair per row.
  const leftLabelX = PAGE_MARGIN;
  const leftValueX = PAGE_MARGIN + 38;
  const rightLabelX = PAGE_MARGIN + contentWidth / 2;
  const rightValueX = rightLabelX + 42;
  const rows = [
    [["Student", student?.name], null],
    [["Email", student?.email], null],
    [["Type", transcript.transcriptType], ["Status", transcript.status]],
    [["GPA", summary?.gpa], ["Weighted Avg", pct(summary?.weightedAverageScore)]],
    [["Completion Rate", pct(summary?.courseCompletionRate)], ["Certification Ratio", pct(summary?.certificationRatio)]],
    [["Generated", new Date().toLocaleString("en-GB")], null],
  ];

  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  let y = 32;
  rows.forEach(([left, right]) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(`${left[0]}:`, leftLabelX, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(dash(left[1]), leftValueX, y);
    if (right) {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${right[0]}:`, rightLabelX, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(dash(right[1]), rightValueX, y);
    }
    y += 6;
  });

  // Course records table
  y += 4;
  const columnXs = [];
  COLUMNS.reduce((x, col) => {
    columnXs.push(x);
    return x + col.width * contentWidth;
  }, PAGE_MARGIN);

  const drawHeader = () => {
    pdf.setFillColor(...HEADER_FILL);
    pdf.rect(PAGE_MARGIN, y, contentWidth, ROW_HEIGHT, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    COLUMNS.forEach((col, i) => pdf.text(col.label, columnXs[i] + 2, y + 5.5));
    y += ROW_HEIGHT;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
  };

  drawHeader();
  const records = transcript.courseRecords ?? [];
  if (records.length === 0) {
    pdf.text("No course records found.", PAGE_MARGIN + 2, y + 5.5);
  }
  records.forEach((record, idx) => {
    if (y + ROW_HEIGHT > pageHeight - PAGE_MARGIN) {
      pdf.addPage();
      y = PAGE_MARGIN;
      drawHeader();
    }
    if (idx % 2 === 1) {
      pdf.setFillColor(245, 247, 250);
      pdf.rect(PAGE_MARGIN, y, contentWidth, ROW_HEIGHT, "F");
    }
    COLUMNS.forEach((col, i) => {
      const maxWidth = col.width * contentWidth - 4;
      const [line] = pdf.splitTextToSize(dash(col.value(record)), maxWidth);
      pdf.text(line, columnXs[i] + 2, y + 5.5);
    });
    pdf.setDrawColor(230, 230, 230);
    pdf.line(PAGE_MARGIN, y + ROW_HEIGHT, PAGE_MARGIN + contentWidth, y + ROW_HEIGHT);
    y += ROW_HEIGHT;
  });

  return pdf.output("blob");
};
