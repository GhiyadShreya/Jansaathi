"""
JanSaathi Notification Engine
Scheduled alerts for scheme deadlines, installments, and reminders
"""
import json
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "backend" / "data"
DATA_DIR.mkdir(exist_ok=True)

# Hardcoded demo scheduled notifications
SCHEDULED_NOTIFICATIONS = [
    {
        "id": "sched_pmkisan_16",
        "title": "PM-Kisan 16th Installment",
        "body": "The 16th installment of PM-Kisan Samman Nidhi has been released. Check your linked bank account.",
        "type": "scheme",
        "trigger": "immediate",
        "read": False,
    },
    {
        "id": "sched_scholarship_2025",
        "title": "Scholarship Deadline Reminder",
        "body": "Post-Matric Scholarship 2024-25 applications close on March 31. Apply now!",
        "type": "reminder",
        "trigger": "immediate",
        "read": False,
    },
    {
        "id": "sched_ayushman_camp",
        "title": "Ayushman Card Registration Camp",
        "body": "Free Ayushman Bharat registration camp near you this weekend. Bring your Aadhaar card.",
        "type": "alert",
        "trigger": "immediate",
        "read": False,
    },
    {
        "id": "sched_ration_update",
        "title": "Ration Card Update Required",
        "body": "Update your ration card family details before end of month to avoid disruption in supply.",
        "type": "reminder",
        "trigger": "immediate",
        "read": False,
    },
    {
        "id": "sched_ujjwala_refill",
        "title": "Ujjwala Yojana Subsidy Active",
        "body": "LPG subsidy under PM Ujjwala Yojana is active for this quarter. Book your cylinder now.",
        "type": "scheme",
        "trigger": "weekly",
        "read": False,
    },
]


def load_notifications() -> list:
    path = DATA_DIR / "notifications.json"
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return []


def save_notifications(notifications: list):
    path = DATA_DIR / "notifications.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(notifications, f, ensure_ascii=False, indent=2)


def push_notification(notification: dict):
    """Add a new notification to the store"""
    existing = load_notifications()
    ids = {n["id"] for n in existing}
    
    if notification["id"] not in ids:
        notification["timestamp"] = "Just now"
        existing.insert(0, notification)  # newest first
        save_notifications(existing)
        logger.info(f"Pushed notification: {notification['title']}")
    else:
        logger.debug(f"Notification already exists: {notification['id']}")


def seed_demo_notifications():
    """Seed initial demo notifications on first run"""
    existing = load_notifications()
    if not existing:
        logger.info("Seeding demo notifications...")
        demo = [
            {**n, "timestamp": f"{i+1} day{'s' if i > 0 else ''} ago"}
            for i, n in enumerate(SCHEDULED_NOTIFICATIONS[:4])
        ]
        save_notifications(demo)
        logger.info(f"Seeded {len(demo)} notifications")


def run_scheduler():
    """Main scheduler loop"""
    logger.info("🔔 JanSaathi Notification Engine started")
    seed_demo_notifications()
    
    last_weekly = datetime.now()
    
    while True:
        now = datetime.now()
        
        # Weekly notifications
        if now - last_weekly > timedelta(days=7):
            for n in SCHEDULED_NOTIFICATIONS:
                if n.get("trigger") == "weekly":
                    push_notification({**n, "id": f"{n['id']}_{now.strftime('%Y%W')}"})
            last_weekly = now
        
        logger.info(f"⏰ Scheduler heartbeat: {now.strftime('%Y-%m-%d %H:%M')}")
        time.sleep(3600)  # check every hour


if __name__ == "__main__":
    run_scheduler()
