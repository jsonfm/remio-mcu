"""Example experiment."""
from remio import Mockup
from server.routes import *
from settings import (
    serverSettings,
    streamSettings,
    cameraSettings,
    serialSettings,
)
from utils.variables import Variables


MOCKUP_ROOM = "room-x"


class CustomMockup(Mockup):
    """A class for manage a mockup without a local GUI."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.configureSerial()
        self.configureSocket()
        self.configureTimers()
        self.configureVariables()

    def configureSerial(self):
        """Configures serial on/emit events."""
        self.serial.on("data", self.serialDataIncoming)

    def configureSocket(self):
        """Configures socket on/emit events."""
        self.socket.on("connection", self.socketConnectionStatus)
        self.socket.on(EXPERIMENT_SENDS_DATA_SERVER, self.receiveVariables)
        self.socket.on(EXPERIMENT_NOTIFIES_DATA_WERE_RECEIVED_SERVER, self.variables.streamedSucessfully)
        self.socket.on(SERVER_REQUESTS_DATA_EXPERIMENT, lambda: self.streamVariables(lock=False))

    def configureVariables(self):
        """Configures control variables."""
        self.variables = Variables({
            "btn1": False,
            "btn2": False,
            "btn3": False,
        }, interval=3, supervise=self.superviseVariablesStreaming)

    def serialDataIncoming(self, data: str):
        """Reads incoming data from the serial device."""
        message = data["arduino"]
        if "$" in message:
            print("message: ", message)
        else:
            self.variables.update(message)
            self.variables.setUpdated(False)
            self.streamVariables()

    def socketConnectionStatus(self):
        """Shows the connection socket status."""
        if self.socket.isConnected(): 
            self.socket.emit(EXPERIMENT_JOINS_ROOM_SERVER, MOCKUP_ROOM)

    def superviseVariablesStreaming(self):
        """"Checks the variables updated status and restores the backup if necessary."""
        self.variables.checkStreamingFail()
        self.variables.resetStreamingStatus()

    # Variables
    def receiveVariables(self, data: dict = {}):
        """Receives variables coming from the server."""
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
        serial=True, 
        socket=True, 
        streamer=True, 
        wait=True
    )