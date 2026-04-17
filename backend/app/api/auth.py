import random
import time
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.models import SendOtpRequest, VerifyOtpRequest
from app.services import sms_service

router = APIRouter()

# WARNING: In-memory storage is for demo purposes only. It will be cleared on
# server restart. For production, use a database like Redis or PostgreSQL.
otp_storage = {}


@router.post("/send-otp")
async def send_otp(request: SendOtpRequest, background_tasks: BackgroundTasks):
    """Generates a 4-digit OTP, stores it, and sends it via SMS."""
    if not request.phone.startswith("+"):
        # Assuming Indian numbers if no country code is provided
        request.phone = f"+91{request.phone}"

    otp = str(random.randint(1000, 9999))
    otp_storage[request.phone] = {"otp": otp, "timestamp": time.time()}

    message = f"Your JanSaathi login OTP is: {otp}"

    # Send SMS in the background to not block the API response
    background_tasks.add_task(sms_service.send_sms, to_number=request.phone, body=message)

    print(f"Generated OTP {otp} for {request.phone}") # For debugging
    return {"success": True, "message": "OTP sent successfully."}


@router.post("/verify-otp")
async def verify_otp(request: VerifyOtpRequest):
    """Verifies the submitted OTP against the stored one."""
    if not request.phone.startswith("+"):
        request.phone = f"+91{request.phone}"

    stored_data = otp_storage.get(request.phone)

    if not stored_data:
        raise HTTPException(status_code=400, detail="OTP not found or expired. Please try again.")

    # OTP is valid for 5 minutes (300 seconds)
    if time.time() - stored_data["timestamp"] > 300:
        del otp_storage[request.phone]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if stored_data["otp"] == request.otp:
        del otp_storage[request.phone]  # OTP is single-use
        return {"success": True, "message": "Login successful."}
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP.")