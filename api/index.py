#!/usr/bin/env python3
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.ocr import convert_file_to_text
from api.llm import generate_template, TemplateData
from api.db import templates_collection as collection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


@app.post("/api/py/process-problem")
async def process_problem(
    problem_text: str = Form(None), file: UploadFile = File(None)
):
    if file:
        problem_text = await convert_file_to_text(file)

    try:
        template = generate_template(problem_text)
        return {"template": template}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating template: {str(e)}"
        )


@app.post("/api/py/save-template")
async def save_template(template_data: TemplateData):
    result = collection.insert_one(template_data.model_dump())
    print(result)
    if result.inserted_id:
        return {"message": "Template saved successfully."}
    else:
        raise HTTPException(status_code=500, detail="Failed to save template.")
