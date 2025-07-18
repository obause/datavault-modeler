"""
Data Vault Validation Engine

This module provides validation logic for Data Vault models to ensure
they conform to Data Vault best practices and business rules.
"""

from typing import List, Dict, Any, Optional, Tuple
from django.core.exceptions import ValidationError
from .models import DataModel, Node, Hub, Link, Satellite, Reference, PointInTime, Bridge


class ValidationResult:
    """Container for validation results"""
    
    def __init__(self):
        self.errors: List[Dict[str, Any]] = []
        self.warnings: List[Dict[str, Any]] = []
        self.is_valid: bool = True
    
    def add_error(self, component_type: str, component_id: str, message: str, field: Optional[str] = None):
        """Add a validation error"""
        self.errors.append({
            'component_type': component_type,
            'component_id': component_id,
            'field': field,
            'message': message,
            'severity': 'error'
        })
        self.is_valid = False
    
    def add_warning(self, component_type: str, component_id: str, message: str, field: Optional[str] = None):
        """Add a validation warning"""
        self.warnings.append({
            'component_type': component_type,
            'component_id': component_id,
            'field': field,
            'message': message,
            'severity': 'warning'
        })


class DataVaultNamingValidator:
    """Validates Data Vault naming conventions"""
    
    @staticmethod
    def validate_hub_naming(hub: Hub) -> List[Dict[str, str]]:
        """Validate hub naming conventions"""
        errors = []
        
        # Hub table name should follow pattern: hub_<name>_h or h_<name>
        if hub.table_name and not DataVaultNamingValidator._is_valid_hub_name(hub.table_name):
            errors.append({
                'field': 'table_name',
                'message': f"Hub table name '{hub.table_name}' should follow pattern 'hub_<name>_h' or 'h_<name>'"
            })
        
        # Hashkey should follow pattern: hk_<name>_h
        if hub.hashkey_name and not hub.hashkey_name.startswith('hk_') and not hub.hashkey_name.endswith('_h'):
            errors.append({
                'field': 'hashkey_name',
                'message': f"Hub hashkey '{hub.hashkey_name}' should follow pattern 'hk_<name>_h'"
            })
        
        return errors
    
    @staticmethod
    def validate_satellite_naming(satellite: Satellite) -> List[Dict[str, str]]:
        """Validate satellite naming conventions"""
        errors = []
        
        # Satellite table name should follow pattern based on type
        if satellite.table_name:
            expected_suffix = DataVaultNamingValidator._get_satellite_suffix(satellite.satellite_type)
            if not satellite.table_name.endswith(expected_suffix):
                errors.append({
                    'field': 'table_name',
                    'message': f"Satellite table name '{satellite.table_name}' should end with '{expected_suffix}' for {satellite.satellite_type} type"
                })
        
        # Hashdiff should follow pattern: hd_<name>_s
        if satellite.hashdiff_name and not satellite.hashdiff_name.startswith('hd_') and not satellite.hashdiff_name.endswith('_s'):
            errors.append({
                'field': 'hashdiff_name',
                'message': f"Satellite hashdiff '{satellite.hashdiff_name}' should follow pattern 'hd_<name>_s'"
            })
        
        return errors
    
    @staticmethod
    def validate_link_naming(link: Link) -> List[Dict[str, str]]:
        """Validate link naming conventions"""
        errors = []
        
        # Link table name should follow pattern: link_<name>_l or l_<name>
        if link.table_name and not DataVaultNamingValidator._is_valid_link_name(link.table_name):
            errors.append({
                'field': 'table_name',
                'message': f"Link table name '{link.table_name}' should follow pattern 'link_<name>_l' or 'l_<name>'"
            })
        
        # Hashkey should follow pattern: hk_<name>_l
        if link.hashkey_name and not link.hashkey_name.startswith('hk_') and not link.hashkey_name.endswith('_l'):
            errors.append({
                'field': 'hashkey_name',
                'message': f"Link hashkey '{link.hashkey_name}' should follow pattern 'hk_<name>_l'"
            })
        
        return errors
    
    @staticmethod
    def _is_valid_hub_name(name: str) -> bool:
        """Check if hub name follows conventions"""
        return (name.startswith('hub_') and name.endswith('_h')) or name.startswith('h_')
    
    @staticmethod
    def _is_valid_link_name(name: str) -> bool:
        """Check if link name follows conventions"""
        return (name.startswith('link_') and name.endswith('_l')) or name.startswith('l_')
    
    @staticmethod
    def _get_satellite_suffix(satellite_type: str) -> str:
        """Get expected suffix for satellite type"""
        suffix_map = {
            'standard': '_s',
            'multi-active': '_mas',
            'effectivity': '_es',
            'record-tracking': '_rts',
            'non-historized': '_nhs'
        }
        return suffix_map.get(satellite_type, '_s')


