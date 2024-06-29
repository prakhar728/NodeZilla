import asyncio
import json
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Body, HTTPException, WebSocket, WebSocketDisconnect
from pymongo import MongoClient
from pydantic import BaseModel, BeforeValidator, Field
from bson import ObjectId, Timestamp  
from typing import Annotated, List, Dict, Optional
import datetime

import DB

PyObjectId = Annotated[str, BeforeValidator(str)]


class historic_data(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    timestamp: datetime.datetime
    address: str
    value: object
    

class NodeData(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    description: str
    logo: str
    operator_contract_address: str
    operator_name: str
    twitter: Optional[str] = Field(default='')
    website: Optional[str] = Field(default='')
    status: Optional[str] = Field(default='')
    time_series: List[historic_data]


class MetaData(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    description: str
    logo: str
    operator_contract_address: str
    operator_name: str
    twitter: Optional[str] = Field(default='')
    website: Optional[str] = Field(default='')
    status: Optional[str] = Field(default='')


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, Timestamp):
            return datetime.datetime.fromtimestamp(obj.time)
        if isinstance(obj, datetime.datetime):
            return obj.isoformat() 
        return super(JSONEncoder, self).default(obj)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: object):
        try:
            for conn in self.active_connections:
                print(type(message))
                await conn.send_text("Sending message")
                await conn.send_json(message)
                print("Sent data")
        except Exception as e:
            print("Error while broadcasting", e)


manager = ConnectionManager()


async def watch_collection(address: str):
    collection = DB.get_db_for_tsdb(address)

    change_stream = collection.watch()
    try:
        for change in change_stream:

            if change:
                # Convert change document to JSON-compatible format
                serialized_change = json.loads(JSONEncoder().encode(change))

                # Broadcast the change to all connected clients
                await manager.broadcast(serialized_change['fullDocument'])
    except Exception as e:
        print(f"Error watching collection: {e}")


app = FastAPI(
    title="Eigner Layer Metrics API",
    summary="An application to get info about AVS Operator Nodes",
)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def mongo_dict(data: dict) -> dict:
    data['id'] = str(data['_id'])
    del data['_id']
    return data


# Endpoint to get a All Nodes and metadata
@app.get("/all", response_model=List[MetaData])
async def get_all_nodes():
    try:
        metadata = list(DB.nodes_collection.find())

        if metadata:
            return metadata
        else:
            raise HTTPException(status_code=404, detail="Operator not found!")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# Endpoint to get a Node document by ID
@app.get("/operators/{address}/", response_model=NodeData)
async def get_node_by_id(address: str):
    try:
        metadata = DB.nodes_collection.find_one({"operator_contract_address": address})

        operator_collection = DB.get_db_for_tsdb(address)

        historical_data = operator_collection.find()

        response = {
            **metadata,
            'time_series' : historical_data
        }

        if metadata:
            return mongo_dict(response)
        else:
            raise HTTPException(status_code=404, detail="Operator not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    while True:
        try:
            address = await websocket.receive_text()

            operator_collection = DB.get_db_for_tsdb(address)

            historical_data = list(operator_collection.find())

            data = json.loads(JSONEncoder().encode(historical_data))
            
            await manager.broadcast(data)

            watch_task = asyncio.create_task(watch_collection(address))

        except WebSocketDisconnect:
            manager.disconnect(websocket)
            watch_task.cancel()
        except Exception as e:
            print(e)
            await websocket.close()
            watch_task.cancel()
            break



