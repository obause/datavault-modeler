from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import DataModel, Node, Edge, Settings
import logging
import uuid

logger = logging.getLogger(__name__)

class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = "__all__"

class EdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Edge
        fields = "__all__"

# Serializers for create/update operations (without model field)
class NodeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = ["id", "type", "x", "y", "data"]

class EdgeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Edge
        fields = ["id", "source", "target", "data"]

class SettingsSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        """Ensure global_columns is always populated"""
        data = super().to_representation(instance)
        
        # If global_columns is empty, populate with defaults
        if not data.get('global_columns'):
            data['global_columns'] = Settings.get_default_global_columns()
            
        return data
    
    class Meta:
        model = Settings
        fields = [
            'id', 'theme', 'auto_save', 'auto_save_interval', 'snap_to_grid', 
            'grid_size', 'edge_type', 'floating_edges', 'edge_animation', 'show_connection_points',
            'global_columns', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class DataModelSerializer(serializers.ModelSerializer):
    nodes = NodeSerializer(many=True, read_only=True)
    edges = EdgeSerializer(many=True, read_only=True)
    
    class Meta:
        model = DataModel
        fields = "__all__"

class DataModelCreateUpdateSerializer(serializers.ModelSerializer):
    # Use raw data instead of nested serializers to avoid validation conflicts
    nodes = serializers.ListField(required=False)
    edges = serializers.ListField(required=False)
    
    class Meta:
        model = DataModel
        fields = ["id", "name", "created_at", "nodes", "edges"]
        read_only_fields = ["id", "created_at"]
    
    def create(self, validated_data):
        nodes_data = validated_data.pop('nodes', [])
        edges_data = validated_data.pop('edges', [])
        
        # Create the model first
        data_model = DataModel.objects.create(**validated_data)
        
        # Create a mapping of old node IDs to new node IDs
        node_id_mapping = {}
        
        # Create nodes with new UUIDs
        for node_data in nodes_data:
            old_id = node_data.get('id')
            new_id = str(uuid.uuid4())
            node_id_mapping[old_id] = new_id
            
            # Create node with new ID
            Node.objects.create(
                id=new_id,
                model=data_model,
                type=node_data.get('type'),
                x=node_data.get('x', 0),
                y=node_data.get('y', 0),
                data=node_data.get('data', {})
            )
        
        # Create edges with updated source/target references
        for edge_data in edges_data:
            old_source = edge_data.get('source')
            old_target = edge_data.get('target')
            
            # Map old IDs to new IDs
            new_source = node_id_mapping.get(old_source, old_source)
            new_target = node_id_mapping.get(old_target, old_target)
            
            Edge.objects.create(
                id=str(uuid.uuid4()),
                model=data_model,
                source=new_source,
                target=new_target,
                data=edge_data.get('data', {})
            )
        
        return data_model
    
    def update(self, instance, validated_data):
        nodes_data = validated_data.pop('nodes', None)
        edges_data = validated_data.pop('edges', None)
        
        logger.info(f"Updating model {instance.id} with nodes: {nodes_data is not None}, edges: {edges_data is not None}")
        
        # Update model fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update nodes if provided
        if nodes_data is not None:
            # Validate nodes data
            for node_data in nodes_data:
                if not isinstance(node_data, dict) or 'id' not in node_data:
                    raise serializers.ValidationError("Invalid node data format")
            
            # Get existing node IDs
            existing_node_ids = set(instance.nodes.values_list('id', flat=True))
            incoming_node_ids = set(node_data['id'] for node_data in nodes_data)
            
            # Delete nodes that are no longer present
            nodes_to_delete = existing_node_ids - incoming_node_ids
            instance.nodes.filter(id__in=nodes_to_delete).delete()
            
            # Update or create nodes
            for node_data in nodes_data:
                try:
                    Node.objects.update_or_create(
                        id=node_data['id'],
                        defaults={
                            'model': instance,
                            'type': node_data['type'],
                            'x': node_data['x'],
                            'y': node_data['y'],
                            'data': node_data['data'],
                        }
                    )
                except Exception as e:
                    logger.error(f"Error updating/creating node: {e}, data: {node_data}")
                    raise
        
        # Update edges if provided
        if edges_data is not None:
            # Validate edges data
            for edge_data in edges_data:
                if not isinstance(edge_data, dict) or 'id' not in edge_data:
                    raise serializers.ValidationError("Invalid edge data format")
            
            # Get existing edge IDs
            existing_edge_ids = set(instance.edges.values_list('id', flat=True))
            incoming_edge_ids = set(edge_data['id'] for edge_data in edges_data)
            
            # Delete edges that are no longer present
            edges_to_delete = existing_edge_ids - incoming_edge_ids
            instance.edges.filter(id__in=edges_to_delete).delete()
            
            # Update or create edges
            for edge_data in edges_data:
                try:
                    Edge.objects.update_or_create(
                        id=edge_data['id'],
                        defaults={
                            'model': instance,
                            'source': edge_data['source'],
                            'target': edge_data['target'],
                            'data': edge_data['data'],
                        }
                    )
                except Exception as e:
                    logger.error(f"Error updating/creating edge: {e}, data: {edge_data}")
                    raise
        
        return instance

    def to_representation(self, instance):
        # Use the read serializer for response
        return DataModelSerializer(instance).data

class DataModelViewSet(viewsets.ModelViewSet):
    queryset = DataModel.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DataModelCreateUpdateSerializer
        return DataModelSerializer
    
    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"Update request data: {request.data}")
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in update: {e}")
            return Response(
                {"error": str(e), "details": "Check server logs for more information"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class SettingsViewSet(viewsets.ViewSet):
    """
    Custom ViewSet for singleton Settings object.
    Handles all operations at the collection level since there's only one settings instance.
    """
    
    def list(self, request):
        """GET /api/settings/ - Get the settings"""
        settings = Settings.get_instance()
        serializer = SettingsSerializer(settings)
        return Response(serializer.data)
    
    def create(self, request):
        """POST /api/settings/ - Update settings (same as patch for singleton)"""
        settings = Settings.get_instance()
        serializer = SettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update(self, request, pk=None):
        """PUT /api/settings/{id}/ - Update settings"""
        settings = Settings.get_instance()
        serializer = SettingsSerializer(settings, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    def partial_update(self, request, pk=None):
        """PATCH /api/settings/{id}/ - Partially update settings"""
        settings = Settings.get_instance()
        serializer = SettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def patch_settings(self, request):
        """PATCH /api/settings/ - Handle PATCH at collection level"""
        settings = Settings.get_instance()
        serializer = SettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reset(self, request):
        """POST /api/settings/reset/ - Reset settings to defaults"""
        settings = Settings.get_instance()
        # Reset to default values
        settings.theme = 'light'
        settings.auto_save = True
        settings.auto_save_interval = 30
        settings.snap_to_grid = True
        settings.grid_size = 16
        settings.default_hub_prefix = 'HUB_'
        settings.default_link_prefix = 'LNK_'
        settings.default_satellite_prefix = 'SAT_'
        settings.export_format = 'json'
        settings.save()
        
        serializer = SettingsSerializer(settings)
        return Response(serializer.data) 