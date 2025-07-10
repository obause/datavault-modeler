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
    nodes = NodeCreateSerializer(many=True, required=False)
    edges = EdgeCreateSerializer(many=True, required=False)
    
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
            # Delete existing nodes and create new ones (simple approach)
            instance.nodes.all().delete()
            for node_data in nodes_data:
                try:
                    Node.objects.create(
                        model=instance,
                        **node_data
                    )
                except Exception as e:
                    logger.error(f"Error creating node: {e}, data: {node_data}")
                    raise
        
        # Update edges if provided
        if edges_data is not None:
            # Delete existing edges and create new ones (simple approach)
            instance.edges.all().delete()
            for edge_data in edges_data:
                try:
                    Edge.objects.create(
                        model=instance,
                        **edge_data
                    )
                except Exception as e:
                    logger.error(f"Error creating edge: {e}, data: {edge_data}")
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