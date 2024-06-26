import os
from fastapi import FastAPI, Body, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel, BeforeValidator, Field
from bson import ObjectId  # Import ObjectId from bson
from typing import Annotated, List, Dict, Optional

PyObjectId = Annotated[str, BeforeValidator(str)]

class NodeSchema(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    # Add other fields here
    # For example:
    # description: str
    # created_at: datetime

app = FastAPI(
    title="Eigner Layer Metrics API",
    summary="An application to get metrics for operator AVS in Eigner Layer",
)

# Helper function to convert Pydantic model to dictionary
def to_mongo_dict(data: NodeSchema) -> dict:
    return data.dict()

# Helper function to convert MongoDB document to a dictionary
def mongo_dict(data: dict) -> dict:
    data['id'] = str(data['_id'])
    del data['_id']
    return data

# Endpoint to create a new Node document
@app.post("/nodes", response_model=NodeSchema)
async def create_node(node: NodeSchema = Body(...)):
    try:
        new_node = nodes_collection.insert_one(
            node.model_dump(by_alias=True, exclude=["id"])
        )

        inserted_node = nodes_collection.find_one(
            {"_id": new_node.inserted_id}
        )

        return inserted_node
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to get all Node documents
@app.get("/nodes", response_model=List[Dict[str, str]])
async def get_all_nodes():
    try:
        nodes = nodes_collection.find()
        nodes_list = [mongo_dict(node) for node in nodes]
        return nodes_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to get a Node document by ID
@app.get("/nodes/{node_id}", response_model=Dict[str, str])
async def get_node_by_id(node_id: str):
    try:
        node = nodes_collection.find_one({"_id": ObjectId(node_id)})
        if node:
            return mongo_dict(node)
        else:
            raise HTTPException(status_code=404, detail="Node not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to update a Node document by ID
@app.put("/nodes/{node_id}", response_model=Dict[str, str])
async def update_node(node_id: str, node: NodeSchema = Body(...)):
    node_data = to_mongo_dict(node)
    try:
        updated_node = nodes_collection.update_one(
            {"_id": ObjectId(node_id)}, {"$set": node_data}
        )
        if updated_node.matched_count == 0:
            raise HTTPException(status_code=404, detail="Node not found")
        return {"message": "Node updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to delete a Node document by ID
@app.delete("/nodes/{node_id}", response_model=Dict[str, str])
async def delete_node(node_id: str):
    try:
        delete_result = nodes_collection.delete_one({"_id": ObjectId(node_id)})
        if delete_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Node not found")
        return {"message": "Node deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
