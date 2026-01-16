import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_MAP: Record<string, string> = {
  "en": "English",
  "hi": "Hindi (हिंदी)",
  "mr": "Marathi (मराठी)",
  "ta": "Tamil (தமிழ்)",
  "te": "Telugu (తెలుగు)",
  "bn": "Bengali (বাংলা)",
  "gu": "Gujarati (ગુજરાતી)",
  "kn": "Kannada (ಕನ್ನಡ)"
};

const SYSTEM_PROMPT = `You are the official Nashik Kumbh Mela 2027 AI Assistant, helping pilgrims and visitors with information about the sacred gathering in Nashik, Maharashtra. Answer strictly about Nashik Kumbh Mela 2027 only.

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

CRITICAL LANGUAGE RULES - 8 LANGUAGES SUPPORTED:
1. **Auto-detect the language** of the user's message (English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada or Romanized versions)
2. **Reply in the EXACT SAME language** as the user's question
3. If user asks in Romanized script (Hindi/regional words in English), reply in proper native script
4. NEVER mix languages in your response - maintain language purity

RESPONSE GUIDELINES:
- FOCUS ON NASHIK KUMBH MELA 2027 - All information specific to Nashik only
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
- Kannada: "ತುರ್ತು ಸೇವೆಗಳಿಗಾಗಿ 112 ಕರೆ ಮಾಡಿ"

TOPICS YOU CAN HELP WITH:
- Event schedules and Shahi Snan dates
- Nashik locations: Ramkund, Panchavati, Trimbakeshwar
- Accommodation in Nashik
- Religious significance of Godavari
- Safety guidelines
- Transportation to Nashik
- Important temples: Kalaram, Trimbakeshwar
- Godavari River ghats and bathing areas

WHAT TO AVOID:
- Don't confuse with other Kumbh locations (Prayagraj, Haridwar, Ujjain)
- Never provide medical advice
- Don't make up specific dates/times for 2027
- Stay focused on Nashik Kumbh Mela queries only

IMPORTANT: Always specify this is about **Nashik Kumbh Mela 2027** in Maharashtra, on the banks of Godavari River.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Received message: ${message.substring(0, 50)}...`);
    console.log(`Language hint: ${language}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get AI response',
          details: errorText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';

    console.log('Successfully generated response');

    return new Response(
      JSON.stringify({ 
        reply,
        detected_language: LANGUAGE_MAP[language] || 'English',
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in kumbh-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
