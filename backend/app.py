from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, current_user, logout_user, login_required
from flask_cors import CORS
from datetime import datetime, timedelta
from functools import wraps

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-goes-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
CORS(app)

# Models
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)
    tasks = db.relationship('Task', backref='owner', lazy=True)
    categories = db.relationship('Category', backref='owner', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.String(10), default="Medium")  # Low, Medium, High
    due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(7), default="#007bff")  # Hex color code
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tasks = db.relationship('Task', backref='category', lazy=True)

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            return jsonify({"message": "Admin privileges required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Username or email already exists"}), 400
    
    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Create new user
    user = User(username=data['username'], email=data['email'], password=hashed_password)
    
    # Make the first user an admin
    if User.query.count() == 0:
        user.is_admin = True
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin
        }), 200
    
    return jsonify({"message": "Invalid email or password"}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/user', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_admin": current_user.is_admin
    }), 200

# User profile routes
@app.route('/api/users/profile', methods=['GET'])
@login_required
def get_user_profile():
    # Count total tasks
    task_count = Task.query.filter_by(user_id=current_user.id).count()
    
    # Count completed tasks
    completed_task_count = Task.query.filter_by(user_id=current_user.id, completed=True).count()
    
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "date_joined": current_user.date_joined.isoformat(),
        "task_count": task_count,
        "completed_task_count": completed_task_count
    }), 200

@app.route('/api/users/profile', methods=['PUT'])
@login_required
def update_user_profile():
    data = request.get_json()
    
    # Validate username and email
    if 'username' in data and data['username'] != current_user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"username": "Username already exists"}), 400
        current_user.username = data['username']
    
    if 'email' in data and data['email'] != current_user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"email": "Email already exists"}), 400
        current_user.email = data['email']
    
    db.session.commit()
    
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_admin": current_user.is_admin
    }), 200

@app.route('/api/users/change-password', methods=['PUT'])
@login_required
def change_password():
    data = request.get_json()
    
    # Verify current password
    if not bcrypt.check_password_hash(current_user.password, data['current_password']):
        return jsonify({"current_password": "Current password is incorrect"}), 400
    
    # Hash and set new password
    hashed_password = bcrypt.generate_password_hash(data['new_password']).decode('utf-8')
    current_user.password = hashed_password
    
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"}), 200

# Task routes
@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "notes": task.notes,
        "completed": task.completed,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
        "category_id": task.category_id,
        "category": {
            "id": task.category.id,
            "name": task.category.name,
            "color": task.category.color
        } if task.category else None
    } for task in tasks]), 200

@app.route('/api/tasks', methods=['POST'])
@login_required
def create_task():
    data = request.get_json()
    
    # Validate priority
    valid_priorities = ['Low', 'Medium', 'High']
    priority = data.get('priority', 'Medium')
    if isinstance(priority, int):
        # Convert numeric priority to string
        priority_map = {1: 'Low', 2: 'Medium', 3: 'High'}
        priority = priority_map.get(priority, 'Medium')
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        priority=priority,
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
        user_id=current_user.id,
        category_id=data.get('category_id')
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "notes": task.notes,
        "completed": task.completed,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
        "category_id": task.category_id
    }), 201

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
@login_required
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    
    # Ensure user owns the task or is admin
    if task.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"message": "Not authorized"}), 403
    
    return jsonify({
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "notes": task.notes,
        "completed": task.completed,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
        "category_id": task.category_id,
        "category": {
            "id": task.category.id,
            "name": task.category.name,
            "color": task.category.color
        } if task.category else None,
        "created_by": {
            "id": task.owner.id,
            "username": task.owner.username
        }
    }), 200

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    
    # Ensure user owns the task or is admin
    if task.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"message": "Not authorized"}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    
    if 'description' in data:
        task.description = data['description']
    
    if 'notes' in data:
        task.notes = data['notes']
    
    if 'completed' in data:
        was_completed = task.completed
        task.completed = data['completed']
        
        # Update completed_at timestamp
        if not was_completed and task.completed:
            task.completed_at = datetime.utcnow()
        elif was_completed and not task.completed:
            task.completed_at = None
    
    if 'priority' in data:
        valid_priorities = ['Low', 'Medium', 'High']
        priority = data['priority']
        if isinstance(priority, int):
            # Convert numeric priority to string
            priority_map = {1: 'Low', 2: 'Medium', 3: 'High'}
            priority = priority_map.get(priority, 'Medium')
        
        if priority in valid_priorities:
            task.priority = priority
    
    if 'due_date' in data and data['due_date']:
        task.due_date = datetime.fromisoformat(data['due_date'])
    elif 'due_date' in data and data['due_date'] is None:
        task.due_date = None
    
    if 'category_id' in data:
        task.category_id = data['category_id']
    
    # Update the updated_at timestamp
    task.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "notes": task.notes,
        "completed": task.completed,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
        "category_id": task.category_id
    }), 200

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    
    # Ensure user owns the task or is admin
    if task.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"message": "Not authorized"}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({"message": "Task deleted successfully"}), 200

