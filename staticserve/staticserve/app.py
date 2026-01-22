import os

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Where the built React app lives
folder_location = os.environ.get("STATICSERVE_DIST", "/app/dist")

if not os.path.isdir(folder_location):
    os.makedirs(folder_location, exist_ok=True)

# Static React app (must be mounted *after* defining /lead so /lead hits the route above)
app.mount("/", StaticFiles(directory=folder_location, html=True), name="static")
