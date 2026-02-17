from rest_framework.decorators import action
from .services import LLMClassifier

# Inside your TicketViewSet class...
    @action(detail=False, methods=['post'])
    def classify(self, request):
        description = request.data.get('description')
        if not description:
            return Response({"error": "Description required"}, status=400)
        
        classifier = LLMClassifier()
        suggestion = classifier.classify_ticket(description)
        
        if suggestion:
            return Response(suggestion)
        
        # Fallback suggestion if LLM fails 
        return Response({
            "suggested_category": "general",
            "suggested_priority": "low"
        })