export class Matrix {
    constructor(rows, cols, initialValue = 0) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(rows).fill().map(() => Array(cols).fill(initialValue));
    }

    clone() {
        let newMatrix = new Matrix(this.rows, this.cols);
        newMatrix.data = this.data.map((v) => [...v]);
        return newMatrix;
    }

    set(row, col, value) {
        if (this.#isValidIndex(row, col)) {
            this.data[row][col] = value;
        } else {
            throw new Error(`Invalid index: (${row}, ${col})`);
        }
    }

    get(row, col) {
        if (this.#isValidIndex(row, col)) {
            return this.data[row][col];
        } else {
            throw new Error(`Invalid index: (${row}, ${col})`);
        }
    }

    display() {
        console.log(this.data.map(row => row.join('\t')).join('\n'));
    }

    trim(value = null) {
        const rowsWithValue = this.data.filter(row => !row.every(cell => cell === value));

        if (rowsWithValue.length === 0) return [];

        const columnsToKeep = [];
        for (let col = 0; col < this.data.length; col++) {
            if (rowsWithValue.some(row => row[col] !== value)) {
                columnsToKeep.push(col);
            }
        }
        this.data = rowsWithValue.map(row => columnsToKeep.map(col => row[col]));
        this.rows = this.data.length;
        this.cols = this.data[0].length;
        return this;
    }

    checkRowBoundary(row) {
        return this.#isValidIndex(row, 0);
    }

    checkColBoundary(col) {
        return this.#isValidIndex(0, col);
    }

    isCellNullOrUndefined(row, col) {
        return !(this.#isValidIndex(row, col) && this.data[row][col] !== null);
    }

    #isValidIndex(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
}