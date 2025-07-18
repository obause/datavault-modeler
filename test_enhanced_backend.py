#!/usr/bin/env python
"""
Test script to verify enhanced Data Vault backend functionality.
This script tests that specialized Data Vault models (Hub, Link, Satellite, etc.) 
are automatically created when nodes are created through the API.
"""

import os
import sys
import django
import json
import uuid
from django.test import TestCase
from django.test.utils import setup_test_environment, teardown_test_environment
from django.db import connection
from django.core.management import execute_from_command_line

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dvw_backend.settings')
django.setup()

from modeler.models import DataModel, Node, Hub, Link, Satellite, Reference, PointInTime, Bridge
from modeler.api import create_or_update_data_vault_component

def test_enhanced_backend():
    """Test that Data Vault components are created from nodes"""
    
    print("🧪 Testing Enhanced Data Vault Backend")
    print("=" * 50)
    
    # Create a test data model
    print("📦 Creating test data model...")
    data_model = DataModel.objects.create(
        name="Test Data Vault Model",
        description="Testing enhanced backend integration"
    )
    print(f"✅ Created DataModel: {data_model.name} (ID: {data_model.id})")
    
    # Test 1: Create a Hub node and verify Hub model is created
    print("\n🔵 Test 1: Creating Hub node...")
    hub_node_id = uuid.uuid4()
    hub_node = Node.objects.create(
        id=hub_node_id,
        model=data_model,
        type="HUB",
        x=100,
        y=200,
        data={
            "label": "Customer Hub",
            "type": "HUB",
            "properties": {
                "hashkeyName": "hk_customer_h",
                "businessKeys": ["customer_id", "email"],
                "recordSources": ["CRM_SALESFORCE"],
                "description": "Central customer hub"
            }
        }
    )
    
    # Create the corresponding Data Vault component
    hub_component = create_or_update_data_vault_component(hub_node, data_model, is_update=False)
    
    if hub_component:
        print(f"✅ Hub component created: {hub_component.name}")
        print(f"   - Hashkey: {hub_component.hashkey_name}")
        print(f"   - Business Keys: {hub_component.business_keys}")
        print(f"   - Record Sources: {hub_component.record_sources}")
    else:
        print("❌ Hub component creation failed")
    
    # Test 2: Create a Satellite node and verify Satellite model is created
    print("\n🟡 Test 2: Creating Satellite node...")
    sat_node_id = uuid.uuid4()
    sat_node = Node.objects.create(
        id=sat_node_id,
        model=data_model,
        type="SAT",
        x=300,
        y=200,
        data={
            "label": "Customer Details",
            "type": "SAT",
            "properties": {
                "satelliteType": "standard",
                "hashdiffName": "hd_customer_details_s",
                "recordSource": "CRM_SALESFORCE",
                "attributes": ["first_name", "last_name", "phone"],
                "description": "Customer personal information"
            }
        }
    )
    
    sat_component = create_or_update_data_vault_component(sat_node, data_model, is_update=False)
    
    if sat_component:
        print(f"✅ Satellite component created: {sat_component.name}")
        print(f"   - Type: {sat_component.satellite_type}")
        print(f"   - Hashdiff: {sat_component.hashdiff_name}")
        print(f"   - Attributes: {sat_component.attributes}")
    else:
        print("❌ Satellite component creation failed")
    
    # Test 3: Create a Link node and verify Link model is created
    print("\n🟢 Test 3: Creating Link node...")
    link_node_id = uuid.uuid4()
    link_node = Node.objects.create(
        id=link_node_id,
        model=data_model,
        type="LNK",
        x=200,
        y=100,
        data={
            "label": "Customer Order",
            "type": "LNK",
            "properties": {
                "hashkeyName": "hk_customer_order_l",
                "isTransactional": True,
                "recordSources": ["CRM_SALESFORCE", "ERP_SAP"],
                "description": "Customer to order relationship"
            }
        }
    )
    
    link_component = create_or_update_data_vault_component(link_node, data_model, is_update=False)
    
    if link_component:
        print(f"✅ Link component created: {link_component.name}")
        print(f"   - Hashkey: {link_component.hashkey_name}")
        print(f"   - Transactional: {link_component.is_transactional}")
        print(f"   - Record Sources: {link_component.record_sources}")
    else:
        print("❌ Link component creation failed")
    
    # Test 4: Verify database counts
    print("\n📊 Database Summary:")
    print(f"   - DataModels: {DataModel.objects.count()}")
    print(f"   - Nodes: {Node.objects.count()}")
    print(f"   - Hubs: {Hub.objects.count()}")
    print(f"   - Links: {Link.objects.count()}")
    print(f"   - Satellites: {Satellite.objects.count()}")
    print(f"   - References: {Reference.objects.count()}")
    print(f"   - PointInTimes: {PointInTime.objects.count()}")
    print(f"   - Bridges: {Bridge.objects.count()}")
    
    # Test 5: Verify relationships
    print("\n🔗 Relationship Verification:")
    hub_from_db = Hub.objects.filter(model=data_model).first()
    if hub_from_db:
        print(f"✅ Hub '{hub_from_db.name}' linked to DataModel '{hub_from_db.model.name}'")
        if hub_from_db.node:
            print(f"✅ Hub linked to Node '{hub_from_db.node.id}'")
    
    sat_from_db = Satellite.objects.filter(model=data_model).first()
    if sat_from_db:
        print(f"✅ Satellite '{sat_from_db.name}' linked to DataModel '{sat_from_db.model.name}'")
        if sat_from_db.node:
            print(f"✅ Satellite linked to Node '{sat_from_db.node.id}'")
    
    print("\n🎉 Enhanced backend test completed!")
    
    # Cleanup
    print("\n🧹 Cleaning up test data...")
    data_model.delete()  # This should cascade delete all related objects
    print("✅ Test data cleaned up")

if __name__ == "__main__":
    try:
        test_enhanced_backend()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1) 