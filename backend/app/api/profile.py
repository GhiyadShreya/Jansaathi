from fastapi import APIRouter
from app.models.models import UserProfile
from app.utils.storage import get_profile, save_profile

router = APIRouter()


@router.get("/")
async def fetch_profile(user_id: str = "default"):
    profile = get_profile(user_id)
    if not profile:
        return {"profile": None}
    return {"profile": profile}


@router.post("/")
async def upsert_profile(profile: UserProfile, user_id: str = "default"):
    save_profile(profile.model_dump(), user_id)
    return {"message": "Profile saved", "profile": profile}