# Category routes
@app.route('/api/categories', methods=['GET'])
@login_required
def get_categories():
    categories = Category.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        "id": category.id,
        "name": category.name,
        "color": category.color,
        "task_count": len(category.tasks)
    } for category in categories]), 200

@app.route('/api/categories', methods=['POST'])
@login_required
def create_category():
    data = request.get_json()
    
    category = Category(
        name=data['name'],
        color=data.get('color', "#007bff"),
        user_id=current_user.id
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({
        "id": category.id,
        "name": category.name,
        "color": category.color
    }), 201

@app.route('/api/categories/<int:category_id>', methods=['PUT'])
@login_required
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    
    # Ensure user owns the category or is admin
    if category.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"message": "Not authorized"}), 403
    
    data = request.get_json()
    
    category.name = data.get('name', category.name)
    category.color = data.get('color', category.color)
    
    db.session.commit()
    
    return jsonify({
        "id": category.id,
        "name": category.name,
        "color": category.color
    }), 200

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@login_required
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    
    # Ensure user owns the category or is admin
    if category.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"message": "Not authorized"}), 403
    
    # Check if category has tasks
    if category.tasks:
        return jsonify({"message": "Cannot delete category with tasks"}), 400
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({"message": "Category deleted successfully"}), 200

# Admin routes
@app.route('/api/admin/users', methods=['GET'])
@login_required
@admin_required
def get_all_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin,
        "date_joined": user.date_joined.isoformat(),
        "task_count": len(user.tasks),
        "completed_task_count": len([task for task in user.tasks if task.completed])
    } for user in users]), 200

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@login_required
@admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    
    # Prevent admin from changing their own status
    if user.id == current_user.id:
        return jsonify({"message": "You cannot change your own admin status"}), 400
    
    data = request.get_json()
    
    if 'is_admin' in data:
        user.is_admin = data['is_admin']
    
    db.session.commit()
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }), 200

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        return jsonify({"message": "You cannot delete your own account"}), 400
    
    # Delete all tasks and categories associated with the user
    Task.query.filter_by(user_id=user.id).delete()
    Category.query.filter_by(user_id=user.id).delete()
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"message": "User deleted successfully"}), 200

@app.route('/api/admin/stats', methods=['GET'])
@login_required
@admin_required
def get_admin_stats():
    # Get task status distribution
    active_count = Task.query.filter_by(completed=False).count()
    completed_count = Task.query.filter_by(completed=True).count()
    
    status_distribution = [
        {"status": 0, "label": "Active", "count": active_count},
        {"status": 2, "label": "Completed", "count": completed_count}
    ]
    
    # Get user growth over time (last 6 months)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    months = []
    
    for i in range(6):
        month_start = six_months_ago + timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)
        month_name = month_start.strftime("%b")
        
        count = User.query.filter(
            User.date_joined >= month_start,
            User.date_joined < month_end
        ).count()
        
        months.append({
            "month": month_name,
            "count": count
        })
    
    return jsonify({
        "status_distribution": status_distribution,
        "user_growth": months
    }), 200

# Contact Message routes
@app.route('/api/contact', methods=['POST'])
def create_contact_message():
    data = request.get_json()
    
    message = ContactMessage(
        name=data['name'],
        email=data['email'],
        subject=data['subject'],
        message=data['message']
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        "message": "Message sent successfully"
    }), 201

@app.route('/api/admin/messages', methods=['GET'])
@login_required
@admin_required
def get_contact_messages():
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([{
        "id": msg.id,
        "name": msg.name,
        "email": msg.email,
        "subject": msg.subject,
        "message": msg.message,
        "created_at": msg.created_at.isoformat(),
        "is_read": msg.is_read
    } for msg in messages]), 200

@app.route('/api/admin/messages/<int:message_id>/read', methods=['PUT'])
@login_required
@admin_required
def mark_message_read(message_id):
    message = ContactMessage.query.get_or_404(message_id)
    message.is_read = True
    db.session.commit()
    return jsonify({"message": "Message marked as read"}), 200

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True) 