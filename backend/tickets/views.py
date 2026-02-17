from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncDay
from .models import Ticket
from .serializers import TicketSerializer
from .services import LLMClassifier

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    # Requirement: Combined filtering and search [cite: 1127]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'priority', 'status']
    search_fields = ['title', 'description']

    def get_queryset(self):
        # Requirement: List all tickets, newest first [cite: 1127]
        return Ticket.objects.all().order_by('-created_at')

    @action(detail=False, methods=['post'])
    def classify(self, request):
        # Requirement: Post a description, get LLM-suggested tags [cite: 1128, 1151]
        description = request.data.get('description')
        if not description:
            return Response({"error": "Description required"}, status=400)
        
        classifier = LLMClassifier()
        suggestion = classifier.classify_ticket(description)
        
        # Requirement: Graceful fallback to defaults if LLM fails [cite: 1159, 1160]
        return Response(suggestion or {
            "suggested_category": "general",
            "suggested_priority": "low"
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # Requirement: DB-level aggregation (No Python loops) [cite: 1147]
        stats_data = Ticket.objects.aggregate(
            total_tickets=Count('id'),
            open_tickets=Count('id', filter=Q(status='open'))
        )
        
        # Calculate daily averages [cite: 1133]
        daily_counts = (
            Ticket.objects.annotate(day=TruncDay('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .values('count')
        )
        avg_per_day = daily_counts.aggregate(avg=Avg('count'))['avg'] or 0

        # Requirement: Priority and Category breakdowns [cite: 1134, 1140]
        return Response({
            "total_tickets": stats_data['total_tickets'],
            "open_tickets": stats_data['open_tickets'],
            "avg_tickets_per_day": round(float(avg_per_day), 1),
            "priority_breakdown": {item['priority']: item['count'] for item in Ticket.objects.values('priority').annotate(count=Count('id'))},
            "category_breakdown": {item['category']: item['count'] for item in Ticket.objects.values('category').annotate(count=Count('id'))}
        })