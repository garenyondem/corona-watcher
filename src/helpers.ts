export function convertToEmoji(value: number) {
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