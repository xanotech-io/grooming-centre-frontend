import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportAsPdf = async (element, pdfFileName, imageQuality = 1) => {
  const canvas = await html2canvas(element);

  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [canvas.width * 0.264583, canvas.height * 0.264583], // Convert from pixels to mm
  });

  pdf.addImage(canvas.toDataURL("image/png", imageQuality), "PNG", 0, 0);
  pdf.save(pdfFileName);
};
