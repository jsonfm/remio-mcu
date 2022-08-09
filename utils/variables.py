from typing import Union, Callable
import json
from .timers import PausableTimer


class Variables:
    """A variables dictionary with some extra functionalities, like state backup and supervise intervaled callback.
    
    Args:
        variables: a dictionary with variables.
        enabled: flag to enable or disable variables control.
        interval: max wait time in seconds for a response.
        supervise: a callback to be executed after wait time passes.

    Example:
        variables = Variable({
            'var1': 1, # type: int
            'var2': 3.14 # type: float
            'var3': 'active' # type: str
            'var4': False, # type: bool
        })
    """
    def __init__(
        self, 
        variables: dict = {}, 
        enabled: bool = True,
        interval: Union[float, int] = 2,
        supervise: Callable = None,
    ):
        self.variables = variables
        self.backup = variables.copy()
        self.enabled = enabled
        self.streamingStatus = False
        self.timer = PausableTimer(interval, supervise)

    def __len__(self):
        return len(self.variables)

    def __str__(self):
        return str(self.variables)
    
    def __getitem__(self, key):
        return self.variables[key]
    
    def __setitem__(self, key: str, value):
        self.variables[key] = value
    
    def isEnabled(self):
        """Checks if variables workflow is enabled."""
        return self.enabled

    def setEnabled(self, value: bool = True):
        """Updates the enable status"""
        self.enabled = value

    def restore(self):
        """Restores the variables backup."""
        self.variables = self.backup.copy()

    def set(self, key: str, value, backup: bool = True, streamingStatus: bool = False):
        """Updates a variable value"""
        if backup:
            self.backup = self.variables.copy()
        self.variables[key] = value
        self.setStreamingStatus(streamingStatus)
    
    def get(self, key: str):
        """Returns a specific variable value."""
        return self.variables[key]

    def values(self):
        """Get the variables values on dict format."""
        return self.variables

    def json(self):
        """Returns the variables dict as JSON string."""
        return json.dumps(self.variables)

    def update(self, data: Union[str, dict] = {}):
        """Updates the variables values."""
        if isinstance(data, str):
            data = json.loads(data)
        self.variables = data
        self.backup = dict(self.variables)

    def streamed(self):
        """Returns the current streaming status."""
        return self.streamingStatus

    def setStreamingStatus(self, value: bool = True):
        """Updates the streaming status."""
        self.streamingStatus = value

    def streamedSucessfully(self):
        """Should be called when variables streaming were successfully."""
        self.setStreamingStatus(True)
        self.timer.resume(now=True)

    def waitResponse(self):
        """Starts the supervise loop (timer)."""
        self.timer.resume(now=False)

    def checkStreamingFail(self):
        """If variables were not streamed restores the variables backup."""
        if not self.streamed():
            self.restore()

    def resetStreamingStatus(self):
        """Restores streaming status and pauses the check timer."""
        self.setStreamingStatus(False)
        self.timer.pause(reset=True)
    
    def stop(self):
        """Stops the check timer."""
        self.timer.stop()
