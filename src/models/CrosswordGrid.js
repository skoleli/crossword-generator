export class CrosswordGrid {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.cellSize = 40;
        this.spacing = 2;
        this.selectedCell = null;
    }

    static genConfigFrom(wordList, matrix) {
        const rows = matrix.rows;
        const cols = matrix.cols;
        const cells = [];
        const words = [];
        let currentNumber = 1;

        // initialize cells grid
        for (let row = 0; row < rows; row++) {
            cells[row] = [];
            for (let col = 0; col < cols; col++) {
                const letter = matrix.get(row, col);
                cells[row][col] = {
                    active: !!letter,
                    letter: letter ? letter.toLowerCase() : null,
                    number: null
                };
            }
        }

        // find word starts horizontally
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (cells[row][col].active &&
                    (col === 0 || !cells[row][col - 1].active)) {
                    // found start of across word
                    const word = this.getWord(matrix, row, col, 0, 1);
                    if (!wordList.includes(word)) { continue; }
                    words.push({
                        id: currentNumber,
                        direction: 'across',
                        answer: word,
                        start: { row, col }
                    });
                    cells[row][col].number = currentNumber;
                    currentNumber++;
                }
            }
        }

        // find word starts vertically
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                if (cells[row][col].active &&
                    (row === 0 || !cells[row - 1][col].active)) {
                    // found start of down word
                    const word = this.getWord(matrix, row, col, 1, 0);
                    if (!wordList.includes(word)) { continue; }
                    words.push({
                        id: currentNumber,
                        direction: 'down',
                        answer: word,
                        start: { row, col }
                    });
                    cells[row][col].number = currentNumber;
                    currentNumber++;
                }
            }
        }

        return {
            rows,
            cols,
            cells,
            words,
        };
    }

    static getWord(matrix, startRow, startCol, rowStep, colStep) {
        let word = '';
        let row = startRow;
        let col = startCol;

        while (row < matrix.rows && col < matrix.cols && matrix.get(row, col)) {
            word += matrix.get(row, col);
            row += rowStep;
            col += colStep;
        }

        return word.toLowerCase();
    }

    destroy() {
        this.cells.forEach(cell => {
            cell.bg.destroy();
            if (cell.numberText) cell.numberText.destroy();
            cell.letterText.destroy();
        });
        this.cells = [];
    }

    render(offsetX = 0, offsetY = 0) {
        this.cells = [];

        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                const cellConfig = this.config.cells[row][col];
                if (!cellConfig.active) continue;

                // calculate position
                const x = offsetX + col * (this.cellSize + this.spacing);
                const y = offsetY + row * (this.cellSize + this.spacing);

                let { bg, letterText, numberText } = this.renderCell(x, y, cellConfig);

                this.cells.push({ bg, letterText, numberText, row, col });
            }
        }
    }

    renderCell(x, y, cellConfig) {// Draw cell background
        const bg = this.scene.add
            .rectangle(x, y, this.cellSize, this.cellSize, 0xffffff)
            .setStrokeStyle(1, 0x000000)
            .setInteractive();

        let numberText;
        if (cellConfig.number) {
            numberText = this.scene.add.text(
                x - this.cellSize / 2 + 2, y - this.cellSize / 2 + 2, cellConfig.number, { fontSize: 12, color: '#000' });
        }

        const letterText =
            this.scene.add
                .text(
                    x, y,
                    cellConfig.letter.toUpperCase() || '', { fontSize: 20, color: '#000' })
                .setOrigin(0.5);

        return {
            bg, letterText, numberText
        };
    }
}


/* EXAMPLE CONFIG

const gridData = {
    rows: 5,
    cols: 6,
    cells: [
        // Row 0
        [
            { active: true, letter: 's', number: 1 },     // (0,0)
            { active: true, letter: 'e', number: 2 },     // (0,1)
            { active: true, letter: 'a', number: null },  // (0,2)
            { active: true, letter: 't', number: null },  // (0,3)
            { active: false },                            // (0,4)
            { active: false },                            // (0,4)
        ],
        // Row 1
        [
            { active: false },                            // (1,0)
            { active: true, letter: 'a', number: null },  // (1,1)
            { active: false },                            // (1,2)
            { active: false },                            // (1,3)
            { active: false },                            // (1,4)
            { active: false },                            // (0,4)
        ],
        [
            { active: false },                            // (0,0)
            { active: true, letter: 's', number: 3 },     // (0,1)
            { active: true, letter: 'e', number: null },     // (0,2)
            { active: true, letter: 't', number: 4 },  // (0,3)
            { active: false },                            // (0,4)
            { active: false },                            // (0,4)
        ],
        [
            { active: false },                            // (0,0)
            { active: true, letter: 't', number: null },     // (0,1)
            { active: false },                            // (0,2)
            { active: true, letter: 'e', number: 5 },     // (0,3)
            { active: true, letter: 'a', number: null },  // (0,3)
            { active: true, letter: 't', number: null },  // (0,3)
        ],
        [
            { active: false },                            // (0,0)
            { active: false },                            // (0,0)
            { active: false },                            // (0,0)
            { active: true, letter: 'a', number: null },  // (0,3)
            { active: false }, { active: false },           // (0,4)
            // (0,4)
        ],
    ],
    words: [
        {
            id: 1,
            clue: '',
            answer: 'SEAT',
            direction: 'across',
            start: { row: 0, col: 0 }
        },
        {
            id: 2,
            clue: '',
            answer: 'EAST',
            direction: 'down',
            start: { row: 0, col: 3 }
        },
        {
            id: 3,
            clue: '',
            answer: 'SET',
            direction: 'down',
            start: { row: 0, col: 3 }
        },
        {
            id: 4,
            clue: '',
            answer: 'TEA',
            direction: 'down',
            start: { row: 0, col: 3 }
        },
        {
            id: 5,
            clue: '',
            answer: 'EAT',
            direction: 'down',
            start: { row: 0, col: 3 }
        },
    ]
};
*/