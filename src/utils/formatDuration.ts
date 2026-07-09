export const formatDuration = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    if (hour === 0) return `${minute} phút`;
    return `${hour} giờ ${minute} phút`;
};