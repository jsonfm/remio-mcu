"""Example experiment."""
from typing import Union
from remio import Mockup
from server.routes import *
from settings import (
    serverSettings,
    streamSettings,
    cameraSettings,
    serialSettings,
    config
)
from utils.mjpegfastapiserver import MJPEGAsyncServer
from utils.variables import Variables


EXPERIMENT_ROOM = config.get("SOCKETIO_SERVER_ROOM", "ROOM_X")


class CustomMockup(Mockup):
    """A class for manage a mockup without a local GUI."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.configureVariables()
        self.configureSerial()
        self.configureSocket()
        self.configureMJPEG()

    def configureSerial(self):
        """Configures serial on/emit events."""
        self.serial.on("data", self.serialDataIncoming)

    def configureSocket(self):
        """Configures socket on/emit events."""
        self.socket.on("connection", self.socketConnectionStatus)
        self.socket.on(SERVER_SENDS_DATA_EXPERIMENT, self.receiveVariables)
        self.socket.on(SERVER_NOTIFIES_DATA_WERE_RECEIVED_EXPERIMENT, self.variables.streamedSucessfully)
        self.socket.on(SERVER_REQUESTS_DATA_EXPERIMENT, lambda: self.streamVariables(lock=False))
        self.socket.on(SERVER_STREAMER_SET_PAUSE_EXPERIMENT, lambda pause: self.updateVideoPauseState(pause))


    def configureVariables(self):
        """Configures control variables."""
        self.variables = Variables({
            "play": False,
            "speed": 0.00,
            "direction": False,
        }, interval=3, supervise=self.superviseVariablesStreaming)

    def configureMJPEG(self):
        """Configures a MJPEG Server for streaming video."""
        self.mjpegserver = MJPEGAsyncServer(self.camera["webcam"], fps=12)
        self.mjpegserver.start()

    def serialDataIncoming(self, data: Union[str, dict]):
        """Reads incoming data from the serial device."""
        if isinstance(data, dict):
            message = data["arduino"]

        if isinstance(data, str):
            message = data

        if "$" in message:
            print("message: ", message)
        else:
            self.variables.update(message)
            self.variables.setUpdated(False)
            self.streamVariables()

    def socketConnectionStatus(self):
        """Shows the connection socket status."""
        if self.socket.isConnected(): 
            self.socket.emit(EXPERIMENT_JOINS_ROOM_SERVER, EXPERIMENT_ROOM)
        print("connection: ", self.socket.isConnected())

    def superviseVariablesStreaming(self):
        """"Checks the variables updated status and restores the backup if necessary."""
        self.variables.checkStreamingFail()
        self.variables.resetStreamingStatus()

    # Variables
    def receiveVariables(self, data: dict = {}):
        """Receives variables coming from the server."""
        print("received: ", data)
        self.variables.update(data)
        self.serial["arduino"].write(self.variables.json())
        
        # Say to the server the data were received (OK)
        self.socket.emit(EXPERIMENT_NOTIFIES_DATA_WERE_RECEIVED_SERVER)

    def streamVariables(self, lock: bool = True):
        """Streams variables to the web."""
        # Send changes to the server
        self.socket.emit(EXPERIMENT_SENDS_DATA_SERVER, self.variables.json())

        # Lock the GUI a wait for a response
        if lock:
            self.variablesTimer.resume(now=False) 

    def streamVariablesOK(self):
        """It's called when the server notifies variables were received correctly."""
        self.variables.setUpdated(True)
        self.variablesTimer.resume(now=True)


if __name__ == "__main__":
    experiment = CustomMockup(
        serverSettings=serverSettings,
        streamSettings=streamSettings,
        cameraSettings=cameraSettings,
        serialSettings=serialSettings,
    )
    experiment.start(
        camera=True, 
        serial=False, 
        socket=True, 
        streamer=False, 
        wait=True
    )