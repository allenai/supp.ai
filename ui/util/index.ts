export function debounce<A extends any[]>(
    callback: (...args: A) => void,
    delay: number = 100
): (...args: A) => void {
    let tmr: number | undefined = undefined;
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
