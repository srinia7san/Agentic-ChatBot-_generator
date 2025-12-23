from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from rag_agent_system import RAGAgentSystem
from db import get_users_collection, get_db
from api_helpers import api_success, api_error, ErrorCodes, add_rate_limit_headers
from token_manager import TokenManager
import os
import json
import jwt
import time
from werkzeug.utils import secure_filename
from functools import wraps

app = Flask(__name__)
CORS(app, origins=['*'])  # Allow all origins for embed widget

# JWT Secret - MUST match the one in auth-server/.env
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')

# Initialize RAG system
rag_system = RAGAgentSystem()

# Initialize Token Manager
db = get_db()
token_manager = TokenManager(db) if db is not None else None

# Upload folder for PDFs
UPLOAD_FOLDER = './uploads'
WIDGET_FOLDER = './widget'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(WIDGET_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def verify_jwt(f):
    """JWT verification decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                "success": False,
                "error": "No token provided. Please login."
            }), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user_id = decoded.get('id')
            if not request.user_id:
                return jsonify({
                    "success": False,
                    "error": "Invalid token payload"
                }), 401
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "Token expired. Please login again."
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "error": "Invalid token. Please login."
            }), 401
        
        return f(*args, **kwargs)
    return decorated_function


def verify_admin(f):
    """Admin verification decorator - requires JWT + admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                "success": False,
                "error": "No token provided. Please login."
            }), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = decoded.get('id')
            if not user_id:
                return jsonify({
                    "success": False,
                    "error": "Invalid token payload"
                }), 401
            
            # Check if user is admin in MongoDB
            users_collection = get_users_collection()
            if users_collection is None:
                return jsonify({
                    "success": False,
                    "error": "Database not available"
                }), 500
            
            from bson.objectid import ObjectId
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            
            if not user or not user.get('isAdmin', False):
                return jsonify({
                    "success": False,
                    "error": "Admin access required"
                }), 403
            
            request.user_id = user_id
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "Token expired. Please login again."
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "error": "Invalid token. Please login."
            }), 401
        
        return f(*args, **kwargs)
    return decorated_function


def validate_embed_token(f):
    """
    Embed token validation decorator
    Validates token, checks domain, rate limit, and quota
    """
    @wraps(f)
    def decorated_function(token, *args, **kwargs):
        # Get origin for domain validation
        origin = request.headers.get('Origin') or request.headers.get('Referer', '')
        
        # Use new TokenManager if available, fallback to old system
        if token_manager:
            validation = token_manager.validate_token(token, origin)
            
            if not validation.get("valid"):
                return api_error(
                    validation.get("error_code", ErrorCodes.INVALID_TOKEN),
                    validation.get("error_message", "Invalid token"),
                    404 if validation.get("error_code") == ErrorCodes.INVALID_TOKEN else 
                    429 if "QUOTA" in validation.get("error_code", "") or "RATE" in validation.get("error_code", "") else 403
                )
            
            # Check rate limit (in-memory, per-minute)
            token_data = validation.get("token", {})
            rate_limit = token_data.get("rate_limit", 20)
            
            if not rag_system.check_rate_limit(token):
                rate_info = rag_system.get_embed_rate_limit_info(token)
                return api_error(
                    ErrorCodes.RATE_LIMIT_EXCEEDED,
                    f"Rate limit of {rate_limit} requests per minute exceeded",
                    429,
                    metadata={"rate_limit": rate_info}
                )
            
            # Store token data for use in endpoint
            request.token_data = token_data
            request.agent_key = token_data.get("agent_key")
            
            # Increment usage counter
            token_manager.increment_usage(token)
        else:
            # Fallback to old system (no advanced security)
            agent_info = rag_system.get_agent_by_embed_token(token)
            if not agent_info:
                return api_error(
                    ErrorCodes.INVALID_TOKEN,
                    "Invalid or disabled embed token",
                    404
                )
            
            if not rag_system.check_rate_limit(token):
                return api_error(
                    ErrorCodes.RATE_LIMIT_EXCEEDED,
                    "Rate limit exceeded. Please try again later.",
                    429
                )
            
            request.token_data = None
            request.agent_key = None
        
        return f(token, *args, **kwargs)
    return decorated_function


