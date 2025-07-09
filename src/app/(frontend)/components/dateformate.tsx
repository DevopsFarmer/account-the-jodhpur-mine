export const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata"
    });
  
  export const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata"
    });