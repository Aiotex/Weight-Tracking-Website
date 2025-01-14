import os
from app import create_app
from dotenv import load_dotenv
from config import config

load_dotenv(override=True)

config = config[os.getenv('FLASK_ENV') or 'default']
app = create_app(config)

if __name__ == '__main__':
    app.run(port=os.getenv('PORT'))