class DataVaultStructureValidator:
    """Validates Data Vault structural rules"""
    
    @staticmethod
    def validate_hub_structure(hub: Hub) -> List[Dict[str, str]]:
        """Validate hub structural requirements"""
        errors = []
        
        # Hub must have at least one business key
        if not hub.business_keys:
            errors.append({
                'field': 'business_keys',
                'message': 'Hub must have at least one business key'
            })
        
        # Hub must have a hashkey name
        if not hub.hashkey_name:
            errors.append({
                'field': 'hashkey_name',
                'message': 'Hub must have a hashkey name defined'
            })
        
        # Hub must have at least one record source
        if not hub.record_sources:
            errors.append({
                'field': 'record_sources',
                'message': 'Hub must have at least one record source'
            })
        
        return errors
    
    @staticmethod
    def validate_satellite_structure(satellite: Satellite) -> List[Dict[str, str]]:
        """Validate satellite structural requirements"""
        errors = []
        
        # Satellite must have exactly one parent (hub or link)
        if not satellite.parent_hub and not satellite.parent_link:
            errors.append({
                'field': 'parent',
                'message': 'Satellite must be connected to exactly one Hub or Link'
            })
        elif satellite.parent_hub and satellite.parent_link:
            errors.append({
                'field': 'parent',
                'message': 'Satellite cannot be connected to both Hub and Link'
            })
        
        # Satellite must have a hashdiff name
        if not satellite.hashdiff_name:
            errors.append({
                'field': 'hashdiff_name',
                'message': 'Satellite must have a hashdiff name defined'
            })
        
        # Multi-active satellite must have multi-active key
        if satellite.satellite_type == 'multi-active' and not satellite.multi_active_key:
            errors.append({
                'field': 'multi_active_key',
                'message': 'Multi-active satellite must have a multi-active key defined'
            })
        
        # Effectivity satellite must have date columns
        if satellite.satellite_type == 'effectivity':
            if not satellite.effective_from_column:
                errors.append({
                    'field': 'effective_from_column',
                    'message': 'Effectivity satellite must have effective from column defined'
                })
            if not satellite.effective_to_column:
                errors.append({
                    'field': 'effective_to_column', 
                    'message': 'Effectivity satellite must have effective to column defined'
                })
        
        return errors
    
    @staticmethod
    def validate_link_structure(link: Link) -> List[Dict[str, str]]:
        """Validate link structural requirements"""
        errors = []
        
        # Link must have a hashkey name
        if not link.hashkey_name:
            errors.append({
                'field': 'hashkey_name',
                'message': 'Link must have a hashkey name defined'
            })
        
        # Transactional link should have attributes
        if link.is_transactional and not link.attributes:
            errors.append({
                'field': 'attributes',
                'message': 'Transactional link should have attributes defined'
            })
        
        return errors


