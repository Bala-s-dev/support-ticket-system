import os
from groq import Groq
import json

class LLMClassifier:
    def __init__(self):
        # API key is pulled from environment variables as required [cite: 43]
        self.client = Groq(api_key=os.environ.get("LLM_API_KEY"))

    def classify_ticket(self, description):
        if not os.environ.get("LLM_API_KEY"):
            return None

        # The prompt includes the allowed categories and priorities [cite: 46]
        prompt = f"""
        You are a support ticket classifier. Analyze the description and return a JSON object.
        
        Categories: billing, technical, account, general
        Priorities: low, medium, high, critical

        Rules:
        1. Only use the categories and priorities listed above.
        2. Return ONLY valid JSON.
        
        Description: {description}
        """

        try:
            # Using JSON mode to ensure structured output [cite: 38]
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "you are a helpful assistant that replies in JSON.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
            )
            
            # Parsing the LLM response [cite: 38]
            response_content = chat_completion.choices[0].message.content
            data = json.loads(response_content)
            
            return {
                "suggested_category": data.get("suggested_category", "general"),
                "suggested_priority": data.get("suggested_priority", "low")
            }
        except Exception as e:
            # Graceful failure handling: if LLM is down, submission still works [cite: 44, 45]
            print(f"Groq API Error: {e}")
            return None