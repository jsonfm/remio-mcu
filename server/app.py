"""A socketIO server."""
import socketio
from sanic import Sanic
from sanic.response import text
from server.routes import *


sio = socketio.AsyncServer(async_mode='sanic', cors_allowed_origins=[])
app = Sanic(name="server")
app.config['CORS_AUTOMATIC_OPTIONS'] = True
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
sio.attach(app)


@sio.on("connect")
async def connect(sid, environ):
    print("connected sid :", sid)


@sio.on("disconnect")
async def disconnect(environ):
    print("disconneted sid: ", environ)


@sio.on(WEB_JOINS_ROOM_SERVER)
async def web_joins_room(sid, room):
    print(f"web sid: {sid}, room: {room}")
    sio.enter_room(sid, room)
    await sio.emit(SERVER_REQUESTS_DATA_EXPERIMENT)


@sio.on(EXPERIMENT_JOINS_ROOM_SERVER)
async def experiment_joins_room(sid, room):
    sio.enter_room(sid, room)


@sio.on(EXPERIMENT_SENDS_DATA_SERVER)
async def callback(sid, data):
    print("Experiment: ", data)
    await sio.emit(SERVER_SENDS_DATA_WEB, data)


@sio.on(WEB_SENDS_DATA_SERVER)
async def server_receives_data(sid, data):
    print("Web: ", data)
    await sio.emit(SERVER_SENDS_DATA_EXPERIMENT, data)
    await sio.emit(SERVER_SENDS_DATA_WEB, data)


@sio.on(EXPERIMENT_NOTIFIES_DATA_WERE_RECEIVED_SERVER)
async def callback(sid):
    await sio.emit(SERVER_NOTIFIES_DATA_WERE_RECEIVED_WEB)


@sio.on(WEB_NOTIFIES_DATA_WERE_RECEIVED_SERVER)
async def callback(sid):
    await sio.emit(SERVER_NOTIFIES_DATA_WERE_RECEIVED_EXPERIMENT)


# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=3000)