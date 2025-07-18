from rest_framework import viewsets, serializers, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse
from django.db import transaction
from .models import (
    DataModel, Node, Edge, Settings, 
    Hub, Link, Satellite, Reference, PointInTime, Bridge
)
from .validators import DataVaultValidator, ValidationResult
import logging
import uuid

logger = logging.getLogger(__name__)

# ============================================================================
# Helper Functions for Data Vault Model Creation
# ============================================================================

def extract_data_vault_properties(node_data):
    """Extract Data Vault specific properties from node data"""
    data = node_data.get('data', {})
    properties = data.get('properties', {})
    
    return {
        'name': data.get('label', '').strip() or f"{node_data.get('type', 'Component')} {node_data.get('id', '')[:8]}",
        'description': properties.get('description', ''),
        'position_x': float(node_data.get('x', 0)),
        'position_y': float(node_data.get('y', 0)),
        'table_name': properties.get('tableName', ''),
        'properties': properties
    }

def create_hub_from_node(node, data_model):
    """Create a Hub model from node data"""
    props = extract_data_vault_properties(node.__dict__ if hasattr(node, '__dict__') else {'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
    
    hub_data = {
        'model': data_model,
        'node': node,
        'name': props['name'],
        'description': props['description'],
        'position_x': props['position_x'],
        'position_y': props['position_y'],
        'table_name': props['table_name'],
        'hashkey_name': props['properties'].get('hashkeyName', ''),
        'business_keys': props['properties'].get('businessKeys', []),
        'record_sources': props['properties'].get('recordSources', []),
    }
    
    return Hub.objects.create(**hub_data)

def create_link_from_node(node, data_model):
    """Create a Link model from node data"""
    props = extract_data_vault_properties(node.__dict__ if hasattr(node, '__dict__') else {'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
    
    link_data = {
        'model': data_model,
        'node': node,
        'name': props['name'],
        'description': props['description'],
        'position_x': props['position_x'],
        'position_y': props['position_y'],
        'table_name': props['table_name'],
        'hashkey_name': props['properties'].get('hashkeyName', ''),
        'dependent_child_key': props['properties'].get('dependentChildKey', ''),
        'is_transactional': props['properties'].get('isTransactional', False),
        'attributes': props['properties'].get('attributes', []),
        'record_sources': props['properties'].get('recordSources', []),
    }
    
    return Link.objects.create(**link_data)

def create_satellite_from_node(node, data_model):
    """Create a Satellite model from node data"""
    props = extract_data_vault_properties(node.__dict__ if hasattr(node, '__dict__') else {'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
    
    # Try to find a parent Hub or Link for this satellite
    # Look for the first available Hub as default parent (in a real scenario, this would be determined by relationships/edges)
    parent_hub = Hub.objects.filter(model=data_model).first()
    parent_link = None
    if not parent_hub:
        parent_link = Link.objects.filter(model=data_model).first()
    
    satellite_data = {
        'model': data_model,
        'node': node,
        'name': props['name'],
        'description': props['description'],
        'position_x': props['position_x'],
        'position_y': props['position_y'],
        'table_name': props['table_name'],
        'satellite_type': props['properties'].get('satelliteType', 'standard'),
        'hashdiff_name': props['properties'].get('hashdiffName', ''),
        'record_source': props['properties'].get('recordSource', ''),
        'attributes': props['properties'].get('attributes', []),
        'contains_pii': props['properties'].get('containsPII', False),
        'multi_active_key': props['properties'].get('multiActiveKey', ''),
        'effective_from_column': props['properties'].get('effectiveFromColumn', ''),
        'effective_to_column': props['properties'].get('effectiveToColumn', ''),
        'is_deleted_column': props['properties'].get('isDeletedColumn', ''),
        'parent_hub': parent_hub,
        'parent_link': parent_link,
    }
    
    return Satellite.objects.create(**satellite_data)

def create_reference_from_node(node, data_model):
    """Create a Reference model from node data"""
    props = extract_data_vault_properties(node.__dict__ if hasattr(node, '__dict__') else {'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
    
    reference_data = {
        'model': data_model,
        'node': node,
        'name': props['name'],
        'description': props['description'],
        'position_x': props['position_x'],
        'position_y': props['position_y'],
        'table_name': props['table_name'],
        'reference_type': props['properties'].get('referenceType', 'table'),
        'record_source': props['properties'].get('recordSource', ''),
        'reference_keys': props['properties'].get('referenceKeys', []),
        'attributes': props['properties'].get('attributes', []),
    }
    
    return Reference.objects.create(**reference_data)

def create_pit_from_node(node, data_model):
    """Create a PointInTime model from node data"""
    props = extract_data_vault_properties(node.__dict__ if hasattr(node, '__dict__') else {'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
    
    # For PIT tables, we need to find the tracked entity (should be a Hub)
    # For now, we'll set it to None and handle this in validation
    pit_data = {
        'model': data_model,
        'node': node,
        'name': props['name'],
        'description': props['description'],
        'position_x': props['position_x'],
        'position_y': props['position_y'],
        'table_name': props['table_name'],
        'tracked_entity': None,  # Will be set later when we can find the related hub
        'snapshot_date_column': props['properties'].get('snapshotDateColumn', 'snapshot_date'),
        'tracked_satellites': props['properties'].get('trackedSatellites', []),
    }
    
    return PointInTime.objects.create(**pit_data)

def create_bridge_from_node(node, data_model):
    """Create a Bridge model from node data"""
    props = extract_data_vault_properties(node.__dict__ if hasattr(node, '__dict__') else {'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
    
    bridge_data = {
        'model': data_model,
        'node': node,
        'name': props['name'],
        'description': props['description'],
        'position_x': props['position_x'],
        'position_y': props['position_y'],
        'table_name': props['table_name'],
        'bridge_entities': props['properties'].get('bridgeEntities', []),
    }
    
    return Bridge.objects.create(**bridge_data)

def create_or_update_data_vault_component(node, data_model, is_update=False):
    """Create or update the appropriate Data Vault component based on node type"""
    node_type = node.type
    
    try:
        if node_type == 'HUB':
            if is_update:
                # Try to get existing hub, or create new one
                try:
                    hub = Hub.objects.get(node=node)
                    # Update hub with new properties
                    props = extract_data_vault_properties({'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
                    hub.name = props['name']
                    hub.description = props['description']
                    hub.position_x = props['position_x']
                    hub.position_y = props['position_y']
                    hub.table_name = props['table_name']
                    hub.hashkey_name = props['properties'].get('hashkeyName', '')
                    hub.business_keys = props['properties'].get('businessKeys', [])
                    hub.record_sources = props['properties'].get('recordSources', [])
                    hub.save()
                    return hub
                except Hub.DoesNotExist:
                    return create_hub_from_node(node, data_model)
            else:
                return create_hub_from_node(node, data_model)
                
        elif node_type == 'LNK':
            if is_update:
                try:
                    link = Link.objects.get(node=node)
                    props = extract_data_vault_properties({'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
                    link.name = props['name']
                    link.description = props['description']
                    link.position_x = props['position_x']
                    link.position_y = props['position_y']
                    link.table_name = props['table_name']
                    link.hashkey_name = props['properties'].get('hashkeyName', '')
                    link.dependent_child_key = props['properties'].get('dependentChildKey', '')
                    link.is_transactional = props['properties'].get('isTransactional', False)
                    link.attributes = props['properties'].get('attributes', [])
                    link.record_sources = props['properties'].get('recordSources', [])
                    link.save()
                    return link
                except Link.DoesNotExist:
                    return create_link_from_node(node, data_model)
            else:
                return create_link_from_node(node, data_model)
                
        elif node_type == 'SAT':
            if is_update:
                try:
                    satellite = Satellite.objects.get(node=node)
                    props = extract_data_vault_properties({'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
                    satellite.name = props['name']
                    satellite.description = props['description']
                    satellite.position_x = props['position_x']
                    satellite.position_y = props['position_y']
                    satellite.table_name = props['table_name']
                    satellite.satellite_type = props['properties'].get('satelliteType', 'standard')
                    satellite.hashdiff_name = props['properties'].get('hashdiffName', '')
                    satellite.record_source = props['properties'].get('recordSource', '')
                    satellite.attributes = props['properties'].get('attributes', [])
                    satellite.contains_pii = props['properties'].get('containsPII', False)
                    satellite.multi_active_key = props['properties'].get('multiActiveKey', '')
                    satellite.effective_from_column = props['properties'].get('effectiveFromColumn', '')
                    satellite.effective_to_column = props['properties'].get('effectiveToColumn', '')
                    satellite.is_deleted_column = props['properties'].get('isDeletedColumn', '')
                    
                    # Ensure parent relationship is maintained
                    if not satellite.parent_hub and not satellite.parent_link:
                        parent_hub = Hub.objects.filter(model=data_model).first()
                        if parent_hub:
                            satellite.parent_hub = parent_hub
                        else:
                            parent_link = Link.objects.filter(model=data_model).first()
                            if parent_link:
                                satellite.parent_link = parent_link
                    
                    satellite.save()
                    return satellite
                except Satellite.DoesNotExist:
                    return create_satellite_from_node(node, data_model)
            else:
                return create_satellite_from_node(node, data_model)
                
        elif node_type == 'REF':
            if is_update:
                try:
                    reference = Reference.objects.get(node=node)
                    props = extract_data_vault_properties({'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
                    reference.name = props['name']
                    reference.description = props['description']
                    reference.position_x = props['position_x']
                    reference.position_y = props['position_y']
                    reference.table_name = props['table_name']
                    reference.reference_type = props['properties'].get('referenceType', 'table')
                    reference.record_source = props['properties'].get('recordSource', '')
                    reference.reference_keys = props['properties'].get('referenceKeys', [])
                    reference.attributes = props['properties'].get('attributes', [])
                    reference.save()
                    return reference
                except Reference.DoesNotExist:
                    return create_reference_from_node(node, data_model)
            else:
                return create_reference_from_node(node, data_model)
                
        elif node_type == 'PIT':
            if is_update:
                try:
                    pit = PointInTime.objects.get(node=node)
                    props = extract_data_vault_properties({'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
                    pit.name = props['name']
                    pit.description = props['description']
                    pit.position_x = props['position_x']
                    pit.position_y = props['position_y']
                    pit.table_name = props['table_name']
                    pit.snapshot_date_column = props['properties'].get('snapshotDateColumn', 'snapshot_date')
                    pit.tracked_satellites = props['properties'].get('trackedSatellites', [])
                    pit.save()
                    return pit
                except PointInTime.DoesNotExist:
                    return create_pit_from_node(node, data_model)
            else:
                return create_pit_from_node(node, data_model)
                
        elif node_type == 'BRIDGE':
            if is_update:
                try:
                    bridge = Bridge.objects.get(node=node)
                    props = extract_data_vault_properties({'data': node.data, 'x': node.x, 'y': node.y, 'type': node.type, 'id': str(node.id)})
                    bridge.name = props['name']
                    bridge.description = props['description']
                    bridge.position_x = props['position_x']
                    bridge.position_y = props['position_y']
                    bridge.table_name = props['table_name']
                    bridge.bridge_entities = props['properties'].get('bridgeEntities', [])
                    bridge.save()
                    return bridge
                except Bridge.DoesNotExist:
                    return create_bridge_from_node(node, data_model)
            else:
                return create_bridge_from_node(node, data_model)
                
    except Exception as e:
        logger.error(f"Error creating/updating Data Vault component for node {node.id} of type {node_type}: {e}")
        # Don't fail the entire operation if component creation fails
        return None

# ============================================================================
# Serializers for Enhanced Data Vault Components
# ============================================================================

class HubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hub
        fields = '__all__'

class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = '__all__'

class SatelliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Satellite
        fields = '__all__'

class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = '__all__'

class PointInTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointInTime
        fields = '__all__'

class BridgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bridge
        fields = '__all__'

# ============================================================================
# Legacy Node/Edge Serializers (Backwards Compatibility)
# ============================================================================

class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = "__all__"

class EdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Edge
        fields = "__all__"

class NodeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = ["id", "type", "x", "y", "data", "name", "table_name", "description"]

class EdgeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Edge
        fields = ["id", "source", "target", "data", "name", "description"]

# ============================================================================
# Settings Serializer
# ============================================================================

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

# ============================================================================
# Enhanced DataModel Serializer
# ============================================================================

class DataModelSerializer(serializers.ModelSerializer):
    nodes = NodeSerializer(many=True, read_only=True)
    edges = EdgeSerializer(many=True, read_only=True)
    hubs = HubSerializer(many=True, read_only=True)
    links = LinkSerializer(many=True, read_only=True)
    satellites = SatelliteSerializer(many=True, read_only=True)
    references = ReferenceSerializer(many=True, read_only=True)
    point_in_times = PointInTimeSerializer(many=True, read_only=True)
    bridges = BridgeSerializer(many=True, read_only=True)
    
    class Meta:
        model = DataModel
        fields = "__all__"

class DataModelCreateUpdateSerializer(serializers.ModelSerializer):
    # Legacy support for nodes/edges
    nodes = serializers.ListField(required=False)
    edges = serializers.ListField(required=False)
    
    # Enhanced Data Vault components
    hubs = serializers.ListField(required=False)
    links = serializers.ListField(required=False)
    satellites = serializers.ListField(required=False)
    references = serializers.ListField(required=False)
    point_in_times = serializers.ListField(required=False)
    bridges = serializers.ListField(required=False)
    
    class Meta:
        model = DataModel
        fields = ["id", "name", "description", "version", "tags", "created_at", "updated_at", 
                 "nodes", "edges", "hubs", "links", "satellites", "references", 
                 "point_in_times", "bridges"]
        read_only_fields = ["id", "created_at", "updated_at"]
    
    def create(self, validated_data):
        nodes_data = validated_data.pop('nodes', [])
        edges_data = validated_data.pop('edges', [])
        
        # Enhanced component data
        hubs_data = validated_data.pop('hubs', [])
        links_data = validated_data.pop('links', [])
        satellites_data = validated_data.pop('satellites', [])
        references_data = validated_data.pop('references', [])
        point_in_times_data = validated_data.pop('point_in_times', [])
        bridges_data = validated_data.pop('bridges', [])
        
        with transaction.atomic():
            # Create the model first
            data_model = DataModel.objects.create(**validated_data)
            
            # Create legacy nodes and edges (backwards compatibility)
            node_id_mapping = {}
            created_nodes = []
            for node_data in nodes_data:
                old_id = node_data.get('id')
                new_id = str(uuid.uuid4())
                node_id_mapping[old_id] = new_id
                
                node = Node.objects.create(
                    id=new_id,
                    model=data_model,
                    type=node_data.get('type'),
                    x=node_data.get('x', 0),
                    y=node_data.get('y', 0),
                    data=node_data.get('data', {}),
                    name=node_data.get('name', ''),
                    table_name=node_data.get('table_name', ''),
                    description=node_data.get('description', '')
                )
                created_nodes.append(node)
                
                # Create corresponding Data Vault component
                create_or_update_data_vault_component(node, data_model, is_update=False)
            
            for edge_data in edges_data:
                old_source = edge_data.get('source')
                old_target = edge_data.get('target')
                
                new_source = node_id_mapping.get(old_source, old_source)
                new_target = node_id_mapping.get(old_target, old_target)
                
                Edge.objects.create(
                    id=str(uuid.uuid4()),
                    model=data_model,
                    source=new_source,
                    target=new_target,
                    data=edge_data.get('data', {}),
                    name=edge_data.get('name', ''),
                    description=edge_data.get('description', '')
                )
            
            # Create enhanced Data Vault components
            for hub_data in hubs_data:
                Hub.objects.create(model=data_model, **hub_data)
            
            for link_data in links_data:
                Link.objects.create(model=data_model, **link_data)
            
            for satellite_data in satellites_data:
                Satellite.objects.create(model=data_model, **satellite_data)
            
            for reference_data in references_data:
                Reference.objects.create(model=data_model, **reference_data)
            
            for pit_data in point_in_times_data:
                PointInTime.objects.create(model=data_model, **pit_data)
            
            for bridge_data in bridges_data:
                Bridge.objects.create(model=data_model, **bridge_data)
        
        return data_model
    
    def update(self, instance, validated_data):
        nodes_data = validated_data.pop('nodes', None)
        edges_data = validated_data.pop('edges', None)
        
        logger.info(f"Updating model {instance.id} with nodes: {nodes_data is not None}, edges: {edges_data is not None}")
        
        # Update model fields
        for attr, value in validated_data.items():
            if hasattr(instance, attr):
                setattr(instance, attr, value)
        instance.save()
        
        # Update legacy nodes if provided (backwards compatibility)
        if nodes_data is not None:
            for node_data in nodes_data:
                if not isinstance(node_data, dict) or 'id' not in node_data:
                    raise serializers.ValidationError("Invalid node data format")
            
            existing_node_ids = set(instance.nodes.values_list('id', flat=True))
            incoming_node_ids = set(node_data['id'] for node_data in nodes_data)
            
            nodes_to_delete = existing_node_ids - incoming_node_ids
            instance.nodes.filter(id__in=nodes_to_delete).delete()
            
            for node_data in nodes_data:
                try:
                    node, created = Node.objects.update_or_create(
                        id=node_data['id'],
                        defaults={
                            'model': instance,
                            'type': node_data['type'],
                            'x': node_data['x'],
                            'y': node_data['y'],
                            'data': node_data['data'],
                            'name': node_data.get('name', ''),
                            'table_name': node_data.get('table_name', ''),
                            'description': node_data.get('description', '')
                        }
                    )
                    
                    # Create or update corresponding Data Vault component
                    create_or_update_data_vault_component(node, instance, is_update=True)
                    
                except Exception as e:
                    logger.error(f"Error updating/creating node: {e}, data: {node_data}")
                    raise
        
        # Update legacy edges if provided (backwards compatibility)
        if edges_data is not None:
            for edge_data in edges_data:
                if not isinstance(edge_data, dict) or 'id' not in edge_data:
                    raise serializers.ValidationError("Invalid edge data format")
            
            existing_edge_ids = set(instance.edges.values_list('id', flat=True))
            incoming_edge_ids = set(edge_data['id'] for edge_data in edges_data)
            
            edges_to_delete = existing_edge_ids - incoming_edge_ids
            instance.edges.filter(id__in=edges_to_delete).delete()
            
            for edge_data in edges_data:
                try:
                    Edge.objects.update_or_create(
                        id=edge_data['id'],
                        defaults={
                            'model': instance,
                            'source': edge_data['source'],
                            'target': edge_data['target'],
                            'data': edge_data['data'],
                            'name': edge_data.get('name', ''),
                            'description': edge_data.get('description', '')
                        }
                    )
                except Exception as e:
                    logger.error(f"Error updating/creating edge: {e}, data: {edge_data}")
                    raise
        
        return instance

    def to_representation(self, instance):
        return DataModelSerializer(instance).data

# ============================================================================
# ViewSets for Data Vault Components
# ============================================================================

class HubViewSet(viewsets.ModelViewSet):
    serializer_class = HubSerializer
    
    def get_queryset(self):
        model_id = self.request.query_params.get('model_id')
        if model_id:
            return Hub.objects.filter(model_id=model_id)
        return Hub.objects.all()
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Validate a specific hub"""
        hub = self.get_object()
        result = DataVaultValidator.validate_component(hub)
        return Response({
            'is_valid': result.is_valid,
            'errors': result.errors,
            'warnings': result.warnings
        })

class LinkViewSet(viewsets.ModelViewSet):
    serializer_class = LinkSerializer
    
    def get_queryset(self):
        model_id = self.request.query_params.get('model_id')
        if model_id:
            return Link.objects.filter(model_id=model_id)
        return Link.objects.all()
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Validate a specific link"""
        link = self.get_object()
        result = DataVaultValidator.validate_component(link)
        return Response({
            'is_valid': result.is_valid,
            'errors': result.errors,
            'warnings': result.warnings
        })

class SatelliteViewSet(viewsets.ModelViewSet):
    serializer_class = SatelliteSerializer
    
    def get_queryset(self):
        model_id = self.request.query_params.get('model_id')
        if model_id:
            return Satellite.objects.filter(model_id=model_id)
        return Satellite.objects.all()
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Validate a specific satellite"""
        satellite = self.get_object()
        result = DataVaultValidator.validate_component(satellite)
        return Response({
            'is_valid': result.is_valid,
            'errors': result.errors,
            'warnings': result.warnings
        })

class ReferenceViewSet(viewsets.ModelViewSet):
    serializer_class = ReferenceSerializer
    
    def get_queryset(self):
        model_id = self.request.query_params.get('model_id')
        if model_id:
            return Reference.objects.filter(model_id=model_id)
        return Reference.objects.all()

class PointInTimeViewSet(viewsets.ModelViewSet):
    serializer_class = PointInTimeSerializer
    
    def get_queryset(self):
        model_id = self.request.query_params.get('model_id')
        if model_id:
            return PointInTime.objects.filter(model_id=model_id)
        return PointInTime.objects.all()

class BridgeViewSet(viewsets.ModelViewSet):
    serializer_class = BridgeSerializer
    
    def get_queryset(self):
        model_id = self.request.query_params.get('model_id')
        if model_id:
            return Bridge.objects.filter(model_id=model_id)
        return Bridge.objects.all()

# ============================================================================
# Enhanced DataModel ViewSet
# ============================================================================

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
    
    @action(detail=True, methods=['post'])
    def validate_model(self, request, pk=None):
        """Validate entire Data Vault model"""
        model = self.get_object()
        result = DataVaultValidator.validate_model(model)
        return Response({
            'is_valid': result.is_valid,
            'errors': result.errors,
            'warnings': result.warnings,
            'summary': {
                'total_errors': len(result.errors),
                'total_warnings': len(result.warnings),
                'components_validated': {
                    'hubs': model.hubs.count(),
                    'links': model.links.count(),
                    'satellites': model.satellites.count(),
                    'references': model.references.count(),
                    'point_in_times': model.point_in_times.count(),
                    'bridges': model.bridges.count()
                }
            }
        })
    
    @action(detail=True, methods=['post'])
    def clone_model(self, request, pk=None):
        """Create a copy of the model"""
        original_model = self.get_object()
        new_name = request.data.get('name', f"{original_model.name} (Copy)")
        
        with transaction.atomic():
            # Create new model
            new_model = DataModel.objects.create(
                name=new_name,
                description=original_model.description,
                version="1.0",
                tags=original_model.tags.copy() if original_model.tags else []
            )
            
            # Clone legacy nodes and edges
            node_mapping = {}
            for node in original_model.nodes.all():
                new_node = Node.objects.create(
                    model=new_model,
                    type=node.type,
                    x=node.x,
                    y=node.y,
                    data=node.data.copy() if node.data else {},
                    name=node.name,
                    table_name=node.table_name,
                    description=node.description
                )
                node_mapping[str(node.id)] = str(new_node.id)
            
            for edge in original_model.edges.all():
                new_source = node_mapping.get(edge.source, edge.source)
                new_target = node_mapping.get(edge.target, edge.target)
                Edge.objects.create(
                    model=new_model,
                    source=new_source,
                    target=new_target,
                    data=edge.data.copy() if edge.data else {},
                    name=edge.name,
                    description=edge.description
                )
        
        serializer = DataModelSerializer(new_model)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # ========================================================================
    # Placeholder endpoints for complex operations
    # ========================================================================
    
    @action(detail=True, methods=['get'])
    def generate_ddl(self, request, pk=None):
        """Generate SQL DDL for the model (PLACEHOLDER)"""
        model = self.get_object()
        dialect = request.query_params.get('dialect', 'postgresql')
        
        # TODO: Implement DDL generation
        return Response({
            'status': 'not_implemented',
            'message': 'DDL generation is not yet implemented',
            'model_id': str(model.id),
            'dialect': dialect,
            'placeholder_ddl': f"-- DDL for model: {model.name}\n-- Dialect: {dialect}\n-- TODO: Implement DDL generation"
        }, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    @action(detail=True, methods=['get'])
    def export_dbt(self, request, pk=None):
        """Export as dbt models (PLACEHOLDER)"""
        model = self.get_object()
        
        # TODO: Implement dbt export
        return Response({
            'status': 'not_implemented',
            'message': 'dbt export is not yet implemented',
            'model_id': str(model.id),
            'placeholder_models': {
                'staging': f"-- Staging models for {model.name}",
                'raw_vault': f"-- Raw vault models for {model.name}",
                'business_vault': f"-- Business vault models for {model.name}"
            }
        }, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    @action(detail=True, methods=['get'])
    def export_dbml(self, request, pk=None):
        """Export as DBML schema (PLACEHOLDER)"""
        model = self.get_object()
        
        # TODO: Implement DBML export
        return Response({
            'status': 'not_implemented',
            'message': 'DBML export is not yet implemented',
            'model_id': str(model.id),
            'placeholder_dbml': f"// DBML schema for {model.name}\n// TODO: Implement DBML generation"
        }, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    @action(detail=True, methods=['post'])
    def generate_sample_data(self, request, pk=None):
        """Generate sample data for testing (PLACEHOLDER)"""
        model = self.get_object()
        rows = request.data.get('rows', 1000)
        
        # TODO: Implement sample data generation
        return Response({
            'status': 'not_implemented',
            'message': 'Sample data generation is not yet implemented',
            'model_id': str(model.id),
            'requested_rows': rows
        }, status=status.HTTP_501_NOT_IMPLEMENTED)

# ============================================================================
# Settings ViewSet (unchanged for backwards compatibility)
# ============================================================================

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
        settings.edge_type = 'smoothstep'
        settings.floating_edges = True
        settings.edge_animation = True
        settings.show_connection_points = True
        settings.global_columns = Settings.get_default_global_columns()
        settings.save()
        
        serializer = SettingsSerializer(settings)
        return Response(serializer.data) 