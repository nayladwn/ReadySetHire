// utils/linkGenerator.js
export function generateInterviewLink(applicantId) {
  const baseUrl = window.location.origin; // e.g. http://localhost:5173
  return `${baseUrl}/applicants/${applicantId}/take`;
}
