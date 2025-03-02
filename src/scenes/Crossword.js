import { Scene } from 'phaser';

import { CrosswordGrid } from '../models/CrosswordGrid';
import CrosswordGenerator from '../utils/CrosswordGenerator';
import { Trie } from "../utils/Trie";


export class Crossword extends Scene {
    constructor() {
        super('Crossword');
    }

    init() {
        this.currentCrosswordIndex = 0;
        this.crosswordData = [];
    }

    create() {
        this.gridData = this.registry.get('gridData');
        const textStyle = {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#333',
            fontStyle: 'bold'
        };
        this.add.image(512, 384, 'preloader');

        const button = this.add.text(100, 100, 'Next Crossword', textStyle).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            button.setStyle({ fill: '#0000de' });
        })
            .on('pointerout',
                () => {
                    button.setStyle({ fill: '#333' });
                })
            .on('pointerdown',
                () => {
                    button.scale = 0.9;
                })
            .on('pointerup', () => {
                button.scale = 1;
                this.handleButtonClick();
            });



        this.words = ['seat', 'set', 'east', 'eat', 'tea'];
        // this.words = ['seam', 'met', 'task', 'title', 'istanbul', 'people', 'some'];

        this.crosswordData = this.generateCrosswords(this.words);
        this.showCurrentCrossword();
    }

    showCurrentCrossword() {
        // clear previous grid
        if (this.grid) {
            this.grid.destroy();
        }

        // get current crossword data
        const [matrix] = this.crosswordData[this.currentCrosswordIndex];

        // generate config and render
        const config = CrosswordGrid.genConfigFrom(this.words, matrix);
        this.grid = new CrosswordGrid(this, config);
        this.grid.render(100, 200);
    }


    generateCrosswords(words) {
        const trie = new Trie();
        trie.insertMultiple(words);

        let cwGenerator = new CrosswordGenerator(trie, words);

        const startTime = performance.now()
        const data = cwGenerator.generate();
        const endTime = performance.now();

        console.log(`Call to CrosswordGenerator took ${(endTime - startTime)} milliseconds`)
        console.log(`Found ${data.length} answers`);
        return data;
    }

    handleButtonClick() {
        console.log('Button clicked!');
        this.currentCrosswordIndex =
            (this.currentCrosswordIndex + 1) % this.crosswordData.length;
        this.showCurrentCrossword();
    }
}