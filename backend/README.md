# DVW Backend

Backend API for the DataVault Modeler application.

## Setup

1. Install dependencies:
   ```bash
   poetry install
   ```

2. Run migrations:
   ```bash
   poetry run python manage.py migrate
   ```

3. Start the development server:
   ```bash
   poetry run python manage.py runserver
   ```

## Development

This is a Django-based backend with Django REST Framework for API endpoints. 