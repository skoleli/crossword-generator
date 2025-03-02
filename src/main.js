import { Boot } from './scenes/Boot';
import { Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Crossword } from './scenes/Crossword';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [
        Boot,
        Preloader,
        Crossword,
    ]
};

export default new Game(config);
