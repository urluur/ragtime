// code from https://blog.paul.cx/post/metronome/

class metronome {
    constructor() {
        this.ac = new AudioContext();
        var buf = this.ac.createBuffer(1, this.ac.sampleRate * 2, this.ac.sampleRate);
        var channel = buf.getChannelData(0);
        var phase = 0;
        var amp = 1;
        var duration_frames = this.ac.sampleRate / 50;
        this.frequency = 440;
        this.tempo = 120;
        for (var i = 0; i < duration_frames; i++) {
            channel[i] = Math.sin(phase) * amp;
            phase += 2 * Math.PI * this.frequency / this.ac.sampleRate;
            if (phase > 2 * Math.PI) {
              phase -= 2 * Math.PI;
            }
            amp -= 1 / duration_frames;
        }
        this.source = this.ac.createBufferSource();
        this.source.buffer = buf;
        this.source.loop = true;
        this.source.loopEnd = 1 / (this.tempo / 60);
        this.source.connect(this.ac.destination);
        this.source.start(0);
        this.ac.suspend();
        this.isRunning = false;
    }

    start() {
        this.ac.resume();
        this.isRunning = true;
    }

    stop() {
        this.ac.suspend();
        this.isRunning = false;
    }

    setTempo(bpm) {
        this.tempo = this.clampTempo(bpm);
        this.source.loopEnd = 1 / (this.tempo / 60);
    }

    getTempo() {
        return this.tempo;
    }

    clampTempo(t) {
        return this.clamp(t, 30, 300);
    }

    clamp(v, min, max) {
        return Math.min(max, Math.max(min, v));
    }

    isRunning() {
        return this.isRunning;
    }

}

// m = new metronome()
// m.setTempo(60);
// m.start();
