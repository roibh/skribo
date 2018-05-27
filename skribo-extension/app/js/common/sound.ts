class SoundManager {
    sounds: any = {};
    audio: HTMLAudioElement;
    constructor() {
        this.sounds['bell'] = 'bell_ring.mp3';
        this.sounds['click'] = 'button_click_on.mp3';
        this.sounds['tray'] = 'cd_tray.mp3';
        this.sounds['call'] = 'call-ring.mp3';
        this.sounds['water'] = 'water_droplet_3.mp3';
    }

    public play(key: string) {
        if (this.sounds[key]) {
            this.audio = new Audio('app/sound/phone-ringing.mp3');
            this.audio.play();
        }
    }

    public stop() {
        this.audio.pause();

    }

}