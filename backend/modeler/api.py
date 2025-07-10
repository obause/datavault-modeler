from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework import status
from .models import DataModel, Node, Edge
import logging

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
        
        # Create nodes
        for node_data in nodes_data:
            Node.objects.create(
                model=data_model,
                **node_data
            )
        
        # Create edges
        for edge_data in edges_data:
            Edge.objects.create(
                model=data_model,
                **edge_data
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