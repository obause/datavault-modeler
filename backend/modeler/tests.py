from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import DataModel, Node, Edge
import json


class DataModelTestCase(TestCase):
    def setUp(self):
        self.model = DataModel.objects.create(name="Test Model")
        self.hub_node = Node.objects.create(
            model=self.model,
            type="HUB",
            x=100.0,
            y=100.0,
            data={"label": "Test Hub"}
        )
        self.satellite_node = Node.objects.create(
            model=self.model,
            type="SAT",
            x=200.0,
            y=200.0,
            data={"label": "Test Satellite"}
        )

    def test_model_creation(self):
        """Test that a DataModel can be created"""
        self.assertEqual(self.model.name, "Test Model")
        self.assertEqual(self.model.nodes.count(), 2)

    def test_node_creation(self):
        """Test that nodes can be created with correct types"""
        self.assertEqual(self.hub_node.type, "HUB")
        self.assertEqual(self.satellite_node.type, "SAT")
        self.assertEqual(self.hub_node.x, 100.0)
        self.assertEqual(self.hub_node.y, 100.0)

    def test_edge_creation(self):
        """Test that edges can be created between nodes"""
        edge = Edge.objects.create(
            model=self.model,
            source=str(self.hub_node.id),
            target=str(self.satellite_node.id),
            data={"label": "Test Edge"}
        )
        self.assertEqual(edge.source, str(self.hub_node.id))
        self.assertEqual(edge.target, str(self.satellite_node.id))


class DataModelAPITestCase(APITestCase):
    def setUp(self):
        self.model = DataModel.objects.create(name="Test Model")
        self.hub_node = Node.objects.create(
            model=self.model,
            type="HUB",
            x=100.0,
            y=100.0,
            data={"label": "Test Hub"}
        )

    def test_get_models(self):
        """Test GET /api/models/"""
        url = reverse("datamodel-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Model")

    def test_get_model_detail(self):
        """Test GET /api/models/{id}/"""
        url = reverse("datamodel-detail", kwargs={"pk": self.model.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Model")
        self.assertEqual(len(response.data["nodes"]), 1)

    def test_create_model(self):
        """Test POST /api/models/"""
        url = reverse("datamodel-list")
        data = {"name": "New Model"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DataModel.objects.count(), 2)
        self.assertEqual(DataModel.objects.latest("created_at").name, "New Model")

    def test_update_model(self):
        """Test PUT /api/models/{id}/"""
        url = reverse("datamodel-detail", kwargs={"pk": self.model.id})
        data = {"name": "Updated Model"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.model.refresh_from_db()
        self.assertEqual(self.model.name, "Updated Model")

    def test_delete_model(self):
        """Test DELETE /api/models/{id}/"""
        url = reverse("datamodel-detail", kwargs={"pk": self.model.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(DataModel.objects.count(), 0)
