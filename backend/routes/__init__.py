"""路由模块初始化"""
from .users import users_bp
from .artworks import artworks_bp
from .creations import creations_bp

__all__ = ['users_bp', 'artworks_bp', 'creations_bp']
