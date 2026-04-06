"""
JanSaathi Notification Scheduler
Defines notification schedule rules for government scheme reminders
"""
from dataclasses import dataclass
from typing import Literal
from datetime import datetime


@dataclass
class ScheduleRule:
    id: str
    title: str
    body: str
    type: Literal["scheme", "reminder", "alert"]
    # Hardcoded demo schedule (month, day) or None for one-time
    trigger_month: int | None = None
    trigger_day: int | None = None
    recurring: bool = False


# Demo hardcoded schedule for hackathon
SCHEDULE = [
    ScheduleRule(
        id="pmkisan_q1",
        title="PM-Kisan Q1 Installment",
        body="First installment of PM-Kisan Samman Nidhi will be released this month.",
        type="scheme",
        trigger_month=4,  # April
        trigger_day=1,
        recurring=True,
    ),
    ScheduleRule(
        id="pmkisan_q2",
        title="PM-Kisan Q2 Installment",
        body="Second installment of PM-Kisan Samman Nidhi will be released this month.",
        type="scheme",
        trigger_month=8,  # August
        trigger_day=1,
        recurring=True,
    ),
    ScheduleRule(
        id="pmkisan_q3",
        title="PM-Kisan Q3 Installment",
        body="Third installment of PM-Kisan Samman Nidhi will be released this month.",
        type="scheme",
        trigger_month=12,  # December
        trigger_day=1,
        recurring=True,
    ),
    ScheduleRule(
        id="scholarship_deadline",
        title="Scholarship Application Deadline",
        body="Post-Matric Scholarship applications close on March 31. Apply before deadline!",
        type="reminder",
        trigger_month=3,  # March
        trigger_day=15,
        recurring=True,
    ),
    ScheduleRule(
        id="ration_update",
        title="Monthly Ration Card Reminder",
        body="Update your ration card family details if there have been any changes.",
        type="reminder",
        trigger_month=None,
        trigger_day=1,  # 1st of every month
        recurring=True,
    ),
]


def get_due_notifications(now: datetime | None = None) -> list[ScheduleRule]:
    """Returns rules that should fire today"""
    if now is None:
        now = datetime.now()
    
    due = []
    for rule in SCHEDULE:
        if rule.trigger_day and now.day == rule.trigger_day:
            if rule.trigger_month is None or now.month == rule.trigger_month:
                due.append(rule)
    return due


if __name__ == "__main__":
    # Test: show what's due today
    due = get_due_notifications()
    print(f"Due today ({datetime.now().strftime('%B %d')}): {len(due)} notification(s)")
    for rule in due:
        print(f"  - [{rule.type.upper()}] {rule.title}")
