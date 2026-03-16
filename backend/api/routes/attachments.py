from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import os
import shutil
from ...pipelines.attachment_pipeline import AttachmentPipeline

router = APIRouter(prefix="/attachments", tags=["attachments"])
pipeline = AttachmentPipeline()

@router.post("/scan")
async def scan_attachment(
    file: UploadFile = File(...),
    content_snippet: Optional[str] = Form(None)
):
    """
    Scans an attachment using the Agentic AI Pipeline.
    Works OFFLINE via local LLM reasoning and heuristic agents.
    """
    # Create a temporary directory for the file if needed
    # For hackathon demonstration, we'll just use the filename and a fake path
    # In production, we would stream this to a secure sandbox
    
    file_info = {
        "filename": file.filename,
        "content_snippet": content_snippet or f"Preview of {file.filename}...",
        "file_path": f"/tmp/sandbox/{file.filename}" 
    }
    
    try:
        result = await pipeline.run(file_info)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
