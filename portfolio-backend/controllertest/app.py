from flask import Flask, jsonify
from controllertest.portfolios.routes import portfolio_bp
from repository.Portfolio_Repository import Portfolio_Repository


Portfolio_Repository.migrate_portfolio_items_schema()

app = Flask(__name__)
app.register_blueprint(portfolio_bp)


@app.route('/')
def hello_TAP():
    return jsonify("Welcome CSF Portfolio")


if __name__ == "__main__":
    app.run()

