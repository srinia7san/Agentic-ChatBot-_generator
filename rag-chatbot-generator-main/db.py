"""
MongoDB Database Connection Utility
"""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# MongoDB connection string (uses same DB as auth-server by default)
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/chatbot-generator')

# Global client instance
_client = None
_db = None


def get_database():
    """Get MongoDB database instance"""
    global _client, _db
    
    if _db is not None:
        return _db
    
    try:
        _client = MongoClient(MONGODB_URI)
        # Test connection
        _client.admin.command('ping')
        
        # Parse database name from URI or use default
        db_name = MONGODB_URI.split('/')[-1].split('?')[0] or 'chatbot-generator'
        _db = _client[db_name]
        
        print(f"[OK] Connected to MongoDB: {db_name}")
        return _db
    except ConnectionFailure as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        print("[WARN] Falling back to in-memory storage")
        return None


def get_agents_collection():
    """Get agents collection"""
    db = get_database()
    if db is None:
        return None
    return db['agents']


def get_token_usage_collection():
    """Get token usage collection for tracking per-query token consumption"""
    db = get_database()
    if db is None:
        return None
    return db['token_usage']


def get_users_collection():
    """Get users collection (same as auth-server)"""
    db = get_database()
    if db is None:
        return None
    return db['users']


def get_embed_tokens_collection():
    """Get embed tokens collection for secure token management"""
    db = get_database()
    if db is None:
        return None
    return db['embed_tokens']


def close_connection():
    """Close MongoDB connection"""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None


# Alias for convenience
def get_db():
    """Alias for get_database()"""
    return get_database()

