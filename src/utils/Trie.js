export class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        const normalizedWord = word.toUpperCase();

        for (const char of normalizedWord) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }

            node = node.children.get(char);
        }
        node.isEndOfWord = true;
    }

    insertMultiple(wordList) {
        for (const word of wordList) {
            this.insert(word);
        }
    }

    hasWord(word, completeWord = false) {
        let node = this.root;
        const normalized = word.toUpperCase();

        for (const char of normalized) {
            if (!node.children.has(char)) return false;
            node = node.children.get(char);
        }

        if (completeWord) {
            return node.isEndOfWord;
        }

        return true;
    }
}


class TrieNode {
    constructor() {
        this.children = new Map()
        this.isEndOfWord = false;
    }
}