class DataVaultModelValidator:
    """Main validator for complete Data Vault models"""
    
    def __init__(self):
        self.naming_validator = DataVaultNamingValidator()
        self.structure_validator = DataVaultStructureValidator()
    
    def validate_model(self, model: DataModel) -> ValidationResult:
        """Validate a complete Data Vault model"""
        result = ValidationResult()
        
        # Validate individual components
        self._validate_hubs(model, result)
        self._validate_links(model, result)
        self._validate_satellites(model, result)
        self._validate_references(model, result)
        self._validate_point_in_times(model, result)
        self._validate_bridges(model, result)
        
        # Validate model-level rules
        self._validate_model_consistency(model, result)
        
        return result
    
    def _validate_hubs(self, model: DataModel, result: ValidationResult):
        """Validate all hubs in the model"""
        for hub in model.hubs.all():
            # Naming validation
            naming_errors = self.naming_validator.validate_hub_naming(hub)
            for error in naming_errors:
                result.add_error('hub', str(hub.id), error['message'], error['field'])
            
            # Structure validation
            structure_errors = self.structure_validator.validate_hub_structure(hub)
            for error in structure_errors:
                result.add_error('hub', str(hub.id), error['message'], error['field'])
    
    def _validate_links(self, model: DataModel, result: ValidationResult):
        """Validate all links in the model"""
        for link in model.links.all():
            # Naming validation
            naming_errors = self.naming_validator.validate_link_naming(link)
            for error in naming_errors:
                result.add_error('link', str(link.id), error['message'], error['field'])
            
            # Structure validation
            structure_errors = self.structure_validator.validate_link_structure(link)
            for error in structure_errors:
                result.add_error('link', str(link.id), error['message'], error['field'])
    
    def _validate_satellites(self, model: DataModel, result: ValidationResult):
        """Validate all satellites in the model"""
        for satellite in model.satellites.all():
            # Naming validation
            naming_errors = self.naming_validator.validate_satellite_naming(satellite)
            for error in naming_errors:
                result.add_error('satellite', str(satellite.id), error['message'], error['field'])
            
            # Structure validation
            structure_errors = self.structure_validator.validate_satellite_structure(satellite)
            for error in structure_errors:
                result.add_error('satellite', str(satellite.id), error['message'], error['field'])
    
    def _validate_references(self, model: DataModel, result: ValidationResult):
        """Validate all references in the model"""
        # TODO: Implement reference validation
        pass
    
    def _validate_point_in_times(self, model: DataModel, result: ValidationResult):
        """Validate all PIT tables in the model"""
        # TODO: Implement PIT validation
        pass
    
    def _validate_bridges(self, model: DataModel, result: ValidationResult):
        """Validate all bridge tables in the model"""
        # TODO: Implement bridge validation
        pass
    
    def _validate_model_consistency(self, model: DataModel, result: ValidationResult):
        """Validate model-level consistency rules"""
        # TODO: Implement cross-component validation
        # - Check that all satellite parents exist
        # - Check for orphaned components
        # - Validate connection patterns
        pass


class DataVaultValidator:
    """Main entry point for Data Vault validation"""
    
    @staticmethod
    def validate_component(component) -> ValidationResult:
        """Validate a single Data Vault component"""
        result = ValidationResult()
        naming_validator = DataVaultNamingValidator()
        structure_validator = DataVaultStructureValidator()
        
        if isinstance(component, Hub):
            naming_errors = naming_validator.validate_hub_naming(component)
            structure_errors = structure_validator.validate_hub_structure(component)
            component_type = 'hub'
        elif isinstance(component, Link):
            naming_errors = naming_validator.validate_link_naming(component)
            structure_errors = structure_validator.validate_link_structure(component)
            component_type = 'link'
        elif isinstance(component, Satellite):
            naming_errors = naming_validator.validate_satellite_naming(component)
            structure_errors = structure_validator.validate_satellite_structure(component)
            component_type = 'satellite'
        else:
            return result  # No validation for other types yet
        
        # Add errors to result
        for error in naming_errors + structure_errors:
            result.add_error(component_type, str(component.id), error['message'], error.get('field'))
        
        return result
    
    @staticmethod
    def validate_model(model: DataModel) -> ValidationResult:
        """Validate a complete Data Vault model"""
        validator = DataVaultModelValidator()
        return validator.validate_model(model)
    
    @staticmethod
    def validate_connection(source_node: Node, target_node: Node) -> ValidationResult:
        """Validate a connection between two nodes"""
        result = ValidationResult()
        
        # TODO: Implement connection validation rules
        # - Satellites can only connect to hubs or links
        # - Hubs cannot connect to other hubs directly
        # - etc.
        
        return result 