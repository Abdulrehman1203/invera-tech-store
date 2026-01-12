# E-Commerce Store

A full-stack e-commerce application built with Django REST Framework and React.

## 🛠️ Tech Stack

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - RESTful API development
- **JWT Authentication** - Secure token-based authentication
- **SQLite** - Database (development)

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 📁 Project Structure

```
ecommerce_store/
├── backend/
│   ├── config/          # Django settings & configuration
│   ├── core/            # User authentication & management
│   ├── shop/            # Product management
│   ├── orders/          # Order processing
│   ├── media/           # Uploaded product images
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/         # API service functions
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context providers
│   │   └── pages/       # Page components
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔑 Features

- **User Authentication**: Registration, login/logout with JWT tokens
- **Product Catalog**: Browse products with categories and search
- **Shopping Cart**: Add/remove items, quantity management
- **Order Management**: Place orders and track order history
- **Admin Dashboard**: Manage products, orders, and users (superuser only)
- **Responsive Design**: Mobile-friendly interface

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Products
- `GET /api/shop/products/` - List all products
- `GET /api/shop/products/:id/` - Product details
- `GET /api/shop/categories/` - List categories

### Orders
- `GET /api/orders/` - User's orders
- `POST /api/orders/` - Create new order
- `GET /api/orders/:id/` - Order details

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd ecommerce_store

# Copy environment template
cp .env.example .env
# Edit .env with your settings

# Build and start all services
docker-compose up --build

# Run migrations (first time only)
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

### Docker Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build

# Remove volumes (clean database)
docker-compose down -v
```

### Services

| Service  | Port | Description           |
|----------|------|-----------------------|
| frontend | 80   | React app with Nginx  |
| backend  | 8000 | Django REST API       |
| db       | 5432 | PostgreSQL (internal) |

## 🚀 Populating Sample Data

After setting up with Docker, populate the database with sample products:

```bash
# Assign local product images to products
docker-compose exec backend python manage.py assign_local_images
```

This will map 40 products to their respective images from the `backend/media/products/` directory.

## 📦 GitHub Repository Setup

### Cloning the Repository

```bash
git clone <your-repository-url>
cd ecommerce_store
```

### Initial Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your settings** (never commit this file!)

3. **Start the application:**
   ```bash
   docker-compose up --build -d
   ```

4. **Run migrations and setup:**
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   docker-compose exec backend python manage.py assign_local_images
   ```

### Project Structure

```
ecommerce_store/
├── backend/              # Django REST API
├── frontend/             # React application
├── docker-compose.yml    # Docker orchestration
├── .gitignore           # Git ignore rules
├── .env.example         # Environment template
└── README.md            # This file
```

## 📝 License

This project is a commercial application developed for client use.

