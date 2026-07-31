from repository.Portfolio_Repository import Portfolio_Repository


class Portfolio_Service:

    @staticmethod
    def get_all_portfolio_items():
        return Portfolio_Repository.get_all_portfolio_items()

    @staticmethod
    def create_portfolio_item(data):
        return Portfolio_Repository.create_portfolio_item(data)

    @staticmethod
    def update_portfolio_item(item_id, data):
        return Portfolio_Repository.update_portfolio_item(item_id, data)


if __name__ == "__main__":
    print(Portfolio_Service.get_all_portfolio_items())
