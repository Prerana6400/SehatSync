import { format, formatDistanceToNow, parseISO } from "date-fns";

/** Display ID like a medical record number */
export function formatMrn(id: number): string {
  return `MRN-${String(id).padStart(6, "0")}`;
}

export function formatVisitDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), "MMM d, yyyy");
  } catch {
    return isoDate;
  }
}

export function formatRelativeFromDate(isoDate: string): string {
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
  } catch {
    return isoDate;
  }
}
