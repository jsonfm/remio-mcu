import { PausableTimer } from './timers.js';


export class Variables {
    /**
     * Creates an inteligent variables manager (JSON).
     * @param {object} variables - a json with variables names and values.
     */
    constructor(variables={}, enabled=true, interval=2.0, supervise){
        this.variables = variables;
        this.backup = {...variables};
        this.enabled = enabled;
        this.streamingStatus = false;
        this.timer = new PausableTimer(interval, supervise);
    }

    toString(){
        return this.variables;
    }

    /**
     * Restores the variables values using the backup.
     */
    restore(){
        this.variables = {...this.backup};
    }

    /** 
     * Returns the variables values.
    */
    values(){
        return this.variables;
    }

    /**
     * Updates a specific variable value
     * @param {string} key - the variable name
     * @param {*} value - a value for the current variable
     * @param {boolean} backup - save the previous variables values?
     * @param {boolean} streamingStatus - flag
     */
    set = (key, value, backup = true, streamingStatus = false) => {
        if(backup){
            this.backup = {...this.variables};
        }
        this.variables[key] = value;
        this.setStreamingStatus(streamingStatus);
    }
    
    /**
     * Returns a value of the variables JSON given a key
     * @param {string} key - the current variable name
     */
    get = (key) => {
        return this.variables[key];
    }

    /** Checks if variables is enabled */
    isEnabled = () => {
        return this.enabled;
    }

    /**
     * Updates the updated status.
     * @param {boolean} value.
     */
    setStreamingStatus = (value) => {
        this.streamingStatus = value;
    }
    
    /** Stringify variables */
    json = () => {
        return JSON.stringify(this.variables)
    }

    /** 
     * Updates variables values.
     * @param {string | object} data - a json string with variables.
    */
    update = (data) => {
        let variables = data;
        if (typeof variables === 'string'){
            variables = JSON.parse(variables);
        }
        this.variables = {...variables};
        this.backup = {...variables};
        this.setStreamingStatus(true);
    }

    /** Returns the current streaming status */
    streamed = () => {
        return this.streamingStatus;
    }

    /**
     * Updates the streaming status.
     * @param {boolean} value - the new streaming status value.
     */
    setStreamingStatus = (value=true) => {
        this.streamingStatus = value;
        this.timer.reset(true);
    }

    /**
     * Waits for a response
     */
    waitResponse = () => {
        this.timer.resume(false);
    }

    /** Checks if variables were streamed, else restores their last values. */
    checkStreamingFail = () => {
        if(!this.streamed()){
            this.restore();
        }
    }

    /** Resets the streaming status. */
    resetStreamingStatus = () => {
        this.setStreamingStatus(false);
        this.timer.pause()
    }

    streamedSucessfully = () => {
        console.log("streamed succesfully!");
        this.setStreamingStatus(true);
        this.timer.resume(true);
    }

    /** Stops secondaries processes like timeouts or intervals. */
    stop = () => {
        this.timer?.stop()
    }


}
