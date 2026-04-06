from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class Language(str, Enum):
    en = "en"
    hi = "hi"
    pa = "pa"
    gu = "gu"


class UserProfile(BaseModel):
    name: str = ""
    age: str = ""
    occupation: str = ""
    state: str = ""
    income: str = ""
    category: str = ""
    documents: List[str] = []


class ChatRequest(BaseModel):
    message: str
    profile: Optional[UserProfile] = None
    language: Language = Language.en
    history: Optional[List[dict]] = []


class SchemeRequest(BaseModel):
    profile: UserProfile
    language: Language = Language.en


class Scheme(BaseModel):
    id: str
    title: str
    description: str
    eligibility: str
    benefits: str
    category: str


class Notification(BaseModel):
    id: str
    title: str
    body: str
    type: str  # scheme | reminder | alert
    timestamp: str
    read: bool = False


class VerifyRequest(BaseModel):
    doc_name: str
    scheme_title: str
    language: Language = Language.en
