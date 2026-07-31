from repository.Portfolio_Repository import Portfolio_Repository
from models.portfolio import Portfolio
class Portfolio_Service:
    
    @staticmethod
    def get_all_portfolio_items():
        return Portfolio_Repository.get_all_portfolio_items()
    
    
if __name__ == "__main__":
    print(Portfolio_Service.get_all_portfolio_items())
