export function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

export function getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function getDayOfWeek(date: Date): number {
    return date.getDay();
}

export function getWeekDates(): string[] {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(diff + i);
        dates.push(getDateString(d));
    }
    return dates;
}

export function getLast7Days(): string[] {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(getDateString(d));
    }
    return dates;
}

export function getLast30Days(): string[] {
    const dates: string[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(getDateString(d));
    }
    return dates;
}

export function formatDateShort(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDateDay(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.getDate().toString();
}

export function isToday(dateStr: string): boolean {
    return dateStr === getToday();
}

export function isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');
    const diff = Math.abs(d1.getTime() - d2.getTime());
    return diff === 86400000;
}

export function calculateStreak(completedDates: string[], todayDate?: string): number {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort().reverse();
    const today = todayDate || getToday();
    const todayObject = new Date(today + 'T00:00:00');
    const yesterdayObject = new Date(todayObject.getTime() - 86400000);
    const yesterday = getDateString(yesterdayObject);

    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        if (isConsecutiveDay(sorted[i], sorted[i - 1])) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

export function getDayLabel(index: number): string {
    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return labels[index] ?? '';
}
