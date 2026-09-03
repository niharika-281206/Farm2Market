import socketio
from datetime import datetime

# Create a Socket.IO server
# cors_allowed_origins='*' for development
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_centre(sid, data):
    centre_id = data.get("centre_id")
    if centre_id:
        room = f"centre_{centre_id}"
        sio.enter_room(sid, room)
        print(f"Client {sid} joined room {room}")

@sio.event
async def join_farmer(sid, data):
    farmer_id = data.get("farmer_id")
    if farmer_id:
        room = f"farmer_{farmer_id}"
        sio.enter_room(sid, room)
        print(f"Client {sid} joined room {room}")

@sio.event
async def leave_centre(sid, data):
    centre_id = data.get("centre_id")
    if centre_id:
        room = f"centre_{centre_id}"
        sio.leave_room(sid, room)
        print(f"Client {sid} left room {room}")

async def broadcast_queue_update(centre_id: int):
    room = f"centre_{centre_id}"
    await sio.emit("queue:updated", {"centre_id": centre_id}, room=room)

async def broadcast_queue_event(centre_id: int, event_name: str, data: dict):
    room = f"centre_{centre_id}"
    await sio.emit(event_name, data, room=room)
    # Also emit a generic update to trigger refresh on legacy components
    await broadcast_queue_update(centre_id)

async def notify_farmer(farmer_id: int, message: str, event_type: str = "notification:new"):
    room = f"farmer_{farmer_id}"
    await sio.emit(event_type, {"message": message, "timestamp": datetime.utcnow().isoformat()}, room=room)
