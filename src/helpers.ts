export function convertNumberToEmoji(value: number) {
    const emojiDict: { [key: string]: string } = {
        '0': '0️⃣',
        '1': '1️⃣',
        '2': '2️⃣',
        '3': '3️⃣',
        '4': '4️⃣',
        '5': '5️⃣',
        '6': '6️⃣',
        '7': '7️⃣',
        '8': '8️⃣',
        '9': '9️⃣',
    };
    return value
        .toString()
        .split('')
        .reduce((acc: string, curr: string) => {
            return acc + emojiDict[curr];
        }, '');
}

export function convertCountryToEmoji(country: string) {
    return country.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

export function convertEmojiToCountry(emojiUnicode: string) {
    return emojiUnicode.replace(/../g, (cp) => String.fromCharCode(cp.codePointAt(0)! - 127397));
}

export function convertStringToHeaderCase(str: string) {
    return str
        .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
        .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
        .replace(/[^A-Za-z0-9]+|_+/g, ' ')
        .toLowerCase()
        .replace(/( ?)(\w+)( ?)/g, (m, a, b, c) => a + b.charAt(0).toUpperCase() + b.slice(1) + c);
}
