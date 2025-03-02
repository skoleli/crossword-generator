import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('preloader', 'assets/preloader.jpeg');
    }

    create() {
        this.registry.set('words', ['seat', 'set', 'eat', 'east', 'tea']);
        this.add.image(0, 0, 'preloader');

        this.scene.start('Preloader');
    }
}
