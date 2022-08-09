/** A timer that executes a recurring task each certain time */
export class PausableTimer {
    constructor(interval=1.0, callback=null){
        this.interval = interval;
        this.callback = callback;
        this.timeout = null;
    }

    /**
     * Starts the timer
     */
    start(){
        this.stop();
        this.timeout = setTimeout(this.callback, this.interval);
    }

    /**
     * Resumes the timeout
     * @param {boolean} now - resume now ? 
     */
    resume(now=false){
        if(now){
            this.callback();
        }
        this.start();
    }

    pause() {
        this.stop();
    }

    stop(){
        if(this.timeout){
            clearTimeout(this.timeout);
        }
    }

    reset(){
        this.stop();
        this.start();
    }
}