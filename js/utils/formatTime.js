/**
 * Formata un temps en segons a format MM:SS
 * @param {number} seconds - Temps en segons
 * @return {string} - Temps formatat MM:SS
 */
function formatTime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
        return "00:00";
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

export default formatTime;