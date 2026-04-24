// AI Service: Speech-to-Text, Translation, and Summarization
// Uses external AI APIs (configurable)

class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1';
  }

  // Transcribe audio to text using Speech-to-Text API
  async speechToText(audioBuffer, language = 'hi') {
    try {
      if (!this.apiKey) {
        return { text: '[Speech-to-text: API key not configured]', language };
      }

      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('file', audioBuffer, { filename: 'audio.webm', contentType: 'audio/webm' });
      form.append('model', 'whisper-1');
      form.append('language', language);

      const response = await fetch(`${this.apiUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: form,
      });

      const data = await response.json();
      return { text: data.text, language };
    } catch (error) {
      console.error('Speech-to-text error:', error.message);
      return { text: '', language, error: error.message };
    }
  }

  // Translate text to English
  async translateToEnglish(text, sourceLanguage = 'hi') {
    try {
      if (!this.apiKey) {
        return { translatedText: text, originalLanguage: sourceLanguage };
      }

      if (sourceLanguage === 'en') {
        return { translatedText: text, originalLanguage: 'en' };
      }

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Translate the following text to English. Return only the translation.' },
            { role: 'user', content: text },
          ],
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      return {
        translatedText: data.choices?.[0]?.message?.content || text,
        originalLanguage: sourceLanguage,
      };
    } catch (error) {
      console.error('Translation error:', error.message);
      return { translatedText: text, originalLanguage: sourceLanguage, error: error.message };
    }
  }

  // Summarize and categorize service request
  async summarizeAndCategorize(text) {
    try {
      if (!this.apiKey) {
        return { summary: text.substring(0, 200), category: 'other', priority: 'medium' };
      }

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Analyze this maintenance request. Return JSON with:
                - summary: brief 1-2 sentence summary
                - category: one of [electrical, plumbing, carpentry, cleaning, painting, pest_control, security, other]
                - priority: one of [low, medium, high, urgent]
                - title: short title (max 10 words)`,
            },
            { role: 'user', content: text },
          ],
          max_tokens: 300,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      return {
        summary: result.summary || text.substring(0, 200),
        category: result.category || 'other',
        priority: result.priority || 'medium',
        title: result.title || 'Service Request',
      };
    } catch (error) {
      console.error('Summarization error:', error.message);
      return { summary: text.substring(0, 200), category: 'other', priority: 'medium', title: 'Service Request' };
    }
  }

  // Chatbot assistance
  async chatbotResponse(message, context = '') {
    try {
      if (!this.apiKey) {
        return { response: 'Chatbot is currently unavailable. Please contact the maintenance office directly.' };
      }

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are SocietyCare assistant for a housing society. Help residents with maintenance requests, payment queries, visitor management, and general society information. Be helpful, concise, and friendly. ${context}`,
            },
            { role: 'user', content: message },
          ],
          max_tokens: 300,
        }),
      });

      const data = await response.json();
      return { response: data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.' };
    } catch (error) {
      console.error('Chatbot error:', error.message);
      return { response: 'Sorry, I am currently unavailable. Please try again later.' };
    }
  }
}

module.exports = new AIService();
