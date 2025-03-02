import LetterFrequency from "./LetterFrequency";
import { Matrix } from "./Matrix";

const ACCROSS = 0;
const DOWN = 1;

export default class CrosswordGenerator {
    constructor(trie, wordList) {
        this.trie = trie;
        this.wordList = wordList;
        this.frequency = LetterFrequency.compute(wordList);
        this.resultSet = [];
    }

    generate(matrixSize = 20) {
        // compute letter frequencies & initialize trie
        const words = this.prepareWords(this.wordList, this.frequency);

        // initialize matrix and place the first word in the center
        const initialMatrix = new Matrix(matrixSize, matrixSize, null);

        const firstWord = words[0];

        // start backtracking to place remaining words
        { // start by placing first word accross
            const initialCol = Math.floor((matrixSize - firstWord.length) / 2);
            const initialRow = Math.floor(matrixSize / 2);
            const matrix = this.placeWord(initialMatrix, firstWord.word, initialRow, initialCol, ACCROSS);
            const placedWords = [{ ...firstWord, row: initialRow, col: initialCol, direction: ACCROSS }];
            this.backtrack(matrix.clone(), words.filter(i => i.word !== firstWord.word), this.clone(placedWords));
        }

        { // start by placing first word down
            const initialCol = Math.floor(matrixSize / 2);
            const initialRow = Math.floor((matrixSize - firstWord.length) / 2);
            const matrix = this.placeWord(initialMatrix, firstWord.word, initialRow, initialCol, DOWN);
            const placedWords = [{ ...firstWord, row: initialRow, col: initialCol, direction: DOWN }];
            this.backtrack(matrix.clone(), words.filter(i => i.word !== firstWord.word), this.clone(placedWords));

        }

        return this.resultSet || { error: "No valid matrix found" };

    }

    backtrack(matrix, words, placedWords) {
        if (words.length === 0) {
            if (this.validateMatrix(matrix, this.trie, true)) {
                this.resultSet.push([matrix.clone().trim(), placedWords]);
            }
            return;
        }

        // select the word => the word with the highest frequency score first
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            // select placements and sort intersections by the lowest frequency
            const placements = this.findPlacements(matrix, word, placedWords);
            placements.sort((a, b) => {
                return this.frequency[a.intersecting.toLowerCase()] - this.frequency[b.intersecting.toLowerCase()]
            });

            for (const placement of placements) {
                let clonePlacedWords = this.clone(placedWords);
                let newMatrix = this.placeWord(matrix, word.word, placement.row, placement.col, placement.direction);
                clonePlacedWords.push({ ...word, direction: placement.direction, row: placement.row, col: placement.col });
                if (this.validateMatrix(newMatrix)) {
                    this.backtrack(newMatrix, words.filter((_, index) => i !== index), clonePlacedWords);
                }
            }
        }
        return;
    }

    validateMatrix(matrix, completeWord = false) {
        // extract fragments from the matrix
        let fragments = [];
        const directions = [[1, 0], [0, 1]]; // top down & left to right

        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                if (!matrix.get(i, j)) {
                    continue;
                }
                let word = '';

                // check the left cell
                if (matrix.isCellNullOrUndefined(i, j - 1)) {
                    word = this.findWordInDirection(directions[1][0], directions[1][1], matrix, i, j);
                    if (word) fragments.push(word);
                }

                // check the cell up
                if (matrix.isCellNullOrUndefined(i - 1, j)) {
                    word = this.findWordInDirection(directions[0][0], directions[0][1], matrix, i, j)
                    if (word) fragments.push(word);
                }
            }
        }

        for (let i = 0; i < fragments.length; i++) {
            const fragment = fragments[i];
            if (!this.trie.hasWord(fragment, completeWord)) { return false; }
        }

        return true;
    }

    findWordInDirection(dirX, dirY, matrix, x, y) {
        let letters = [];

        // convert to matrix
        for (let [i, j] = [x, y]; i < matrix.rows && j < matrix.cols;) {
            let value = matrix.get(i, j);
            if (!value) {
                break;
            }

            letters.push(value);
            i += dirX; j += dirY;
        }

        if (letters.length >= 2) {
            return letters.join('');
        }

        return '';
    }

    prepareWords(wordList, frequency) {
        let preparedWords = []
        for (const word of wordList) {
            preparedWords.push({
                word: word.toUpperCase(),
                score: LetterFrequency.scoreWord(word, frequency),
                length: word.length,
            });
        }

        return preparedWords.sort((a, b) => {
            if (b.score !== a.score) { return b.score - a.score; }
            return b.length - a.length;
        });
    }

    placeWord(matrix, word, row, col, direction = ACCROSS) {
        let clone = matrix.clone();
        for (let i = 0; i < word.length; i++) {
            direction === ACCROSS ? clone.set(row, col + i, word[i]) : clone.set(row + i, col, word[i]);
        }

        return clone;
    }

    clone(arr) {
        return arr.map(v => Array.isArray(v) ? [...v] : v);
    }

    findPlacements(matrix, word, placedWords) {
        let placements = [];
        // find intersecting placements with the placed words
        for (const placed of placedWords) {
            for (let i = 0; i < placed.word.length; i++) {
                const charPlaced = placed.word[i];
                for (let j = 0; j < word.length; j++) {
                    if (word.word[j] === charPlaced) {
                        // found the intersection.
                        const row = placed.direction === ACCROSS ? placed.row - j : placed.row + i;
                        const col = placed.direction === ACCROSS ? placed.col + i : placed.col - j;
                        if (this.canPlace(matrix, word.word, row, col, placed.direction === ACCROSS ? DOWN : ACCROSS)) {
                            placements.push({ row, col, direction: placed.direction === ACCROSS ? DOWN : ACCROSS, intersecting: word.word[j] })
                        }
                    }
                }
            }
        }

        return placements;
    }

    canPlace(matrix, word, row, col, direction = ACCROSS) {
        if (row < 0 || col < 0) return false;

        // check matrix boundaries
        if (direction === ACCROSS && !matrix.checkColBoundary(col + word.length)) {
            return false;
        }

        if (direction === DOWN && !matrix.checkRowBoundary(row + word.length)) {
            return false;
        }

        let isIntersecting = false;
        // check if there is an intersection
        for (let i = 0; i < word.length; i++) {
            const currLetter = word[i];
            if (!isIntersecting) {
                isIntersecting = direction === ACCROSS ? currLetter === matrix.get(row, col + i) : currLetter === matrix.get(row + i, col);
            }

            // if intersecting and the letter on the matrix differs from the current letter, return false            
            let valueOnMatrix = direction === ACCROSS ? matrix.get(row, col + i) : matrix.get(row + i, col);
            if (!valueOnMatrix) { continue; }

            if (direction === ACCROSS && currLetter !== valueOnMatrix) {
                return false;
            }

            if (direction === DOWN && currLetter !== valueOnMatrix) {
                return false;
            }
        }

        if (!isIntersecting) { return false; }

        return true;
    }
}