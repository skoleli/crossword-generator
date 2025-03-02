export default class LetterFrequency {
    static compute(words) {
        const frequency = {};
        // count occurrences of each letter
        for (const word of words) {
            for (const char of word) {
                frequency[char] = (frequency[char] || 0) + 1;
            }
        }
        return frequency;
    }


    static scoreWord(word, frequencies) {
        return [...word].reduce((sum, char) => sum + (frequencies[char] || 0), 0);
    }
}