export function ptn(message: string): string {
    return 'PTN' + message
        .normalize('NFKD')
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, '')
        .replace(/[AEIOU]/g, '')
        .normalize('NFC');
}