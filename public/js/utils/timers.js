/** A timer that executes a recurring task each certain time */
export class PausableTimer {
    /**
     * 
     * @param {number} interval - time on ms
     * @param {function} callback - a function
     */
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
    /** Pauses the timer */
    pause() {
        this.stop();
    }
    /** Stops the timer */
    stop(){
        if(this.timeout){
            clearTimeout(this.timeout);
        }
    }
    /** Restarts the timer */
    reset(){
        this.stop();
        this.start();
    }
}