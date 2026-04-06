"""
Local JSON-based data store - no database needed
"""
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)


def _read_file(filename: str) -> Any:
    path = DATA_DIR / filename
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_file(filename: str, data: Any) -> None:
    path = DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_profile(user_id: str = "default") -> Optional[Dict]:
    data = _read_file("profiles.json") or {}
    return data.get(user_id)


def save_profile(profile: Dict, user_id: str = "default") -> None:
    data = _read_file("profiles.json") or {}
    data[user_id] = profile
    _write_file("profiles.json", data)


def get_notifications() -> list:
    data = _read_file("notifications.json")
    if data is None:
        # Seed with demo notifications
        demo = [
            {"id": "n1", "title": "PM-Kisan Installment Released!", "body": "The 16th installment has been released.", "type": "scheme", "timestamp": "2 hours ago", "read": False},
            {"id": "n2", "title": "New Scholarship for Students", "body": "Post-Matric scholarship applications open for 2024-25.", "type": "reminder", "timestamp": "1 day ago", "read": False},
            {"id": "n3", "title": "Ayushman Card Drive", "body": "Free Ayushman Bharat card registration camp this weekend.", "type": "alert", "timestamp": "2 days ago", "read": True},
        ]
        _write_file("notifications.json", demo)
        return demo
    return data


def save_notifications(notifications: list) -> None:
    _write_file("notifications.json", notifications)


def get_chat_history(user_id: str = "default") -> list:
    data = _read_file("chat_history.json") or {}
    return data.get(user_id, [])


def save_chat_history(history: list, user_id: str = "default") -> None:
    data = _read_file("chat_history.json") or {}
    data[user_id] = history[-50:]  # keep last 50
    _write_file("chat_history.json", data)
