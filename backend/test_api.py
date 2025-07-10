#!/usr/bin/env python3
"""
Simple test script to verify the Data Vault Modeler API functionality
"""
import os
import django
import sys
import json

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dvw_backend.settings')
django.setup()

from modeler.models import DataModel, Node, Edge

def test_model_creation():
    """Test creating a model with nodes and edges"""
    print("🧪 Testing Data Vault Modeler API...")
    
    # Create a test model
    model = DataModel.objects.create(name="Test Data Vault Model")
    print(f"✅ Created model: {model.name} (ID: {model.id})")
    
    # Create sample nodes
    hub_node = Node.objects.create(
        model=model,
        type="HUB",
        x=100.0,
        y=100.0,
        data={"label": "Customer Hub", "description": "Central customer data"}
    )
    
    satellite_node = Node.objects.create(
        model=model,
        type="SAT",
        x=200.0,
        y=150.0,
        data={"label": "Customer Details", "description": "Customer attributes"}
    )
    
    link_node = Node.objects.create(
        model=model,
        type="LNK",
        x=150.0,
        y=250.0,
        data={"label": "Customer Order Link", "description": "Links customers to orders"}
    )
    
    print(f"✅ Created {model.nodes.count()} nodes")
    
    # Create edges
    edge1 = Edge.objects.create(
        model=model,
        source=str(hub_node.id),
        target=str(satellite_node.id),
        data={"label": "has details"}
    )
    
    edge2 = Edge.objects.create(
        model=model,
        source=str(hub_node.id),
        target=str(link_node.id),
        data={"label": "participates in"}
    )
    
    print(f"✅ Created {model.edges.count()} edges")
    
    # Test retrieval
    retrieved_model = DataModel.objects.get(id=model.id)
    print(f"✅ Retrieved model: {retrieved_model.name}")
    print(f"   - Nodes: {retrieved_model.nodes.count()}")
    print(f"   - Edges: {retrieved_model.edges.count()}")
    
    # Display model structure
    print("\n📊 Model Structure:")
    for node in retrieved_model.nodes.all():
        print(f"   {node.type}: {node.data.get('label', 'Unnamed')} at ({node.x}, {node.y})")
    
    for edge in retrieved_model.edges.all():
        print(f"   Edge: {edge.source} -> {edge.target}")
    
    print(f"\n🎉 Test completed successfully!")
    print(f"   Model ID: {model.id}")
    print(f"   API endpoint: http://localhost:8000/api/models/{model.id}/")
    
    return model

if __name__ == "__main__":
    test_model_creation() 