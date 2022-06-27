"""A socketIO server."""
import socketio
from sanic import Sanic
from sanic.response import text
from server.routes import *


sio = socketio.AsyncServer(async_mode='sanic')
app = Sanic(name="server")
sio.attach(app)


@app.get("/")
async def hello_world(request):
    return text("Hello, world.")


@sio.on("connect")
async def connect(sid, environ):
    print("connect sid :", sid)


@sio.on("disconnect")
async def disconnect(environ):
    print("disconnet sid: ", environ)


@sio.on(EXPERIMENT_SENDS_DATA_SERVER)
async def callback(sid, data):
    print("data experiment: ", data)


@sio.on(SERVER_SENDS_DATA_EXPERIMENT)
async def callback(sid, data):
    print("data server: ", data)


# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=3000)