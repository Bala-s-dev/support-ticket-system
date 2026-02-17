import os
import json
from groq import Groq

class LLMClassifier:
    def __init__(self):
        # API key is pulled from environment variables in docker-compose
        self.api_key = os.environ.get("LLM_API_KEY")
        self.client = None
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                print(f"Groq Initialization Error: {e}")

    def classify_ticket(self, description):
        if not self.client:
            print("AI classification skipped: Groq client not initialized.")
            return None

        # SPECIFIC PROMPT: Define the JSON keys for the LLM
        prompt = f"""
        Classify this support ticket description into a category and priority.
        Categories: billing, technical, account, general
        Priorities: low, medium, high, critical

        Return ONLY a JSON object with these EXACT keys:
        {{
            "suggested_category": "one_of_the_categories",
            "suggested_priority": "one_of_the_priorities"
        }}

        Description: {description}
        """

        try:
            # Updated to a supported production model: llama-3.1-8b-instant
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that only replies in JSON."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-8b-instant",
                response_format={"type": "json_object"},
                timeout=10
            )
            
            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)
        except Exception as e:
            # Handle failures gracefully if LLM is unreachable or model is decommissioned
            print(f"AI ERROR: Groq API Call failed: {e}")
            return None