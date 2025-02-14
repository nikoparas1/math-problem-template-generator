#!/usr/bin/env python3
from dotenv import load_dotenv
from PIL import Image
import io
from fastapi import File, HTTPException, UploadFile
import pytesseract

load_dotenv(dotenv_path=".env.local")

pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"


async def convert_file_to_text(file: UploadFile = File(None)):
    if file:
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            text = pytesseract.image_to_string(image)
            print(f"Problem Text: {text}")
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error processing image: {str(e)}"
            )

    if not text:
        raise HTTPException(status_code=400, detail="No problem text provided.")

    return text
