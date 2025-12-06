// File: src/utils/dateUtils.js

export const formatDateIndo = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  // Pastikan valid date
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
