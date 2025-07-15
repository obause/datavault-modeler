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

class Settings(models.Model):
    """Global application settings that persist across all models"""
    # Single instance model - only one settings record should exist
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Display preferences
    theme = models.CharField(max_length=20, default='light', choices=[
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('auto', 'Auto'),
    ])
    
    # Canvas settings
    auto_save = models.BooleanField(default=True)
    auto_save_interval = models.IntegerField(default=30)  # seconds
    snap_to_grid = models.BooleanField(default=True)
    grid_size = models.IntegerField(default=16)
    
    # Edge settings
    edge_type = models.CharField(max_length=20, default='smoothstep', choices=[
        ('bezier', 'Bezier'),
        ('straight', 'Straight'),
        ('step', 'Step'),
        ('smoothstep', 'Smooth Step'),
    ])
    floating_edges = models.BooleanField(default=True)
    edge_animation = models.BooleanField(default=True)
    show_connection_points = models.BooleanField(default=True)
    
    # Global column settings
    global_columns = models.JSONField(default=list, help_text="Global columns that appear in all node types")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Settings"
        verbose_name_plural = "Settings"
    
    def __str__(self):
        return "Application Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one settings instance exists
        if not self.pk and Settings.objects.exists():
            # If trying to create a new instance but one already exists, 
            # update the existing one instead
            existing = Settings.objects.first()
            for field in self._meta.fields:
                if field.name not in ['id', 'created_at']:
                    setattr(existing, field.name, getattr(self, field.name))
            existing.save()
            return existing
        return super().save(*args, **kwargs)
    
    @classmethod
    def get_default_global_columns(cls):
        """Get the default global columns configuration"""
        return [
            {
                'id': 'record_source',
                'name': 'record_source',
                'dataType': 'VARCHAR(100)',
                'markers': ['RSRC'],
                'description': 'Source system identifier',
                'isRequired': True,
                'isEnabled': True
            },
            {
                'id': 'load_date',
                'name': 'load_date',
                'dataType': 'TIMESTAMP',
                'markers': ['LDTS'],
                'description': 'Date when record was loaded',
                'isRequired': True,
                'isEnabled': True
            }
        ]

    @classmethod
    def get_instance(cls):
        """Get the single settings instance, creating it if it doesn't exist"""
        obj, created = cls.objects.get_or_create(
            defaults={
                'theme': 'light',
                'auto_save': True,
                'auto_save_interval': 30,
                'snap_to_grid': True,
                'grid_size': 16,
                'edge_type': 'smoothstep',
                'floating_edges': True,
                'edge_animation': True,
                'show_connection_points': True,
                'global_columns': cls.get_default_global_columns(),
            }
        )
        
        # Ensure global_columns is always populated, even for existing records
        if not obj.global_columns:
            obj.global_columns = cls.get_default_global_columns()
            obj.save()
        
        return obj
