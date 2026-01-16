from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from fastapi.middleware.cors import CORSMiddleware
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import logging
import os
from groq import Groq
import tempfile
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Nashik Kumbh Mela 2027 AI Assistant",
    description="Multilingual AI assistant for Nashik Kumbh Mela 2027 with voice support (7 languages)",
    version="2.2.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expanded language support - 7 languages
LANGUAGE_MAP = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "mr": "Marathi (मराठी)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાતી)"
}

# Request body with validation
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User message in any supported language")
    enable_tts: bool = Field(default=False, description="Enable text-to-speech in response")
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

# Response model
class ChatResponse(BaseModel):
    reply: str
    detected_language: str
    status: str = "success"
    audio_url: str | None = None  # URL to get audio if TTS was enabled

# AI Model configuration
try:
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=500
    )
    
    # Initialize Groq client for Whisper API and TTS
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
except Exception as e:
    logger.error(f"Failed to initialize LLM: {e}")
    raise

# Enhanced multilingual prompt with 7 languages
prompt = ChatPromptTemplate.from_messages([
    ("system", """
You are the official Nashik Kumbh Mela 2027 AI Assistant, helping pilgrims and visitors with information about the sacred gathering in Nashik, Maharashtra. Answer strictly about Nashik Kumbh Mela 2027 only.

CONTEXT - NASHIK KUMBH MELA 2027:
- Location: Nashik and Trimbakeshwar, Maharashtra, India
- Year: 2027 (exact dates to be announced)
- Sacred Rivers: Godavari River (also called Gautami Ganga)
- Main Ghats: Ramkund, Panchavati, Tapovan, Gangapur
- Historical Significance: One of four sites where drops of Amrit (nectar of immortality) fell
- Previous Nashik Kumbh: 2015 (held every 12 years)
- Expected Attendance: Several crore (tens of millions) of devotees
- Key Rituals: Shahi Snan (Royal Bath), various religious processions by Akharas
- Important Places: Kalaram Temple, Trimbakeshwar Temple, Sita Gufa, Panchavati

CRITICAL LANGUAGE RULES - 7 LANGUAGES SUPPORTED:
1. **Auto-detect the language** of the user's message (English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, or Romanized versions)
2. **Reply in the EXACT SAME language** as the user's question
3. Language Detection Guide:
   - English: "What", "Where", "When", "How"
   - Hindi (हिंदी): "क्या", "कहाँ", "कब", "कैसे" OR Romanized: "kya", "kahan", "kab", "kaise"
   - Marathi (मराठी): "काय", "कुठे", "केव्हा", "कसे" OR Romanized: "kay", "kuthe", "kevha", "kase"
   - Tamil (தமிழ்): "என்ன", "எங்கே", "எப்போது", "எப்படி" OR Romanized: "enna", "enge", "eppothu", "eppadi"
   - Telugu (తెలుగు): "ఏమి", "ఎక్కడ", "ఎప్పుడు", "ఎలా" OR Romanized: "emi", "ekkada", "eppudu", "ela"
   - Bengali (বাংলা): "কি", "কোথায়", "কখন", "কিভাবে" OR Romanized: "ki", "kothay", "kokhon", "kibhabe"
   - Gujarati (ગુજરાતી): "શું", "ક્યાં", "ક્યારે", "કેવી રીતે" OR Romanized: "shu", "kya", "kyare", "kevi rite"

4. **If user asks in Romanized script** (Hindi/regional words in English), **reply in proper Devanagari/native script**
5. NEVER mix languages in your response - maintain language purity

ROMANIZED LANGUAGE DETECTION:
- Hindi indicators: "kya", "hai", "kahan", "kaise", "mela", "snan", "darshan", "prasad", "puja"
- Marathi indicators: "kuthe", "kasa", "aahe", "kay", "kuthun"
- Tamil indicators: "enna", "eppadi", "enge", "eppothu"
- Telugu indicators: "emi", "ela", "ekkada", "eppudu"
- Bengali indicators: "ki", "kibhabe", "kothay", "kokhon"
- Gujarati indicators: "shu", "kyare", "kem", "kevi rite"

RESPONSE GUIDELINES:
- **FOCUS ON NASHIK KUMBH MELA 2027** - All information specific to Nashik only
- Keep answers concise (2-4 sentences max)
- Mention Nashik/Trimbakeshwar locations, Godavari River
- For 2027-specific dates not announced, say "dates will be announced closer to 2027"
- Provide practical information about Nashik city
- For emergencies: "Call 112 for emergency services" in user's language

EMERGENCY PHRASES IN ALL LANGUAGES:
- English: "Call 112 for emergency services"
- Hindi: "आपातकालीन सेवाओं के लिए 112 पर कॉल करें"
- Marathi: "आणीबाणी सेवांसाठी 112 वर कॉल करा"
- Tamil: "அவசர சேவைகளுக்கு 112 அழைக்கவும்"
- Telugu: "అత్యవసర సేవల కోసం 112కు కాల్ చేయండి"
- Bengali: "জরুরি পরিষেবার জন্য 112 কল করুন"
- Gujarati: "કટોકટી સેવાઓ માટે 112 પર કૉલ કરો"

TOPICS YOU CAN HELP WITH:
- Event schedules and Shahi Snan dates (कार्यक्रम / కార్యక్రమాలు / অনুষ্ঠান / நிகழ்ச்சிகள்)
- Nashik locations: Ramkund, Panchavati, Trimbakeshwar
- Accommodation in Nashik (आवास / వసతి / বাসস্থান / தங்குமிடம்)
- Religious significance of Godavari
- Safety guidelines (सुरक्षा / భద్రత / নিরাপত্তা / பாதுகாப்பு)
- Transportation to Nashik (परिवहन / రవాణా / পরিবহন / போக்குவரத்து)
- Important temples: Kalaram, Trimbakeshwar (मंदिर / గుడి / মন্দির / கோயில்)
- Godavari River ghats and bathing areas (घाट / ఘాట్ / ঘাট / கட்)

WHAT TO AVOID:
- Don't confuse with other Kumbh locations (Prayagraj, Haridwar, Ujjain)
- Never provide medical advice
- Don't make up specific dates/times for 2027
- Stay focused on Nashik Kumbh Mela queries only

IMPORTANT: Always specify this is about **Nashik Kumbh Mela 2027** in Maharashtra, on the banks of Godavari River.

Remember: Detect the user's language accurately (including Romanized) and respond in proper native script.
"""),
    ("human", "{user_input}")
])

