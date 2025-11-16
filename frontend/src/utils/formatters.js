/**
 * Formata uma string de data para o padrão pt-BR.
 * @param {string} dateString - A data a ser formatada.
 * @param {object} options - Opções de formatação. `style: 'long'` para data e hora.
 * @returns {string} A data formatada.
 */
export const formatDate = (dateString, options = { style: 'short' }) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (options.style === 'long') {
    return date.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Formata uma distância em metros para quilômetros.
 * @param {number} distanceInMeters - A distância em metros.
 * @returns {string} A distância formatada em km.
 */
export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters === null || distanceInMeters === undefined) return '0 km';
  return `${(distanceInMeters / 1000).toFixed(2)} km`;
};

/**
 * Formata o tempo em segundos para horas e minutos.
 * @param {number} timeInSeconds - O tempo em segundos.
 * @returns {string} O tempo formatado.
 */
export const formatTime = (timeInSeconds) => {
  if (!timeInSeconds) return '0h 0m';
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatElevation = (elevationInMeters) => {
  if (!elevationInMeters) return '0 m';
  return `${Math.round(elevationInMeters)} m`;
};

export const formatPower = (power) => {
  if (!power) return 'N/A';
  return `${Math.round(power)} W`;
};