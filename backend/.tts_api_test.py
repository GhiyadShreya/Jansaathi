import os
from pathlib import Path
from dotenv import load_dotenv
import asyncio
import httpx

load_dotenv(Path('.').resolve() / '.env')
print('cwd', Path('.').resolve())
print('Speakatoo base URL', os.getenv('SPEAKATOO_BASE_URL', 'https://www.speakatoo.com'))
print('SPEAKATOO_API_KEY loaded', bool(os.getenv('SPEAKATOO_API_KEY')))
print('VOICE ID en', os.getenv('SPEAKATOO_VOICE_ID_EN'))
print('VOICE ID hi', os.getenv('SPEAKATOO_VOICE_ID_HI'))
url = os.getenv('SPEAKATOO_BASE_URL', 'https://www.speakatoo.com') + '/api/v1/voiceapi'
payload = {
    'username': os.getenv('SPEAKATOO_USERNAME'),
    'password': os.getenv('SPEAKATOO_PASSWORD'),
    'tts_title': 'test',
    'ssml_mode': '0',
    'tts_engine': os.getenv('SPEAKATOO_ENGINE', 'neural'),
    'tts_format': os.getenv('SPEAKATOO_TTS_FORMAT', 'mp3').lower(),
    'tts_text': 'Hello from JanSaathi test.',
    'tts_resource_ids': os.getenv('SPEAKATOO_VOICE_ID_EN'),
    'synthesize_type': os.getenv('SPEAKATOO_SYNTHESIZE_TYPE', 'save'),
}
headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': os.getenv('SPEAKATOO_API_KEY'),
}

async def main():
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        resp = await client.post(url, json=payload, headers=headers)
        print('status', resp.status_code)
        print('content-type', resp.headers.get('content-type'))
        try:
            print('json:', resp.json())
        except Exception:
            print('text:', resp.text[:1000])

asyncio.run(main())