# Enhanced language detection for 7 languages
detect_prompt = ChatPromptTemplate.from_messages([
    ("system", """Detect the language of the following text. Reply with ONLY one word from these options:
english, hindi, marathi, tamil, telugu, bengali, gujarati

LANGUAGE INDICATORS:

ENGLISH:
- Pure English words: "what", "where", "when", "how", "time", "place"

HINDI (including Romanized):
- Devanagari: "क्या", "कहाँ", "कब", "कैसे", "है", "में"
- Romanized: "kya", "kahan", "kab", "kaise", "hai", "mein", "snan", "darshan", "ghat", "mela"

MARATHI (including Romanized):
- Devanagari: "काय", "कुठे", "केव्हा", "कसे", "आहे"
- Romanized: "kay", "kuthe", "kevha", "kase", "aahe", "kuthun"

TAMIL (including Romanized):
- Tamil script: "என்ன", "எங்கே", "எப்போது", "எப்படி"
- Romanized: "enna", "enge", "eppothu", "eppadi", "yeppadi"

TELUGU (including Romanized):
- Telugu script: "ఏమి", "ఎక్కడ", "ఎప్పుడు", "ఎలా"
- Romanized: "emi", "ekkada", "eppudu", "ela", "elaa"

BENGALI (including Romanized):
- Bengali script: "কি", "কোথায়", "কখন", "কিভাবে"
- Romanized: "ki", "kothay", "kokhon", "kibhabe", "kothaye"

GUJARATI (including Romanized):
- Gujarati script: "શું", "ક્યાં", "ક્યારે", "કેવી રીતે"
- Romanized: "shu", "shun", "kyare", "kem", "kevi rite"

Examples:
"snan ka time kya hai" → hindi
"What is the bathing time" → english
"स्नान का समय क्या है" → hindi
"kuthe aahe mela" → marathi
"enna time snan" → tamil
"ekkada undi kumbh mela" → telugu
"ki bolchen apni" → bengali
"kya che kumbh mela" → gujarati

Reply with just one word in lowercase."""),
    ("human", "{text}")
])

