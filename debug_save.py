#!/usr/bin/env python3
"""
Debug script to test the save functionality
"""
import requests
import json
import uuid

# Test data that mimics what the frontend sends
test_model_data = {
    "name": "Debug Test Model",
    "nodes": [
        {
            "id": "hub-1721399200000",
            "type": "HUB",
            "x": 100.0,
            "y": 100.0,
            "data": {
                "label": "Customer Hub",
                "type": "HUB"
            }
        },
        {
            "id": "sat-1721399210000",
            "type": "SAT",
            "x": 200.0,
            "y": 150.0,
            "data": {
                "label": "Customer Details",
                "type": "SAT"
            }
        }
    ],
    "edges": [
        {
            "id": "edge-1721399220000",
            "source": "hub-1721399200000",
            "target": "sat-1721399210000",
            "data": {}
        }
    ]
}

def test_create_model():
    """Test creating a new model"""
    print("🧪 Testing model creation...")
    
    response = requests.post(
        "http://localhost:8000/api/models/",
        json=test_model_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        model_data = response.json()
        print(f"✅ Model created successfully: {model_data['id']}")
        return model_data['id']
    else:
        print(f"❌ Failed to create model")
        return None

def test_update_model(model_id):
    """Test updating an existing model"""
    print(f"🧪 Testing model update for {model_id}...")
    
    updated_data = {
        "name": "Updated Debug Test Model",
        "nodes": [
            {
                "id": "hub-updated-1721399200000",
                "type": "HUB",
                "x": 150.0,
                "y": 120.0,
                "data": {
                    "label": "Updated Customer Hub",
                    "type": "HUB"
                }
            }
        ],
        "edges": []
    }
    
    response = requests.put(
        f"http://localhost:8000/api/models/{model_id}/",
        json=updated_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print(f"✅ Model updated successfully")
        return True
    else:
        print(f"❌ Failed to update model")
        return False

def test_get_model(model_id):
    """Test getting a model"""
    print(f"🧪 Testing model retrieval for {model_id}...")
    
    response = requests.get(f"http://localhost:8000/api/models/{model_id}/")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print(f"✅ Model retrieved successfully")
        return response.json()
    else:
        print(f"❌ Failed to retrieve model")
        return None

if __name__ == "__main__":
    print("🚀 Starting API debug tests...")
    
    # Test creating a model
    model_id = test_create_model()
    
    if model_id:
        print("\n" + "="*50)
        # Test retrieving the model
        model_data = test_get_model(model_id)
        
        print("\n" + "="*50)
        # Test updating the model
        test_update_model(model_id)
    
    print("\n🎉 Debug tests completed!") 