from flask import Flask, g, render_template
from flask_assets import Environment, Bundle
from . import db


"""
    create flask application
"""
def create_app(config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config)
    db.init_app(app)
    
    assets = Environment(app)

    with app.app_context():
        # import parts of the application
        from .assets import compile_static_assets
        from .auth import bp as auth_blueprint
        from .entries import bp as entries_blueprint
        
        # register Blueprints
        app.register_blueprint(auth_blueprint)
        app.register_blueprint(entries_blueprint)
        
        # compile web assets
        compile_static_assets(assets)
    
    app.add_url_rule('/', endpoint='index') # dont know if need it

    return app
    