chain = prompt | llm
detect_chain = detect_prompt | llm

def detect_language(text: str) -> str:
    """Detect the language of the input text from 7 supported languages"""
    try:
        result = detect_chain.invoke({"text": text})
        detected = result.content.strip().lower()
        
        # Map to language codes
        lang_mapping = {
            "english": "en",
            "hindi": "hi", 
            "marathi": "mr",
            "tamil": "ta",
            "telugu": "te",
            "bengali": "bn",
            "gujarati": "gu"
        }
        
        return lang_mapping.get(detected, "en")
    except Exception as e:
        logger.warning(f"Language detection failed: {e}, defaulting to English")
        return "en"

async def text_to_speech(text: str, language: str) -> bytes:
    """Convert text to speech using Groq TTS API"""
    try:
        # Note: Groq's TTS support may be limited. You might need to use a different service
        # For now, this is a placeholder - you may want to use Google TTS, ElevenLabs, or other services
        
        # If Groq doesn't support TTS, you can use gTTS (Google Text-to-Speech)
        from gtts import gTTS
        
        # Map language codes to gTTS language codes
        gtts_lang_map = {
            "en": "en",
            "hi": "hi",
            "mr": "mr",
            "ta": "ta",
            "te": "te",
            "bn": "bn",
            "gu": "gu"
        }
        
        tts = gTTS(text=text, lang=gtts_lang_map.get(language, "en"), slow=False)
        
        # Save to bytes
        audio_fp = io.BytesIO()
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0)
        
        return audio_fp.read()
        
    except Exception as e:
        logger.error(f"TTS conversion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to convert text to speech: {str(e)}")

async def transcribe_audio(audio_file: UploadFile) -> str:
    """Transcribe audio file to text using Groq Whisper"""
    try:
        # Read the audio file
        audio_content = await audio_file.read()
        
        # Create a temporary file with proper extension
        file_ext = os.path.splitext(audio_file.filename)[1] or '.webm'
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            temp_file.write(audio_content)
            temp_path = temp_file.name
        
        try:
            # Transcribe using Groq Whisper
            with open(temp_path, "rb") as audio:
                transcription = groq_client.audio.transcriptions.create(
                    file=(audio_file.filename, audio.read()),
                    model="whisper-large-v3",
                    response_format="text",
                    language=None  # Auto-detect language
                )
            
            return transcription
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        logger.error(f"Audio transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")

# Store audio temporarily (in production, use cloud storage)
audio_cache = {}

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Nashik Kumbh Mela 2027 AI Assistant",
        "location": "Nashik & Trimbakeshwar, Maharashtra",
        "event_year": 2027,
        "sacred_river": "Godavari (Gautami Ganga)",
        "supported_languages": LANGUAGE_MAP,
        "total_languages": len(LANGUAGE_MAP),
        "features": ["text_chat", "voice_input", "text_to_speech"]
    }

