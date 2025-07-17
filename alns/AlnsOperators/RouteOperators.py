import random
from AlnsOperators.Operators import RouteOperator
from AlnsObjects.Solution import Solution

class randomRouteRemovalOperator(RouteOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Random Route Removal Operator"
        self.score = score
    
    def __str__(self):
        return "Random Route Removal Operator"

    def resetScore(self):
        self.score=0.0
    def remove(self, solution: Solution):
        W = self.routeToBeRemoved(solution)
        routes = solution.routes
        
        # rotalar arasından rastgele bir rota kaldırılacak olarak seçilir
        routes_to_remove = random.sample(routes, int(W))
        # ardından bu rotadaki her müşteri kaldırılıp tek tek unserved listesine eklenir
        for route in routes_to_remove:
            customers = route.get_customers()
            for customer in customers:
                solution.unserved_customers.append(customer)
                solution.remove_w_id_served(customer)
            routes.remove(route)
        
        solution.removeEmptyRoutes()
        
        return solution


class greedyRouteRemovalOperator(RouteOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Greedy Route Removal Operator"
        self.score = score
    
    def __str__(self):
        return "Greedy Route Removal Operator"    
    
    def resetScore(self):
        self.score=0.0
    
    def remove(self, solution: Solution):
        W = self.routeToBeRemoved(solution)
        routes_to_remove = []
        routesByCustomerNum = {}

        # rotalarda bulunan müşteri sayıları 
        for i in range(len(solution.routes)):
            routesByCustomerNum[i] = len(solution.routes[i].get_customers())
        
        # sort edilmiş halini alıyoruz ()
        sorted_routes = sorted(
            routesByCustomerNum.items(), key=lambda x: x[1], reverse=False
        )  
        # W adet minimum müşteriye sahip rota seçilir 
        removed_greedy_routes = sorted_routes[:W]
        
        # kaç adet rota varsa hepsi routes_to_remove listesine eklenir
        for route in removed_greedy_routes:
            routes_to_remove.append(solution.routes[route[0]])

        # kaldırılacaklar listemizdeki tüm rotalar incelenir
        for route in routes_to_remove:
            # rota içerisindeki tüm customerlar tek tek kaldırılır 
            # ve unserved listesine eklenir
            for customer in route.get_customers():
                solution.unserved_customers.append(customer)
                solution.remove_w_id_served(customer)
            solution.routes.remove(route)

        solution.removeEmptyRoutes()
        
        return solution
