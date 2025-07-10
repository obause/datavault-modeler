#!/bin/bash

# This script creates a Django superuser using environment variables or interactive prompt.

# Activate poetry shell if not already in it
if [ -f "pyproject.toml" ]; then
    POETRY_CMD="poetry run"
else
    POETRY_CMD=""
fi

echo "Creating Django superuser..."

$POETRY_CMD python manage.py createsuperuser
