from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()

# Replace with your actual MongoDB connection string
mongo_connection_string = os.getenv("MONGO_URI")

# Create a MongoDB client
client = MongoClient(mongo_connection_string)
# Get the database object
db = client["NodeZilla"]  # Replace with your database name
# Get the Nodes collection
nodes_collection = db["nodes"]


def get_db_for_tsdb(address):
    collection_name = "time_series_node" + address

    if collection_name not in db.list_collection_names():
        # Create a time series collection if it doesn't exist
        db.create_collection(
            collection_name,
            timeseries={
                "timeField": "timestamp",  # Required field
                "metaField": "address",   # Optional field
                "granularity": "seconds"   # Optional, could be 'seconds', 'minutes', or 'hours'
            }
        )
    
    return db[collection_name]