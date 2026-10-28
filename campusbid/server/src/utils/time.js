export const getServerTime = () => new Date();

export const getTimeOffset = () => 0; // Server clock is authoritative

export const formatCountdown = (closesAt) => {
  const now = new Date();
  const diff = closesAt - now;
  if (diff <= 0) return 'Closed';
  
  const minutes = Math.max(0, Math.floor(diff / 60000));
  const seconds = Math.max(0, Math.floor((diff % 60000) / 1000));
  return `${minutes}m ${seconds}s`;
};