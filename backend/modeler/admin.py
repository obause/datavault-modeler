from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
import json
from .models import DataModel, Node, Edge, Settings

class NodeInline(admin.TabularInline):
    model = Node
    extra = 0
    readonly_fields = ('id', 'type', 'x', 'y')
    fields = ('id', 'type', 'x', 'y', 'data')

class EdgeInline(admin.TabularInline):
    model = Edge
    extra = 0
    readonly_fields = ('id', 'source', 'target')
    fields = ('id', 'source', 'target', 'data')

@admin.register(DataModel)
class DataModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'id', 'created_at', 'node_count', 'edge_count')
    list_filter = ('created_at',)
    search_fields = ('name', 'id')
    readonly_fields = ('id', 'created_at')
    inlines = [NodeInline, EdgeInline]
    
    def node_count(self, obj):
        return obj.nodes.count()
    node_count.short_description = 'Nodes'
    
    def edge_count(self, obj):
        return obj.edges.count()
    edge_count.short_description = 'Edges'

@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'model_link', 'type', 'x', 'y', 'data_preview')
    list_filter = ('type', 'model', 'model__created_at')
    search_fields = ('id', 'model__name', 'data')
    readonly_fields = ('id',)
    list_select_related = ('model',)
    
    def model_link(self, obj):
        url = reverse('admin:modeler_datamodel_change', args=[obj.model.id])
        return format_html('<a href="{}">{}</a>', url, obj.model.name)
    model_link.short_description = 'Model'
    model_link.admin_order_field = 'model__name'
    
    def data_preview(self, obj):
        if obj.data:
            preview = json.dumps(obj.data, indent=2)[:100]
            if len(preview) >= 100:
                preview += "..."
            return format_html('<pre style="font-size: 11px; margin: 0;">{}</pre>', preview)
        return "No data"
    data_preview.short_description = 'Data Preview'

@admin.register(Edge)
class EdgeAdmin(admin.ModelAdmin):
    list_display = ('id', 'model_link', 'source', 'target', 'data_preview')
    list_filter = ('model', 'model__created_at')
    search_fields = ('id', 'model__name', 'source', 'target', 'data')
    readonly_fields = ('id',)
    list_select_related = ('model',)
    
    def model_link(self, obj):
        url = reverse('admin:modeler_datamodel_change', args=[obj.model.id])
        return format_html('<a href="{}">{}</a>', url, obj.model.name)
    model_link.short_description = 'Model'
    model_link.admin_order_field = 'model__name'
    
    def data_preview(self, obj):
        if obj.data:
            preview = json.dumps(obj.data, indent=2)[:100]
            if len(preview) >= 100:
                preview += "..."
            return format_html('<pre style="font-size: 11px; margin: 0;">{}</pre>', preview)
        return "No data"
    data_preview.short_description = 'Data Preview'

@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'theme', 'auto_save', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('General', {
            'fields': ('id', 'created_at', 'updated_at')
        }),
        ('Display Preferences', {
            'fields': ('theme',),
            'classes': ('collapse',)
        }),
        ('Canvas Settings', {
            'fields': ('auto_save', 'auto_save_interval', 'snap_to_grid', 'grid_size'),
            'classes': ('collapse',)
        }),
        ('Data Vault Preferences', {
            'fields': ('default_hub_prefix', 'default_link_prefix', 'default_satellite_prefix'),
            'classes': ('collapse',)
        }),
        ('Export Preferences', {
            'fields': ('export_format',),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one settings instance
        return not Settings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of settings
        return False

# Customize the admin site header and title
admin.site.site_header = 'Data Vault Modeler Admin'
admin.site.site_title = 'DVW Admin'
admin.site.index_title = 'Data Vault Modeler Administration'
