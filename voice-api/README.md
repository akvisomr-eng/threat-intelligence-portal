# AURA Voice API

Zero-cost infrastructure layer for AURA Indonesian speech.

- Runtime: Node.js
- Hosting target: Render Free Web Service
- Locale: id-ID
- Default voice: id-ID-Standard-A
- Provider: Google Cloud Text-to-Speech
- Browser and Android clients never receive the provider key.

Set the Render secret GOOGLE_TTS_API_KEY only when Google Cloud TTS is enabled.
The service includes a conservative character guard via MAX_TTS_CHARS.

Endpoints:
- GET /health
- POST /tts with JSON body containing text and optional voice.
