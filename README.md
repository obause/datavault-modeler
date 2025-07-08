# Data Vault Modeler

A browser-based tool for creating and managing Data Vault models (Hubs, Links, Satellites) with real-time collaboration capabilities.

## Features

- **Interactive Canvas**: Drag, drop, move, and delete nodes using React Flow
- **Data Vault Components**: Create Hub, Link, and Satellite nodes with proper styling
- **Persistence**: Save models to PostgreSQL via Django REST API
- **Real-time Updates**: Canvas state managed with Zustand
- **Modern Stack**: React 18, Django 5, PostgreSQL 16
- **Containerized**: Full Docker Compose setup for development

## Project Structure

```
datavault-modeler/
├── backend/                # Django REST API
│   ├── dvw_backend/        # Django settings and configuration
│   ├── modeler/            # Models, serializers, and views
│   └── manage.py
├── frontend/               # React application
│   └── dvw-frontend/       # Vite + React + TypeScript
│       ├── src/
│       │   ├── components/
│       │   ├── store/      # Zustand state management
│       │   └── App.tsx
│       └── package.json
├── docker/                 # Docker configuration
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── docker-compose.yml
└── .github/workflows/      # CI/CD pipelines
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- Poetry (for Python dependency management)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd datavault-modeler
   ```

2. **Backend Setup**
   ```bash
   cd backend
   poetry install
   poetry run python manage.py migrate
   poetry run python manage.py runserver 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend/dvw-frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api/models/

### Docker Setup

1. **Start all services**
   ```bash
   cd docker
   docker compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api/models/
   - Database: PostgreSQL on port 5432

## Usage

### Creating Data Vault Models

1. **Add Nodes**: Click "Add Hub", "Add Link", or "Add Satellite" to create nodes
2. **Connect Nodes**: Drag from one node to another to create edges
3. **Move Nodes**: Drag nodes around the canvas to organize your model
4. **Save Model**: Click "Save Model" to persist your work

### Node Types

- **Hub (Blue)**: Central business keys
- **Link (Green)**: Relationships between hubs
- **Satellite (Orange)**: Descriptive data attached to hubs or links

## API Endpoints

- `GET /api/models/` - List all models
- `POST /api/models/` - Create a new model
- `GET /api/models/{id}/` - Get model details
- `PUT /api/models/{id}/` - Update model
- `DELETE /api/models/{id}/` - Delete model

## Testing

### Backend Tests
```bash
cd backend
poetry run python manage.py test
```

### Frontend Tests
```bash
cd frontend/dvw-frontend
npm test
```

### CI/CD
GitHub Actions automatically runs tests on push/PR:
- Backend: Django tests with PostgreSQL
- Frontend: Vitest unit tests
- Docker: Build and integration tests

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type safety
- **React Flow**: Interactive node-based UI
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool
- **Vitest**: Testing framework

### Backend
- **Django 5**: Web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database
- **Poetry**: Dependency management
- **pytest**: Testing framework

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration
- **GitHub Actions**: CI/CD
- **pre-commit**: Code quality hooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test` and `poetry run pytest`
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Roadmap

- [ ] Custom node types with form validation
- [ ] Real-time collaboration with WebSockets
- [ ] Export to SQL DDL
- [ ] Import from existing schemas
- [ ] Model versioning and history
- [ ] Advanced validation rules
- [ ] Plugin system for custom components

## Support

For issues and feature requests, please use the GitHub issue tracker.