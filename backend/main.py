import base64
import json
import os
import re
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title = "Menu Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_api_key = os.environ.get("GROQ_API_KEY")
groq_model = os.environ.get("GROQ_MODEL", "qwen/qwen3.6-27b")
client = Groq(api_key=groq_api_key) if groq_api_key else None

@app.get("/")
def health():
    return {"status": "V1.0.0"}

@app.post("/generate-recipe")
async def generate_recipe(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    if client is None:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured. Add it to backend/.env and restart the backend server.",
        )

    contents = await file.read()
    b64_image = base64.b64encode(contents).decode("utf-8")

    try:
        response = client.chat.completions.create(
            model=groq_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{file.content_type};base64,{b64_image}"
                            },
                        },
                        {
                            "type": "text",
                             "text": (
                                "Identify the food in the image and generate a likely recipe. "
                                "Return ONLY valid JSON with exactly this structure: "
                                '{"dish":"string","ingredients":["string"],"steps":["string"]}. '
                                "Do not include explanation, markdown, or code fences."
                            ),
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"},
            reasoning_format="hidden",
            reasoning_effort="none",
            temperature=0.7,
            top_p=0.8,
            max_tokens=1024,
        )
        extracted = response.choices[0].message.content
        print("RAW MODEL OUTPUT:", extracted)

        # Try to find JSON object inside the response
        match = re.search(r"\{.*\}", extracted, re.DOTALL)
        if not match:
            raise HTTPException(status_code=500, detail="No JSON found in model output.")

        json_text = match.group(0)
        parsed = json.loads(json_text)

        return {
            "dish": parsed.get("dish", ""),
            "ingredients": parsed.get("ingredients", []),
            "steps": parsed.get("steps", []),
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Recipe generation failed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Recipe generation failed: {e}")
