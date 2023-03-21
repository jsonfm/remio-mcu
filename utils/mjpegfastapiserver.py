import asyncio
from threading import Thread
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from remio import Camera
import uvicorn


class MJPEGAsyncServer:
    """A MJPEG async server made with FastAPI."""

    def __init__(
        self,
        camera=None,
        fps: int = 12,
        ip: str = "0.0.0.0",
        port: int = 8080,
        endpoint: str = "/",
        *args,
        **kwargs
    ):
        self.camera = camera
        self.ip = ip
        self.port = port
        self.fps = fps
        self.endpoint = endpoint
        self.server: FastAPI = FastAPI()
        self.server.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
        self.server.add_route(self.endpoint, self.streaming_route)
        self.thread: Thread = Thread(target=self.run, daemon=True)
        self.loop = None

    def start(self):
        """Starts server loop on a separated thread."""
        self.thread.start()

    def stop(self):
        """Stops server"""
        self.thread.join(1)

    async def camera_read(self):
        """Camera read loop."""
        while True:
            yield self.camera.jpeg(quality=30, colorspace="bgr")
            await asyncio.sleep(1 / self.fps)

    async def streaming(self, *args, **kwargs):
        """Streaming loop."""
        async for frame in self.camera_read():
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + frame
                + b"\r\n"
            )

    async def streaming_route(self, *args, **kwargs):
        """Route for view the streaming."""
        return StreamingResponse(
            self.streaming(),
            headers={"Content-Type": "multipart/x-mixed-replace; boundary=frame"},
        )

    def run(self):
        """Executes the server loop."""
        uvicorn.run(self.server, host=self.ip, port=self.port, access_log=True)


if __name__ == "__main__":
    camera = Camera(src=0, size=[800, 600], flipX=True).loadDevice()
    server = MJPEGAsyncServer(camera, fps=12, port=8081)
    server.run()