@app.get("/languages")
def get_languages():
    """Get list of all 7 supported languages"""
    return {
        "languages": LANGUAGE_MAP,
        "count": len(LANGUAGE_MAP),
        "language_codes": list(LANGUAGE_MAP.keys())
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Main chat endpoint for Nashik Kumbh Mela 2027 assistance
    Auto-detects language and responds in the same language
    
    Supports 7 languages: English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati
    
    - **message**: User's question about Nashik Kumbh Mela 2027 in any supported language
    - **enable_tts**: Optional boolean to enable text-to-speech (default: False)
    """
    try:
        logger.info(f"Received message: {req.message[:50]}...")
        
        # Detect the language of user's message
        detected_lang = detect_language(req.message)
        logger.info(f"Detected language: {detected_lang}")
        
        # Invoke the AI chain
        result = chain.invoke({
            "user_input": f"[Language: {detected_lang}]\n{req.message}"
        })
        
        reply_text = result.content.strip()
        audio_url = None
        
        # Generate TTS only if requested (default: OFF for text messages)
        if req.enable_tts:
            try:
                audio_bytes = await text_to_speech(reply_text, detected_lang)
                # Store in cache with a unique ID
                import uuid
                audio_id = str(uuid.uuid4())
                audio_cache[audio_id] = audio_bytes
                audio_url = f"/audio/{audio_id}"
                logger.info(f"Generated TTS audio for response")
            except Exception as e:
                logger.warning(f"TTS generation failed, continuing without audio: {e}")
        
        response = ChatResponse(
            reply=reply_text,
            detected_language=detected_lang,
            status="success",
            audio_url=audio_url
        )
        
        logger.info(f"Successfully generated response in {detected_lang}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        
        # Return multilingual error message
        raise HTTPException(
            status_code=500,
            detail="Sorry, I encountered an error. Please try again. | क्षमा करें, एक त्रुटि हुई। | माफ करा, एक त्रुटी आली। | மன்னிக்கவும், பிழை ஏற்பட்டது। | క్షమించండి, లోపం సంభవించింది। | দুঃখিত, একটি ত্রুটি হয়েছে। | માફ કરશો, ભૂલ થઈ."
        )

@app.post("/chat/voice", response_model=ChatResponse)
async def chat_voice(audio: UploadFile = File(...)):
    """
    Voice chat endpoint for Nashik Kumbh Mela 2027 - accepts audio files and responds with text AND audio
    TTS is AUTOMATICALLY ENABLED for voice input
    Supports: MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM
    Auto-detects language from 7 supported languages
    
    - **audio**: Audio file with user's question about Nashik Kumbh Mela in any supported language
    """
    try:
        # Validate file type
        allowed_extensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm']
        file_ext = os.path.splitext(audio.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Supported: {', '.join(allowed_extensions)}"
            )
        
        logger.info(f"Received audio file: {audio.filename}")
        
        # Transcribe audio to text
        transcribed_text = await transcribe_audio(audio)
        logger.info(f"Transcribed text: {transcribed_text[:100]}...")
        
        # Detect language
        detected_lang = detect_language(transcribed_text)
        logger.info(f"Detected language: {detected_lang}")
        
        # Generate response using AI
        result = chain.invoke({
            "user_input": transcribed_text
        })
        
        reply_text = result.content.strip()
        
        # ALWAYS generate TTS for voice input (default: ON for voice messages)
        audio_url = None
        try:
            audio_bytes = await text_to_speech(reply_text, detected_lang)
            import uuid
            audio_id = str(uuid.uuid4())
            audio_cache[audio_id] = audio_bytes
            audio_url = f"/audio/{audio_id}"
            logger.info(f"Generated TTS audio for voice response")
        except Exception as e:
            logger.warning(f"TTS generation failed: {e}")
        
        response = ChatResponse(
            reply=reply_text,
            detected_language=LANGUAGE_MAP[detected_lang],
            status="success",
            audio_url=audio_url
        )
        
        logger.info(f"Successfully generated voice response in {detected_lang}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing voice request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Sorry, I couldn't process your voice message. | क्षमा करें, वॉयस संदेश प्रोसेस नहीं हो सका। | माफ करा, व्हॉइस मेसेज प्रोसेस झाला नाही। | மன்னிக்கவும், குரல் செய்தியை செயலாக்க முடியவில்லை। | క్షమించండి, వాయిస్ సందేశం ప్రాసెస్ చేయలేకపోయింది। | দুঃখিত, ভয়েস বার্তা প্রক্রিয়া করতে পারিনি। | માફ કરશો, વૉઇસ મેસેજ પ્રોસેસ ન કરી શક્યો."
        )

@app.get("/audio/{audio_id}")
async def get_audio(audio_id: str):
    """Retrieve generated audio file"""
    if audio_id not in audio_cache:
        raise HTTPException(status_code=404, detail="Audio not found")
    
    audio_bytes = audio_cache[audio_id]
    
    # Clean up after serving (optional - or implement TTL)
    # del audio_cache[audio_id]
    
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg",
        headers={"Content-Disposition": f"inline; filename=response_{audio_id}.mp3"}
    )

@app.get("/health")
def health_check():
    """Detailed health check with language info"""
    return {
        "status": "healthy",
        "llm_model": "llama-3.3-70b-versatile",
        "languages_supported": list(LANGUAGE_MAP.keys()),
        "total_languages": len(LANGUAGE_MAP),
        "language_names": list(LANGUAGE_MAP.values()),
        "tts_enabled": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)