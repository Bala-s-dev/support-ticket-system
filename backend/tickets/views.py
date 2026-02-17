from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    # Requirement: List all tickets, newest first 
    def get_queryset(self):
        return Ticket.objects.all().order_by('-created_at')

    # Requirement: Return 201 on success 
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)