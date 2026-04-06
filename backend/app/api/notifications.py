from fastapi import APIRouter
from app.utils.storage import get_notifications, save_notifications

router = APIRouter()


@router.get("/")
async def list_notifications():
    return {"notifications": get_notifications()}


@router.patch("/{notification_id}/read")
async def mark_read(notification_id: str):
    notifications = get_notifications()
    for n in notifications:
        if n["id"] == notification_id:
            n["read"] = True
    save_notifications(notifications)
    return {"message": "Marked as read"}


@router.patch("/read-all")
async def mark_all_read():
    notifications = get_notifications()
    for n in notifications:
        n["read"] = True
    save_notifications(notifications)
    return {"message": "All marked as read"}


@router.get("/unread-count")
async def unread_count():
    notifications = get_notifications()
    return {"count": sum(1 for n in notifications if not n["read"])}
