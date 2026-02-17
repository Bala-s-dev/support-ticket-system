from rest_framework import viewsets, status, filters
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
    
    # Enable filtering and search as required by the PDF [cite: 1127]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'priority', 'status']
    search_fields = ['title', 'description']

    def get_queryset(self):
        # Requirements: List all tickets, newest first [cite: 1127]
        return Ticket.objects.all().order_by('-created_at')

    @action(detail=False, methods=['post'])
    def classify(self, request):
        description = request.data.get('description')
        if not description:
            return Response({"error": "Description required"}, status=400)
        
        classifier = LLMClassifier()
        suggestion = classifier.classify_ticket(description)
        return Response(suggestion or {
            "suggested_category": "general",
            "suggested_priority": "low"
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # 1. Database-level aggregation for counts 
        stats_data = Ticket.objects.aggregate(
            total_tickets=Count('id'),
            open_tickets=Count('id', filter=Q(status='open'))
        )

        # 2. Average tickets created per day [cite: 1133]
        daily_counts = (
            Ticket.objects.annotate(day=TruncDay('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .values('count')
        )
        avg_per_day = daily_counts.aggregate(avg=Avg('count'))['avg'] or 0

        # 3. Breakdowns by category and priority [cite: 1134, 1140]
        priority_breakdown = {
            item['priority']: item['count'] 
            for item in Ticket.objects.values('priority').annotate(count=Count('id'))
        }
        category_breakdown = {
            item['category']: item['count'] 
            for item in Ticket.objects.values('category').annotate(count=Count('id'))
        }

        return Response({
            "total_tickets": stats_data['total_tickets'],
            "open_tickets": stats_data['open_tickets'],
            "avg_tickets_per_day": round(float(avg_per_day), 1),
            "priority_breakdown": priority_breakdown,
            "category_breakdown": category_breakdown
        })