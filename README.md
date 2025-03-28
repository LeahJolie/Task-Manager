# Task Management System

A full-stack task management application built with React and Flask.

## Features

- User authentication (login/register)
- Task management (create, edit, delete, mark as complete)
- Category management with color coding
- Priority levels for tasks
- Due dates for tasks
- Admin dashboard with statistics
- User management
- Contact form with admin message management
- Responsive design

## Prerequisites

- Python 3.8 or higher
- Node.js 14.0 or higher
- npm (Node Package Manager)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd task_manager/backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd task_manager/frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend Server

1. Make sure you're in the backend directory and your virtual environment is activated
2. Run the Flask server:
```bash
python app.py
```
The backend server will start on http://localhost:5000

### Start the Frontend Development Server

1. Open a new terminal
2. Navigate to the frontend directory:
```bash
cd task_manager/frontend
```
3. Start the React development server:
```bash
npm start
```
The frontend application will start on http://localhost:3000

## Default Admin Account

The first user to register will automatically become an admin. Admin users have access to:
- Admin Dashboard
- User Management
- Contact Messages Management

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - Login user
- POST `/api/logout` - Logout user

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create a new task
- GET `/api/tasks/<id>` - Get task details
- PUT `/api/tasks/<id>` - Update task
- DELETE `/api/tasks/<id>` - Delete task

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Create a new category
- PUT `/api/categories/<id>` - Update category
- DELETE `/api/categories/<id>` - Delete category

### Admin
- GET `/api/admin/users` - Get all users (admin only)
- GET `/api/admin/stats` - Get admin statistics (admin only)
- GET `/api/admin/messages` - Get contact messages (admin only)
- PUT `/api/admin/messages/<id>/read` - Mark message as read (admin only)

## Technologies Used

### Backend
- Flask
- SQLAlchemy
- Flask-Login
- Flask-CORS
- Flask-Bcrypt

### Frontend
- React
- Material-UI
- React Router
- Formik & Yup
- Axios
- Chart.js
- Day.js

## Project Structure

```
task_manager/
├── README.md
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── instance/
│       └── tasks.db
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── README.md
```

## Git Setup

### Files to Ignore
The following files should not be committed to version control:

1. Backend:
   - `instance/tasks.db` (database file)
   - `venv/` (virtual environment directory)
   - `__pycache__/` (Python cache files)
   - `.env` (environment variables)

2. Frontend:
   - `node_modules/` (dependencies)
   - `package-lock.json` (dependency lock file)
   - `.env` (environment variables)
   - `build/` (production build)

### .gitignore
Create a `.gitignore` file in the root directory with the following content:

```gitignore
# Backend
instance/
venv/
__pycache__/
*.pyc
.env

# Frontend
node_modules/
package-lock.json
.env
build/
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 