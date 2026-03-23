export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString(undefined, { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};