# ==================== PUBLIC ENDPOINTS ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "RAG Agent System API is running",
        "total_agents": len(rag_system.agents)
    })


@app.route('/widget.js', methods=['GET'])
def serve_widget():
    """Serve the embeddable widget JavaScript"""
    return send_from_directory(WIDGET_FOLDER, 'widget.js', mimetype='application/javascript')


@app.route('/v1/embed/<token>/query', methods=['POST', 'OPTIONS'])
@app.route('/embed/<token>/query', methods=['POST', 'OPTIONS'])  # Legacy route
def embed_query(token):
    """Public endpoint for embed widget queries (no JWT needed)"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        query = data['query']
        
        result = rag_system.query_by_embed_token(token, query)
        
        if result.get("rate_limited"):
            return jsonify(result), 429
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 404
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/v1/embed/<token>/info', methods=['GET'])
@app.route('/embed/<token>/info', methods=['GET'])  # Legacy route
def embed_info(token):
    """Get agent info for embed widget"""
    agent_info = rag_system.get_agent_by_embed_token(token)
    
    if agent_info:
        return jsonify({
            "success": True,
            "agent_name": agent_info["agent_name"],
            "domain": agent_info["domain"],
            "description": agent_info["description"]
        })
    return jsonify({
        "success": False,
        "error": "Invalid embed token"
    }), 404


# ==================== BACKEND-ONLY WIDGET API ====================
# These endpoints allow users to build their own UI with full customization

@app.route('/v1/embed/<token>/config', methods=['GET'])
@app.route('/embed/<token>/config', methods=['GET'])  # Legacy route
def embed_config(token):
    """
    Get widget configuration for custom implementations.
    Returns styling options, rate limits, and feature flags.
    """
    agent_info = rag_system.get_agent_by_embed_token(token)
    
    if not agent_info:
        return jsonify({
            "success": False,
            "error": "Invalid embed token"
        }), 404
    
    # Get rate limit info
    rate_limit_info = rag_system.get_embed_rate_limit_info(token)
    
    return jsonify({
        "success": True,
        "config": {
            "agent": {
                "name": agent_info["agent_name"],
                "domain": agent_info["domain"],
                "description": agent_info["description"],
                "created_at": agent_info.get("created_at")
            },
            "features": {
                "streaming": False,
                "file_upload": False,
                "voice_input": False,
                "feedback": True,
                "conversation_history": True
            },
            "rate_limit": rate_limit_info,
            "ui_hints": {
                "placeholder": f"Ask about {agent_info['domain'] or 'anything'}...",
                "welcome_message": f"Hi! I'm {agent_info['agent_name']}. How can I help you today?",
                "suggested_questions": []
            }
        }
    })


@app.route('/v1/embed/<token>/conversation', methods=['GET'])
@app.route('/embed/<token>/conversation', methods=['GET'])  # Legacy route
def get_conversation(token):
    """Get conversation history hints for a session."""
    agent_info = rag_system.get_agent_by_embed_token(token)
    
    if not agent_info:
        return jsonify({
            "success": False,
            "error": "Invalid embed token"
        }), 404
    
    return jsonify({
        "success": True,
        "message": "Conversation history is managed client-side",
        "storage_hint": "localStorage",
        "key_format": f"agentic_chat_{token}_history"
    })


@app.route('/v1/embed/<token>/conversation', methods=['DELETE'])
@app.route('/embed/<token>/conversation', methods=['DELETE'])  # Legacy route
def clear_conversation(token):
    """Signal to clear conversation."""
    agent_info = rag_system.get_agent_by_embed_token(token)
    
    if not agent_info:
        return jsonify({
            "success": False,
            "error": "Invalid embed token"
        }), 404
    
    return jsonify({
        "success": True,
        "message": "Conversation cleared",
        "action": "Client should clear localStorage"
    })


@app.route('/v1/embed/<token>/feedback', methods=['POST'])
@app.route('/embed/<token>/feedback', methods=['POST'])  # Legacy route
def submit_feedback(token):
    """Submit feedback for a message (thumbs up/down)."""
    agent_info = rag_system.get_agent_by_embed_token(token)
    
    if not agent_info:
        return jsonify({
            "success": False,
            "error": "Invalid embed token"
        }), 404
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Feedback data required"
            }), 400
        
        feedback_type = data.get('type')
        if feedback_type not in ['positive', 'negative']:
            return jsonify({
                "success": False,
                "error": "Feedback type must be 'positive' or 'negative'"
            }), 400
        
        result = rag_system.store_embed_feedback(
            token=token,
            message_id=data.get('message_id'),
            feedback_type=feedback_type,
            comment=data.get('comment', '')
        )
        
        return jsonify({
            "success": True,
            "message": "Feedback recorded",
            "feedback_id": result.get("feedback_id")
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/v1/embed/<token>/analytics', methods=['POST'])
@app.route('/embed/<token>/analytics', methods=['POST'])  # Legacy route
def track_analytics(token):
    """Track widget analytics events."""
    agent_info = rag_system.get_agent_by_embed_token(token)
    
    if not agent_info:
        return jsonify({
            "success": False,
            "error": "Invalid embed token"
        }), 404
    
    try:
        data = request.get_json()
        rag_system.track_embed_analytics(
            token=token,
            event_type=data.get('event'),
            event_data=data.get('data', {})
        )
        
        return jsonify({
            "success": True,
            "message": "Event tracked"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500



# ==================== PROTECTED ENDPOINTS ====================

@app.route('/agents', methods=['GET'])
@verify_jwt
def get_agents():
    """Get all agents for the authenticated user"""
    user_id = request.user_id
    agents = rag_system.list_agents(user_id=user_id)
    return jsonify({
        "success": True,
        "count": len(agents),
        "agents": agents
    })


@app.route('/user/stats', methods=['GET'])
@verify_jwt
def get_user_stats():
    """Get current user's token usage statistics"""
    user_id = request.user_id
    
    # Get token usage for this user
    usage = rag_system.get_user_token_usage(user_id)
    
    if usage:
        stats = usage[0]  # First (and only) result for this user
        return jsonify({
            "success": True,
            "stats": {
                "total_queries": stats.get("total_queries", 0),
                "total_prompt_tokens": stats.get("total_prompt_tokens", 0),
                "total_completion_tokens": stats.get("total_completion_tokens", 0),
                "total_tokens": stats.get("total_tokens", 0),
                "last_query": stats.get("last_query").isoformat() if stats.get("last_query") else None
            }
        })
    else:
        return jsonify({
            "success": True,
            "stats": {
                "total_queries": 0,
                "total_prompt_tokens": 0,
                "total_completion_tokens": 0,
                "total_tokens": 0,
                "last_query": None
            }
        })


