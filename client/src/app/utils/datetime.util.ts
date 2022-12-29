export function getTimezoneOffsetString() {
    const offsetInMinutes = new Date().getTimezoneOffset();

    if(offsetInMinutes === 0) return '';

    let offsetHours = String(Math.floor(offsetInMinutes / 60));
    while(offsetHours.length < 2) offsetHours = '0'.concat(offsetHours);

    let offsetMinutes = String(offsetInMinutes % 60);
    while(offsetMinutes.length < 2) offsetMinutes = '0'.concat(offsetMinutes);

    const sign = offsetInMinutes > 0 ? "+" : '-';

    return `${sign}${offsetHours}:${offsetMinutes}`;
}

export function getMonthStr(month:number) {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]
    return months[month - 1];
}

export function getNextMonthAndYear(month:number, year:number) {
    if(month === 11) return [0, year + 1];
    else return [month + 1, year];
}

export function getCurrentMonthAndYear() {
    const now = new Date();
    return {
        month : now.getMonth(),
        year : now.getFullYear()
    }
}

export function padLeftWithZeroes(originalString:string, targetLength:number) {
    let result = originalString;
    while(result.length < targetLength) result = '0'.concat(result);
    return result;
}