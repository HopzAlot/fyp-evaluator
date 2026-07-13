import type { ProjectCsvRow } from "@/types/project";
import { normalizeText } from "@/utils/normalization/facultyNormalization";

const expectedHeaders = [
  "title",
  "student1",
  "student2",
  "student3",
  "student4",
  "supervisor",
  "cosupervisor",
  "industrialpartner",
  "sdg",
];

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let currentCell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      currentCell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === "," && !quoted) {
      cells.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  cells.push(currentCell.trim());

  return cells;
}

function parseCsv(text: string) {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map(parseCsvLine);
}

export function parseProjectCsv(text: string): ProjectCsvRow[] {
  const rows = parseCsv(text);

  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one project");
  }

  const headers = rows[0].map(normalizeHeader);
  const hasExpectedHeaders =
    headers.length === expectedHeaders.length &&
    expectedHeaders.every((header, index) => headers[index] === header);

  if (!hasExpectedHeaders) {
    throw new Error(
      "CSV headers must be: title, student 1, student 2, student 3, student 4, supervisor, co supervisor, industrial partner, sdg",
    );
  }

  return rows.slice(1).map((row, index) => {
    if (row.length !== expectedHeaders.length) {
      throw new Error(`Row ${index + 2}: CSV must have exactly 9 columns`);
    }

    const title = normalizeText(row[0] ?? "");
    const students = row
      .slice(1, 5)
      .map((student) => normalizeText(student ?? ""))
      .filter(Boolean);
    const supervisor = normalizeText(row[5] ?? "");
    const industrialPartner = normalizeText(row[7] ?? "");
    const sdg = normalizeText(row[8] ?? "");

    if (!title) {
      throw new Error(`Row ${index + 2}: title is required`);
    }

    if (students.length === 0) {
      throw new Error(`Row ${index + 2}: at least one student is required`);
    }

    if (!supervisor) {
      throw new Error(`Row ${index + 2}: supervisor is required`);
    }

    if (!industrialPartner) {
      throw new Error(`Row ${index + 2}: industrial partner is required`);
    }

    if (!sdg) {
      throw new Error(`Row ${index + 2}: sdg is required`);
    }

    return {
      title,
      students,
      supervisor,
      coSupervisor: normalizeText(row[6] ?? ""),
      industrialPartner,
      sdg,
    };
  });
}