@app.route('/agents/<agent_name>', methods=['GET'])
@verify_jwt
def get_agent(agent_name):
    """Get specific agent information"""
    user_id = request.user_id
    agent_info = rag_system.get_agent_info(agent_name, user_id)
    if agent_info:
        return jsonify({
            "success": True,
            "agent": agent_info
        })
    return jsonify({
        "success": False,
        "error": "Agent not found or access denied"
    }), 404


@app.route('/agents/<agent_name>/embed-token', methods=['POST'])
@verify_jwt
def generate_embed_token(agent_name):
    """Generate or get embed token for an agent"""
    user_id = request.user_id
    result = rag_system.generate_embed_token(agent_name, user_id)
    
    if result["success"]:
        return jsonify(result)
    else:
        return jsonify(result), 400


@app.route('/agents/create', methods=['POST'])
@verify_jwt
def create_agent():
    """Create a new agent for the authenticated user"""
    try:
        user_id = request.user_id
        
        # Check if files are present
        if 'files' not in request.files:
            return jsonify({
                "success": False,
                "error": "No PDF files provided"
            }), 400
        
        files = request.files.getlist('files')
        agent_name = request.form.get('agent_name')
        domain = request.form.get('domain', '')
        description = request.form.get('description', '')
        
        if not agent_name:
            return jsonify({
                "success": False,
                "error": "Agent name is required"
            }), 400
        
        if not files:
            return jsonify({
                "success": False,
                "error": "At least one PDF file is required"
            }), 400
        
        # Save uploaded files
        pdf_paths = []
        for file in files:
            if file and file.filename.endswith('.pdf'):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{user_id}_{filename}")
                file.save(filepath)
                pdf_paths.append(filepath)
        
        if not pdf_paths:
            return jsonify({
                "success": False,
                "error": "No valid PDF files provided"
            }), 400
        
        # Create agent with user_id
        result = rag_system.create_agent(
            agent_name=agent_name,
            pdf_paths=pdf_paths,
            user_id=user_id,
            description=description,
            domain=domain
        )
        
        # Clean up uploaded files
        for path in pdf_paths:
            try:
                os.remove(path)
            except:
                pass
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/agents/create-from-source', methods=['POST'])
@verify_jwt
def create_agent_from_source():
    """Create a new agent from various data sources (CSV, Word, SQL, NoSQL)"""
    try:
        user_id = request.user_id
        
        # Get source type
        source_type = request.form.get('source_type', 'pdf')
        agent_name = request.form.get('agent_name')
        domain = request.form.get('domain', '')
        description = request.form.get('description', '')
        
        if not agent_name:
            return jsonify({
                "success": False,
                "error": "Agent name is required"
            }), 400
        
        source_config = {}
        
        # Handle file-based sources (pdf, csv, word)
        if source_type in ['pdf', 'csv', 'word']:
            if 'files' not in request.files:
                return jsonify({
                    "success": False,
                    "error": f"No files provided for {source_type} source"
                }), 400
            
            files = request.files.getlist('files')
            if not files:
                return jsonify({
                    "success": False,
                    "error": f"At least one file is required"
                }), 400
            
            # Validate file extensions
            valid_extensions = {
                'pdf': ['.pdf'],
                'csv': ['.csv'],
                'word': ['.docx', '.doc']
            }
            
            file_paths = []
            for file in files:
                if file and file.filename:
                    ext = os.path.splitext(file.filename)[1].lower()
                    if ext in valid_extensions.get(source_type, []):
                        filename = secure_filename(file.filename)
                        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{user_id}_{filename}")
                        file.save(filepath)
                        file_paths.append(filepath)
            
            if not file_paths:
                return jsonify({
                    "success": False,
                    "error": f"No valid {source_type.upper()} files provided"
                }), 400
            
            source_config = {'file_paths': file_paths}
            
        # Handle SQL source
        elif source_type == 'sql':
            connection_string = request.form.get('connection_string', '')
            tables_json = request.form.get('tables', '')
            sample_limit = int(request.form.get('sample_limit', 1000))
            
            if not connection_string:
                return jsonify({
                    "success": False,
                    "error": "SQL connection string is required"
                }), 400
            
            tables = None
            if tables_json:
                try:
                    tables = json.loads(tables_json)
                except:
                    pass
            
            source_config = {
                'connection_string': connection_string,
                'tables': tables,
                'sample_limit': sample_limit
            }
            
        # Handle NoSQL (MongoDB) source
        elif source_type == 'nosql':
            connection_string = request.form.get('connection_string', '')
            database = request.form.get('database', '')
            collections_json = request.form.get('collections', '')
            sample_limit = int(request.form.get('sample_limit', 1000))
            
            if not connection_string or not database:
                return jsonify({
                    "success": False,
                    "error": "MongoDB connection string and database name are required"
                }), 400
            
            collections = None
            if collections_json:
                try:
                    collections = json.loads(collections_json)
                except:
                    pass
            
            source_config = {
                'connection_string': connection_string,
                'database': database,
                'collections': collections,
                'sample_limit': sample_limit
            }
            
        else:
            return jsonify({
                "success": False,
                "error": f"Unsupported source type: {source_type}"
            }), 400
        
        # Create agent
        result = rag_system.create_agent_from_source(
            agent_name=agent_name,
            source_type=source_type,
            source_config=source_config,
            user_id=user_id,
            description=description,
            domain=domain
        )
        
        # Clean up uploaded files if any
        if 'file_paths' in source_config:
            for path in source_config['file_paths']:
                try:
                    os.remove(path)
                except:
                    pass
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/agents/<agent_name>/update', methods=['POST'])
@verify_jwt
def update_agent(agent_name):
    """Add more data to an existing agent"""
    try:
        user_id = request.user_id
        
        # Get source type
        source_type = request.form.get('source_type', 'pdf')
        
        source_config = {}
        
        # Handle file-based sources (pdf, csv, word)
        if source_type in ['pdf', 'csv', 'word']:
            if 'files' not in request.files:
                return jsonify({
                    "success": False,
                    "error": f"No files provided for {source_type} source"
                }), 400
            
            files = request.files.getlist('files')
            if not files:
                return jsonify({
                    "success": False,
                    "error": "At least one file is required"
                }), 400
            
            # Validate file extensions
            valid_extensions = {
                'pdf': ['.pdf'],
                'csv': ['.csv'],
                'word': ['.docx', '.doc']
            }
            
            file_paths = []
            for file in files:
                if file and file.filename:
                    ext = os.path.splitext(file.filename)[1].lower()
                    if ext in valid_extensions.get(source_type, []):
                        filename = secure_filename(file.filename)
                        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{user_id}_{filename}")
                        file.save(filepath)
                        file_paths.append(filepath)
            
            if not file_paths:
                return jsonify({
                    "success": False,
                    "error": f"No valid {source_type.upper()} files provided"
                }), 400
            
            source_config = {'file_paths': file_paths}
            
        # Handle SQL source
        elif source_type == 'sql':
            connection_string = request.form.get('connection_string', '')
            tables_json = request.form.get('tables', '')
            sample_limit = int(request.form.get('sample_limit', 1000))
            
            if not connection_string:
                return jsonify({
                    "success": False,
                    "error": "SQL connection string is required"
                }), 400
            
            tables = None
            if tables_json:
                try:
                    tables = json.loads(tables_json)
                except:
                    pass
            
            source_config = {
                'connection_string': connection_string,
                'tables': tables,
                'sample_limit': sample_limit
            }
            
        # Handle NoSQL (MongoDB) source
        elif source_type == 'nosql':
            connection_string = request.form.get('connection_string', '')
            database = request.form.get('database', '')
            collections_json = request.form.get('collections', '')
            sample_limit = int(request.form.get('sample_limit', 1000))
            
            if not connection_string or not database:
                return jsonify({
                    "success": False,
                    "error": "MongoDB connection string and database name are required"
                }), 400
            
            collections = None
            if collections_json:
                try:
                    collections = json.loads(collections_json)
                except:
                    pass
            
            source_config = {
                'connection_string': connection_string,
                'database': database,
                'collections': collections,
                'sample_limit': sample_limit
            }
            
        else:
            return jsonify({
                "success": False,
                "error": f"Unsupported source type: {source_type}"
            }), 400
        
        # Update agent with new data
        result = rag_system.update_agent_data(
            agent_name=agent_name,
            user_id=user_id,
            source_type=source_type,
            source_config=source_config
        )
        
        # Clean up uploaded files if any
        if 'file_paths' in source_config:
            for path in source_config['file_paths']:
                try:
                    os.remove(path)
                except:
                    pass
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/agents/<agent_name>/query', methods=['POST'])
@verify_jwt
def query_agent(agent_name):
    """Query an agent"""
    try:
        user_id = request.user_id
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        query = data['query']
        k = data.get('k', 4)
        
        result = rag_system.query_agent(
            agent_name=agent_name,
            user_id=user_id,
            query=query,
            k=k
        )
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 404
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/agents/<agent_name>', methods=['DELETE'])
@verify_jwt
def delete_agent(agent_name):
    """Delete an agent"""
    user_id = request.user_id
    result = rag_system.delete_agent(agent_name, user_id)
    
    if result["success"]:
        return jsonify(result)
    else:
        return jsonify(result), 404

