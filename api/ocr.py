#!/usr/bin/env python3
from dotenv import load_dotenv
from PIL import Image
import os
from fastapi import File, HTTPException, UploadFile
import requests

load_dotenv(dotenv_path=".env.local")
print(os.getenv("OCR_SPACE_API_KEY"))


async def convert_file_to_text(file: UploadFile = File(None)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided.")
    try:
        contents = await file.read()
        payload = {
            "isOverlayRequired": False,
            "apikey": os.getenv("OCR_SPACE_API_KEY"),
            "language": "eng",
        }
        files = {"file": ("image.jpg", contents)}
        response = requests.post(
            "https://api.ocr.space/parse/image", data=payload, files=files
        )
        result = response.json()
        print(result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

    if result.get("IsErroredOnProcessing"):
        error_message = result.get("ErrorMessage") or "Unknown OCR error."
        raise HTTPException(
            status_code=400, detail=f"OCR processing error: {error_message}"
        )

    parsed_results = result.get("ParsedResults")
    if not parsed_results or len(parsed_results) == 0:
        raise HTTPException(status_code=400, detail="No text detected in the image.")

    text = parsed_results[0].get("ParsedText", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="No problem text provided.")

    return text
