import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'secretkey'
    DATABASE_URI = os.path.abspath('db.db')

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    DEBUG = True
    TESTING = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}