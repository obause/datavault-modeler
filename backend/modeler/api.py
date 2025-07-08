from rest_framework import viewsets, serializers
from .models import DataModel, Node, Edge

class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = "__all__"

class EdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Edge
        fields = "__all__"

class DataModelSerializer(serializers.ModelSerializer):
    nodes = NodeSerializer(many=True, read_only=True)
    edges = EdgeSerializer(many=True, read_only=True)
    
    class Meta:
        model = DataModel
        fields = "__all__"

class DataModelViewSet(viewsets.ModelViewSet):
    queryset = DataModel.objects.all()
    serializer_class = DataModelSerializer 