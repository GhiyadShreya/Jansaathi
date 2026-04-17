import os
import httpx

FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY")


async def send_sms(to_number: str, body: str) -> bool:
    """
    Sends an SMS using Fast2SMS (Great for Indian phone numbers).
    Returns True on success, False on failure.
    """
    if not FAST2SMS_API_KEY:
        print("Fast2SMS API key is not configured. Cannot send SMS.")
        return False

    # Fast2SMS prefers 10-digit Indian numbers without the +91 country code
    if to_number.startswith("+91"):
        to_number = to_number[3:]

    try:
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "message": body,
            "language": "english",
            "route": "q",
            "numbers": to_number
        }
        headers = {
            "authorization": FAST2SMS_API_KEY
        }
        
        # Use an async client and POST method, as required by Fast2SMS bulkV2 API
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json().get("return", False)
    except Exception as e:
        print(f"Fast2SMS SMS failed: {e}")
        return False