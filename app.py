from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/api/greet/<name>')
def greet(name):
    return {'message': f'Hello, {name}!'}

if __name__ == '__main__':
    app.run(debug=True)
