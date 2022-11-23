import { Variables } from "./utils/variables.js";
import { CustomImage, CustomButton, ToggleButton, CustomSelect } from "./utils/widget.js"


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
        this.image = new CustomImage("image");
        this.btn1 = new ToggleButton("btn1", "btn btn-light", "btn btn-dark");
        this.btn2 = new ToggleButton("btn2", "btn btn-light", "btn btn-dark");
        this.btn3 = new ToggleButton("btn3", "btn btn-light", "btn btn-dark");
        this.ledSocket = new ToggleButton("ledSocket", "btn btn-success rounded-pill", "btn btn-light rounded-pill");
        console.log("led: ", this.ledSocket);
    }

    /** Configures GUI */
    configureGUI = () => {
        
        // Some visual elements
        this.ledSocket.setEnabled(false);
        setTimeout(this.SuperviseVariablesStreaming, 500);

        // Control buttons
        this.btn1.on("click", () => this.updateVariables("btn1", this.btn1.isChecked()));
        this.btn2.on("click", () => this.updateVariables("btn2", this.btn2.isChecked()));
        this.btn3.on("click", () => this.updateVariables("btn3", this.btn3.isChecked()));
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
        // this.socket.on(SERVER_STREAMS_VIDEO_WEB, this.updateVideo);
    }

    /** Configures variables */
    configureVariables = () => {
        this.variables = new Variables({
            "btn1": false,
            "btn2": false,
            "btn3": false,
        }, true, 3000, this.superviseVariablesStreaming);
    }

    /** locks the GUI elements  */
    lockGUI(){
        this.btn1.setEnabled(false);
        this.btn2.setEnabled(false);
        this.btn3.setEnabled(false);
    }

    /** Unlocks the GUI elements */
    unlockGUI(){
        this.btn1.setEnabled(true);
        this.btn2.setEnabled(true);
        this.btn3.setEnabled(true);
    }

    /** Sets variables on the GUI. */
    setVariablesOnGUI = () => {
        const data = this.variables.values();
        this.btn1.setChecked(data["btn1"]);
        this.btn2.setChecked(data["btn2"]);
        this.btn3.setChecked(data["btn3"]);
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
            console.log("requesting for updates!")
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
        this.socket.volatile.emit(WEB_SENDS_DATA_SERVER, this.variables.values());
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