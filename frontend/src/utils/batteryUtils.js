const getSocColor = (soc) => {
    if (!soc || soc < 20) return '#ff4444'; // Critical - Red
    if (soc < 40) return '#ffbb33';  // Warning - Orange
    if (soc < 60) return '#ffeb3b';  // Caution - Yellow
    if (soc < 80) return '#00C851';  // Good - Green
    return '#2196F3';                // Excellent - Blue
};

const getBatteryStatus = (soc) => {
    if (!soc || soc < 20) return 'Kritik';
    if (soc < 40) return 'Düşük';
    if (soc < 60) return 'Orta';
    if (soc < 80) return 'İyi';
    return 'Mükemmel';
};

export { getSocColor, getBatteryStatus };
