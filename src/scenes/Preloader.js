import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.add.image(512, 384, 'preloader');
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0x000000);
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0x000000);
        this.load.on('progress', (progress) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('button', 'refresh.png');
    }

    create() {
        this.scene.transition({
            target: 'Crossword',
            duration: 500,
            moveBelow: true,
            onUpdate: (progress) => {
                this.cameras.main.setAlpha(1 - progress);
            }
        });
    }
}
