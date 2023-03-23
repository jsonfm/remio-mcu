// ================= CONFIGURE GUI ELEMENTS ======================
class CustomMockup {
    /** A class for manage a mockup with a GUI. */
    constructor(){ 
        this.loadGUI();
        this.configureGUI();
        this.configureVariables();
        this.configureSocket();
    }

    /** Loads the GUI */
    loadGUI = () => {
        // this.image = new CustomImage("image");
        this.playBtn = new jsqt.Toggle("playBtn", "btn btn-light", "btn btn-dark");
        this.dirBtn = new jsqt.Toggle("dirBtn", "btn btn-light", "btn btn-dark");
        this.ledSocket = new jsqt.Toggle("ledSocket", "btn btn-success rounded-pill", "btn btn-light rounded-pill");
        this.speedSlider = new jsqt.Base("speedSlider");
        this.speedLabel = new jsqt.Label("speedLabel");
    }

    /** Configures GUI */
    configureGUI = () => {
        
        // Some visual elements
        this.ledSocket.setEnabled(false);
        setTimeout(this.SuperviseVariablesStreaming, 500);

        // Control buttons
        this.playBtn.on("click", () => this.updateVariables("play", this.playBtn.isChecked()));
        this.dirBtn.on("click", () => this.updateVariables("direction", this.dirBtn.isChecked()));
        this.speedSlider.on("change", () => this.updateVariables("speed", this.speedSlider.value() * 0.3));
        this.speedSlider.on("input", () => this.speedLabel.setText(`${(this.speedSlider.value() * 0.3).toFixed(2)}`))
    }

    /** Configures the socketio events */
    configureSocket = () => {
        // Initalize socketio
        this.socket = io.connect(SOCKETIO_SERVER_ADDRESS, {
            secure: false,
            transports: ['websocket', 'polling']
        });
        // Socketio Events
        this.socket.on("connect", this.updateConnectionStatus);
        this.socket.on("disconnect", this.updateConnectionStatus);
        this.socket.on(SERVER_SENDS_DATA_WEB, this.receiveVariables);
        this.socket.on(SERVER_NOTIFIES_DATA_WERE_RECEIVED_WEB, this.variables.streamedSucessfully);
    }

    /** Configures variables */
    configureVariables = () => {
        this.variables = new Variables({
            "play": false,
            "direction": false,
            "speed": 0,
        }, true, 3000, this.superviseVariablesStreaming);
    }

    /** locks the GUI elements  */
    lockGUI(){
        this.playBtn.setEnabled(false);
        this.dirBtn.setEnabled(false);
        this.speedSlider.setEnabled(false);
    }

    /** Unlocks the GUI elements */
    unlockGUI(){
        this.playBtn.setEnabled(true);
        this.dirBtn.setEnabled(true);
        this.speedSlider.setEnabled(true);
    }

    /** Sets variables on the GUI. */
    setVariablesOnGUI = () => {
        const parseVal = (value) => parseInt(parseFloat(value) / 0.3)
        const data = this.variables.values();
        this.playBtn.setChecked(data["play"]);
        this.dirBtn.setChecked(data["direction"]);
        this.speedSlider.setValue(parseVal(data["speed"]));
        this.speedLabel.setText(parseFloat(data["speed"]).toFixed(2));
    }

    /** Checks the variables streamed status and restores the backup if necessary. */
    superviseVariablesStreaming = () => {
        // Confirms variables streaming or restores their last values
        this.variables.checkStreamingFail();
        this.setVariablesOnGUI();

        // Puts streaming status to false and unlocks the GUI
        this.variables.resetStreamingStatus();
        this.unlockGUI();
    }

    /** 
     * Updates video frame mjpeg.
     * @param {string} frame - a base64 encoded video frame.
     */
    updateVideo = (frame) => {
        if(typeof frame === 'object'){
            this.image?.setBase64Source(frame["webcam"]);
        }else{
            this.image?.setBase64Source(frame);
        }
    }

    /**
     * It's called when a socket connection event ocurrs.
     */
    updateConnectionStatus = () => {
        const status = this.socket.connected;
        this.ledSocket.setChecked(status);
        
        if(status){
            this.socket.volatile.emit(WEB_JOINS_ROOM_SERVER, MOCKUP_ROOM);
            this.socket.emit(WEB_REQUESTS_DATA_SERVER);
        }
    }

    /** 
     * Receives variables coming from the socketio server. 
     * @param {string} data - received variables
     * */
     receiveVariables = (data) => {
        this.variables.update(data);
        this.setVariablesOnGUI();
        this.socket.volatile.emit(WEB_NOTIFIES_DATA_WERE_RECEIVED_SERVER);
    }

    /**
     * Streams variables to the socketio server
     * @param {boolean} lock - lock the GUI?
     */
    streamVariables = (lock = true) => {
        this.socket.emit(WEB_SENDS_DATA_SERVER, this.variables.values());
        if (lock && this.variables.isEnabled()){
            this.lockGUI();
            this.variables.waitResponse();
        }
    }

    /**
     * Updates variables and stream they to the socketio server
     * @param {string} key - name of the variable.
     * @param {*} value  - new value of the variable.
     */
    updateVariables = (key, value) => {
        this.variables.set(key, value, true, false);
        this.streamVariables();
    }

}


const mockup = new CustomMockup();