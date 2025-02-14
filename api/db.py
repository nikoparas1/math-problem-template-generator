#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import certifi

load_dotenv(dotenv_path=".env.local")

# Configure MongoDB (ensure you set your connection string in the environment)
MONGODB_USER = os.getenv("MONGODB_USER")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
MONGODB_CLUSTER = os.getenv("MONGODB_CLUSTER")
uri = f"mongodb+srv://{MONGODB_USER}:{MONGODB_PASSWORD}@{MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(
    uri, tls=True, tlsCAFile=certifi.where(), server_api=ServerApi("1")
)
db = client["math_templates_db"]
templates_collection = db["templates"]

try:
    client.admin.command("ping")
    print("Pinged your deployment. Successfully connected")
except Exception as e:
    print(e)
