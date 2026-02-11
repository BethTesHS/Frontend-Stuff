from flask import Flask, send_from_directory, send_file
import os

# When deployed, server.py is inside the build folder, so '.' is the static folder
app = Flask(__name__, static_folder='.')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_file(os.path.join(app.static_folder, 'index.html'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
