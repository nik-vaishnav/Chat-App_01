export const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'long',  // e.g., Saturday
    year: 'numeric',
    month: 'long',    // e.g., June
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};