# ==================== ADMIN ENDPOINTS ====================

@app.route('/admin/users', methods=['GET'])
@verify_admin
def admin_list_users():
    """Get all users with their token usage and bot counts (admin only)"""
    try:
        users_collection = get_users_collection()
        if users_collection is None:
            return jsonify({"success": False, "error": "Database not available"}), 500
        
        # Get all users
        users = list(users_collection.find({}, {"password": 0}))
        
        # Get token usage per user
        token_usage = rag_system.get_user_token_usage()
        usage_map = {u["_id"]: u for u in token_usage}
        
        # Get bot counts per user
        bot_counts = rag_system.get_agent_counts_by_user()
        
        result = []
        for user in users:
            user_id = str(user["_id"])
            usage = usage_map.get(user_id, {})
            result.append({
                "id": user_id,
                "name": user.get("name", "Unknown"),
                "email": user.get("email", ""),
                "isAdmin": user.get("isAdmin", False),
                "createdAt": user.get("createdAt").isoformat() if user.get("createdAt") else None,
                "bot_count": bot_counts.get(user_id, 0),
                "token_usage": {
                    "total_queries": usage.get("total_queries", 0),
                    "total_prompt_tokens": usage.get("total_prompt_tokens", 0),
                    "total_completion_tokens": usage.get("total_completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0),
                    "last_query": usage.get("last_query").isoformat() if usage.get("last_query") else None
                }
            })
        
        return jsonify({"success": True, "users": result})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/admin/usage', methods=['GET'])
@verify_admin
def admin_get_usage():
    """Get aggregated token usage statistics (admin only)"""
    try:
        usage = rag_system.get_user_token_usage()
        bot_counts = rag_system.get_agent_counts_by_user()
        
        # Calculate totals
        totals = {
            "total_users": len(usage),
            "total_bots": sum(bot_counts.values()),
            "total_queries": sum(u.get("total_queries", 0) for u in usage),
            "total_prompt_tokens": sum(u.get("total_prompt_tokens", 0) for u in usage),
            "total_completion_tokens": sum(u.get("total_completion_tokens", 0) for u in usage),
            "total_tokens": sum(u.get("total_tokens", 0) for u in usage)
        }
        
        return jsonify({
            "success": True,
            "totals": totals,
            "per_user": [{
                "user_id": u["_id"],
                "total_queries": u.get("total_queries", 0),
                "total_prompt_tokens": u.get("total_prompt_tokens", 0),
                "total_completion_tokens": u.get("total_completion_tokens", 0),
                "total_tokens": u.get("total_tokens", 0),
                "last_query": u.get("last_query").isoformat() if u.get("last_query") else None
            } for u in usage]
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/admin/usage/<user_id>', methods=['GET'])
@verify_admin
def admin_get_user_usage(user_id):
    """Get detailed token usage for a specific user (admin only)"""
    try:
        limit = request.args.get('limit', 50, type=int)
        usage = rag_system.get_detailed_token_usage(user_id, limit)
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "queries": usage
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("RAG AGENT SYSTEM - REST API SERVER")
    print("="*60)
    print(f"Server starting on http://localhost:5000")
    print(f"Total agents loaded: {len(rag_system.agents)}")
    print(f"Token Manager: {'Enabled' if token_manager else 'Disabled (fallback mode)'}")
    print("\nProtected Endpoints (JWT Required):")
    print("  GET    /agents                      - List user's agents")
    print("  GET    /agents/<name>               - Get agent info")
    print("  POST   /agents/create               - Create new agent")
    print("  POST   /agents/<name>/query         - Query agent")
    print("  POST   /agents/<name>/embed-token   - Generate embed token")
    print("  DELETE /agents/<name>               - Delete agent")
    print("\nPublic Endpoints (No Auth):")
    print("  GET    /health                      - Health check")
    print("  GET    /widget.js                   - Embed widget script")
    print("\nBackend-Only Widget API v1 (Versioned):")
    print("  GET    /v1/embed/<token>/info          - Get agent info")
    print("  POST   /v1/embed/<token>/query         - Query via token")
    print("  GET    /v1/embed/<token>/config        - Get widget config")
    print("  GET    /v1/embed/<token>/conversation  - Conversation hints")
    print("  DELETE /v1/embed/<token>/conversation  - Clear conversation")
    print("  POST   /v1/embed/<token>/feedback      - Submit feedback")
    print("  POST   /v1/embed/<token>/analytics     - Track events")
    print("\n" + "="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)