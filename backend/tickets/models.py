from django.db import models

class Ticket(models.Model):
    # Added db_index=True to frequently filtered/searched fields
    title = models.CharField(max_length=200, db_index=True) 
    description = models.TextField()
    category = models.CharField(max_length=20, db_index=True)
    priority = models.CharField(max_length=20, db_index=True)
    status = models.CharField(max_length=20, default='open', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] 