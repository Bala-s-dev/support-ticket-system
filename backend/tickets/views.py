from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncDay
from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'priority', 'status']
    search_fields = ['title', 'description']

    def get_queryset(self):
        return Ticket.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # Database-level aggregation as required by the assessment 
        stats_data = Ticket.objects.aggregate(
            total_tickets=Count('id'),
            open_tickets=Count('id', filter=Q(status='open'))
        )

        daily_counts = (
            Ticket.objects.annotate(day=TruncDay('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .values('count')
        )
        avg_per_day = daily_counts.aggregate(avg=Avg('count'))['avg'] or 0

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