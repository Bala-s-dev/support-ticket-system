from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Ticket
from .serializers import TicketSerializer
from .services import LLMClassifier # Ensure this import is here

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    def get_queryset(self):
        return Ticket.objects.all().order_by('-created_at') # Newest first [cite: 12]

    @action(detail=False, methods=['post'])
    def classify(self, request):
        description = request.data.get('description')
        if not description:
            return Response({"error": "Description required"}, status=400)
        
        classifier = LLMClassifier()
        suggestion = classifier.classify_ticket(description)
        # Requirement: Suggestions for category and priority [cite: 38]
        return Response(suggestion or {
            "suggested_category": "general",
            "suggested_priority": "low"
        })