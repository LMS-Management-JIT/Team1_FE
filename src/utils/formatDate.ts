export const formatDate = (date: string | number | Date) => {
    return new Date(date).toLocaleDateString("vi-VN");
};