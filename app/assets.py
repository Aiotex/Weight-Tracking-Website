from flask import current_app as app
from flask_assets import Bundle


"""
    Create CSS stylesheet bundles from .sass files
"""
    
def compile_static_assets(assets):
    assets.autobuild = True
    assets.debug = False
    
    common_style_bundle = Bundle(
        "src/sass/*.sass",
        filters="libsass,cssmin",
        output="dist/css/style.css",
    )
    
    assets.register("common_style_bundle", common_style_bundle)