from django.db import models
from django.contrib.auth.models import User
import uuid

class DataModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    version = models.CharField(max_length=20, default="1.0")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return self.name

class Node(models.Model):
    # Extended node types to match frontend
    HUB = "HUB"
    LINK = "LNK" 
    SAT = "SAT"
    REF = "REF"
    PIT = "PIT"
    BRIDGE = "BRIDGE"
    
    TYPES = [
        (HUB, "Hub"),
        (LINK, "Link"), 
        (SAT, "Satellite"),
        (REF, "Reference"),
        (PIT, "Point in Time"),
        (BRIDGE, "Bridge"),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="nodes")
    type = models.CharField(max_length=6, choices=TYPES)  # Increased max_length for BRIDGE
    x = models.FloatField()
    y = models.FloatField()
    data = models.JSONField(default=dict)
    
    # Enhanced fields for better organization
    name = models.CharField(max_length=100, blank=True)
    table_name = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name or self.type} ({self.model.name})"

class Edge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="edges")
    source = models.UUIDField()
    target = models.UUIDField()
    data = models.JSONField(default=dict)
    
    # Enhanced fields
    name = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Edge {self.source} -> {self.target}"

# Enhanced Data Vault Component Models

class Hub(models.Model):
    """Data Vault Hub - Central business key entity"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="hubs")
    node = models.OneToOneField(Node, on_delete=models.CASCADE, null=True, blank=True)
    
    # Core Hub properties
    name = models.CharField(max_length=100)
    table_name = models.CharField(max_length=100, blank=True)
    business_keys = models.JSONField(default=list, help_text="List of business key columns")
    hashkey_name = models.CharField(max_length=100, default="", help_text="Name of the hub hashkey column")
    record_sources = models.JSONField(default=list, help_text="Source systems providing data")
    
    # Metadata
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['model', 'name']
    
    def __str__(self):
        return f"Hub: {self.name}"

class Link(models.Model):
    """Data Vault Link - Relationship between business entities"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="links")
    node = models.OneToOneField(Node, on_delete=models.CASCADE, null=True, blank=True)
    
    # Core Link properties
    name = models.CharField(max_length=100)
    table_name = models.CharField(max_length=100, blank=True)
    hashkey_name = models.CharField(max_length=100, default="", help_text="Name of the link hashkey column")
    dependent_child_key = models.CharField(max_length=100, blank=True)
    record_sources = models.JSONField(default=list, help_text="Source systems providing data")
    
    # Link-specific properties
    is_transactional = models.BooleanField(default=False, help_text="Whether this is a transactional link")
    attributes = models.JSONField(default=list, blank=True, help_text="Attributes for transactional links")
    
    # Metadata
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['model', 'name']
    
    def __str__(self):
        return f"Link: {self.name}"

class Satellite(models.Model):
    """Data Vault Satellite - Descriptive data context"""
    SATELLITE_TYPES = [
        ('standard', 'Standard Satellite'),
        ('multi-active', 'Multi-Active Satellite'),
        ('effectivity', 'Effectivity Satellite'),
        ('record-tracking', 'Record-Tracking Satellite'),
        ('non-historized', 'Non-Historized Satellite'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="satellites")
    node = models.OneToOneField(Node, on_delete=models.CASCADE, null=True, blank=True)
    
    # Core Satellite properties
    name = models.CharField(max_length=100)
    table_name = models.CharField(max_length=100, blank=True)
    satellite_type = models.CharField(max_length=20, choices=SATELLITE_TYPES, default='standard')
    hashdiff_name = models.CharField(max_length=100, default="", help_text="Name of the hashdiff column")
    record_source = models.CharField(max_length=100, blank=True)
    
    # Parent relationship (Hub or Link)
    parent_hub = models.ForeignKey(Hub, on_delete=models.CASCADE, null=True, blank=True)
    parent_link = models.ForeignKey(Link, on_delete=models.CASCADE, null=True, blank=True)
    
    # Satellite-specific properties
    attributes = models.JSONField(default=list, help_text="List of attribute columns")
    contains_pii = models.BooleanField(default=False)
    
    # Multi-Active Satellite fields
    multi_active_key = models.CharField(max_length=100, blank=True)
    
    # Effectivity Satellite fields
    effective_from_column = models.CharField(max_length=100, blank=True)
    effective_to_column = models.CharField(max_length=100, blank=True)
    
    # Record-Tracking Satellite fields
    is_deleted_column = models.CharField(max_length=100, blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['model', 'name']
        constraints = [
            models.CheckConstraint(
                check=models.Q(parent_hub__isnull=False) | models.Q(parent_link__isnull=False),
                name='satellite_must_have_parent'
            )
        ]
    
    def __str__(self):
        return f"Satellite: {self.name} ({self.satellite_type})"

class Reference(models.Model):
    """Data Vault Reference Data"""
    REFERENCE_TYPES = [
        ('table', 'Reference Table'),
        ('hub', 'Reference Hub'),
        ('satellite', 'Reference Satellite'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="references")
    node = models.OneToOneField(Node, on_delete=models.CASCADE, null=True, blank=True)
    
    # Core Reference properties
    name = models.CharField(max_length=100)
    table_name = models.CharField(max_length=100, blank=True)
    reference_type = models.CharField(max_length=20, choices=REFERENCE_TYPES, default='table')
    record_source = models.CharField(max_length=100, blank=True)
    
    # Reference-specific properties
    reference_keys = models.JSONField(default=list, help_text="Reference key columns")
    attributes = models.JSONField(default=list, help_text="Reference data attributes")
    
    # Metadata
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['model', 'name']
    
    def __str__(self):
        return f"Reference: {self.name} ({self.reference_type})"

class PointInTime(models.Model):
    """Data Vault Point-in-Time table"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="point_in_times")
    node = models.OneToOneField(Node, on_delete=models.CASCADE, null=True, blank=True)
    
    # Core PIT properties
    name = models.CharField(max_length=100)
    table_name = models.CharField(max_length=100, blank=True)
    tracked_entity = models.ForeignKey(Hub, on_delete=models.CASCADE, help_text="Hub or Link being tracked")
    
    # PIT-specific properties
    snapshot_date_column = models.CharField(max_length=100, default="snapshot_date")
    tracked_satellites = models.JSONField(default=list, help_text="List of satellites being tracked")
    
    # Metadata
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['model', 'name']
    
    def __str__(self):
        return f"PIT: {self.name}"

class Bridge(models.Model):
    """Data Vault Bridge table"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    model = models.ForeignKey(DataModel, on_delete=models.CASCADE, related_name="bridges")
    node = models.OneToOneField(Node, on_delete=models.CASCADE, null=True, blank=True)
    
    # Core Bridge properties
    name = models.CharField(max_length=100)
    table_name = models.CharField(max_length=100, blank=True)
    
    # Bridge-specific properties
    bridge_entities = models.JSONField(default=list, help_text="Entities connected by this bridge")
    
    # Metadata
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['model', 'name']
    
    def __str__(self):
        return f"Bridge: {self.name}"

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
