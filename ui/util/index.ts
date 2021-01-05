export function debounce<A extends any[]>(
    callback: (...args: A) => void,
    delay: number = 100
): (...args: A) => void {
    let tmr: NodeJS.Timeout | undefined = undefined;
    const delayExecution = (...args: A) => {
        if (tmr !== undefined) {
            clearTimeout(tmr);
        }
        tmr = setTimeout(() => callback(...args), delay);
    };
    return delayExecution;
}

export function pluralize(str: string, len: number, plural?: string): string {
    return len === 1 ? str : plural || `${str}s`;
}

export function formatNumber(value: number): string {
    const intl = Intl.NumberFormat();
    return intl.format(value);
}
