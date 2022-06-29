"""Some useful timers."""
from typing import Union, Callable
from threading import Thread, Event
import time


class PausableTimer:
    """A timer that executes a recurring task each certain time, using thread events for it.
    Args:
        interval: wait time in seconds.
        callback: a function that will be called.
    """
    def __init__(self, interval: Union[int, float], callback: Callable = None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.interval = interval
        self.timeout = interval
        self.callback = callback
        self.args = args
        self.kwargs = kwargs
        self.running = Event()
        self.pauseEvent = Event()
        self.thread = Thread(target=self.run, daemon=True)
        self.start()
        self.pause()
        self.quit = False

    def start(self):
        """Starts timer execution."""
        self.thread.start()

    def run(self):
        """Excutes the recurrent task."""
        while True:
            self.pauseEvent.wait()
            self.running.wait(self.timeout)
            self.callback(*self.args, **self.kwargs)
            if self.quit:
                break

    def resume(self, now: bool = True):
        """Resumes the task execution."""
        self.pauseEvent.set()
        if now:
            self.running.set()

    def pause(self, reset: bool = False):
        """Pauses the task execution.
        Args:
            reset: restart the loop execution?
        """
        self.pauseEvent.clear()
        if reset:
            self.running.clear()

    def stop(self):
        """Stops the timer execution."""
        self.resume(now=True)
        self.quit = True


class CountTimer:
    """A timer tha executes a task periodically.
    Args:
        cb: a callback function.
        interval: time in seconds.
    """
    def __init__(self, cb, interval: int = 1):
        self.lastTime = 0
        self.enabled = False
        self.cb = cb
        self.interval = interval
    
    def start(self):
        """Starts the timer."""
        self.lastTime = time.time()
        self.enabled = True
    
    def stop(self):
        """Stops the timer."""
        self.lastTime = 0
        self.time = 0
        self.enabled = False

    def update(self):
        """Checks if the callback must be executed."""
        if self.enabled:
            if time.time() - self.lastTime <= self.interval:
                self.cb()
                self.lastTime = time.time()