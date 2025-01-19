export function format(number: number): string {
    return number.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
