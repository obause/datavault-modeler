from django.db import models
import uuid

class DataModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)

class Node(models.Model):
    HUB = "HUB"
    LINK = "LNK"
    SAT = "SAT"
    TYPES = [(HUB, "Hub"), (LINK, "Link"), (SAT, "Satellite")]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="nodes")
    type = models.CharField(max_length=3, choices=TYPES)
    x = models.FloatField()
    y = models.FloatField()
    data = models.JSONField(default=dict)

class Edge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="edges")
    source = models.UUIDField()
    target = models.UUIDField()
    data = models.JSONField(default=dict)
