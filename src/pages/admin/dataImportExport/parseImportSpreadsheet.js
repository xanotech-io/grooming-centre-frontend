import { read, utils, write } from "xlsx";
import dayjs from "dayjs";

const CANONICAL_FIELDS = {
  user_records: [
    { key: "firstName", required: true, aliases: ["firstname", "fname", "givenname", "givennames"] },
    { key: "lastName", required: true, aliases: ["lastname", "lname", "surname", "familyname"] },
    { key: "email", required: true, aliases: ["email", "emailaddress", "useremail", "studentemail", "mail"] },
    { key: "gender", required: false, aliases: ["gender", "sex"] },
    { key: "department", required: false, aliases: ["department", "departmentid", "departmentname", "dept"] },
  ],
  course_information: [
    { key: "title", required: true, aliases: ["title", "coursetitle", "coursename", "name"] },
    { key: "description", required: true, aliases: ["description", "coursedescription", "details", "summary"] },
    { key: "department", required: false, aliases: ["department", "departmentid", "departmentname", "dept"] },
  ],
  assessment_results: [
    { key: "email", required: true, aliases: ["email", "emailaddress", "studentemail", "useremail"] },
    { key: "assessmentTitle", required: true, aliases: ["assessmenttitle", "assessment", "assessmentname", "examtitle", "quiztitle"] },
    { key: "score", required: true, aliases: ["score", "marks", "mark", "grade", "result"] },
  ],
  attendance: [
    { key: "email", required: true, aliases: ["email", "emailaddress", "studentemail", "useremail"] },
    { key: "courseTitle", required: true, aliases: ["coursetitle", "course", "coursename", "title"] },
    { key: "sessionDate", required: true, aliases: ["sessiondate", "date", "attendancedate", "classdate"] },
    { key: "attendanceStatus", required: true, aliases: ["attendancestatus", "status", "attendance", "presentabsent"] },
  ],
};

const DATE_FIELDS = new Set(["sessionDate"]);
const LOWERCASE_FIELDS = new Set(["email", "gender", "attendanceStatus"]);

export const getCanonicalFields = (targetModule) => CANONICAL_FIELDS[targetModule] ?? [];

export const normalizeHeader = (value) =>
  String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const guessDelimiter = (line) => {
  const counts = {
    ",": (line.match(/,/g) || []).length,
    ";": (line.match(/;/g) || []).length,
    "\t": (line.match(/\t/g) || []).length,
  };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : ",";
};

const isEmptyRow = (row) =>
  !row || row.every((cell) => String(cell ?? "").trim() === "");

const formatCell = (value, canonicalKey) => {
  if (value == null || value === "") return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dayjs(value).format("YYYY-MM-DD");
  }

  if (typeof value === "number" && DATE_FIELDS.has(canonicalKey) && value > 20000 && value < 80000) {
    const parsed = dayjs("1899-12-30").add(Math.round(value), "day");
    if (parsed.isValid()) return parsed.format("YYYY-MM-DD");
  }

  const text = String(value).trim();
  if (DATE_FIELDS.has(canonicalKey)) {
    const parsed = dayjs(text);
    if (parsed.isValid()) return parsed.format("YYYY-MM-DD");
  }

  if (LOWERCASE_FIELDS.has(canonicalKey)) return text.toLowerCase();
  return text;
};

const scoreHeaderRow = (cells, targetModule) => {
  const fields = getCanonicalFields(targetModule);
  if (!fields.length) return 0;
  const normalized = cells.map(normalizeHeader).filter(Boolean);
  return fields.reduce((score, field) => {
    const matched = field.aliases.some((alias) => normalized.includes(alias));
    return score + (matched ? 1 : 0);
  }, 0);
};

export const findBestHeaderRow = (matrix, targetModule) => {
  const scanLimit = Math.min(matrix.length, 20);
  let bestIndex = 0;
  let bestScore = -1;
  for (let i = 0; i < scanLimit; i += 1) {
    const score = scoreHeaderRow(matrix[i] || [], targetModule);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return { headerRowIndex: bestIndex, matchCount: bestScore };
};

export const autoMapHeaders = (headers, targetModule) => {
  const fields = getCanonicalFields(targetModule);
  const used = new Set();
  const mapping = {};

  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    if (!normalized) return;
    const field = fields.find(
      (item) => !used.has(item.key) && item.aliases.includes(normalized)
    );
    if (field) {
      mapping[header] = field.key;
      used.add(field.key);
    }
  });

  return mapping;
};

export const applyColumnMapping = (headers, dataRows, mapping, targetModule) => {
  const fields = getCanonicalFields(targetModule);
  const canonicalKeys = fields.map((f) => f.key);

  return dataRows
    .map((row) => {
      const record = {};
      canonicalKeys.forEach((key) => {
        record[key] = "";
      });

      headers.forEach((header, index) => {
        const canonical = mapping[header];
        if (!canonical) return;
        record[canonical] = formatCell(row[index], canonical);
      });

      return record;
    })
    .filter((record) => canonicalKeys.some((key) => String(record[key] ?? "").trim() !== ""));
};

export const parseImportSpreadsheet = async (file) => {
  const buffer = await file.arrayBuffer();
  const isCsv = /\.csv$/i.test(file.name) || /csv/i.test(file.type);
  let workbook;

  if (isCsv) {
    const text = new TextDecoder("utf-8").decode(buffer).replace(/^\uFEFF/, "");
    const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
    workbook = read(text, {
      type: "string",
      FS: guessDelimiter(firstLine),
      raw: false,
      cellDates: true,
    });
  } else {
    workbook = read(buffer, { type: "array", raw: false, cellDates: true });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The file has no worksheets");
  }

  const matrix = utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  const nonEmpty = matrix.filter((row) => !isEmptyRow(row));
  if (nonEmpty.length === 0) {
    throw new Error("No rows or columns were found in the file");
  }

  return {
    sheetName,
    matrix: nonEmpty,
    detectedFormat: isCsv ? "csv" : "excel",
  };
};

export const buildNormalizedImportFile = ({ rows, fileFormat, originalName }) => {
  const worksheet = utils.json_to_sheet(rows);
  const baseName = originalName.replace(/\.[^.]+$/, "") || "import";

  if (fileFormat === "excel") {
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Import");
    const buffer = write(workbook, { bookType: "xlsx", type: "array" });
    return new File([buffer], `${baseName}.xlsx`, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  const csv = utils.sheet_to_csv(worksheet);
  return new File([`\uFEFF${csv}`], `${baseName}.csv`, {
    type: "text/csv;charset=utf-8",
  });
};
