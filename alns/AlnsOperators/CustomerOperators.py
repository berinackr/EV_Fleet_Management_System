import copy
import random
from AlnsObjects.Route import Route
from AlnsOperators.Operators import CustomerInsertionOperator, CustomerRemovalOperator
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer
from AlnsObjects.Solution import Solution
from AlnsOperators.Operators import SwapOperator

# Customer removal operators
class removeRandomCustomerOperator(CustomerRemovalOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Remove Random Customer Operator"
        self.score = score
    def resetScore(self):
        self.score=0.0
    def remove(self, solution):
        P = int(self.customerToBeRemoved(solution))
        allCustomers = solution.served_customers
        customers_to_remove = random.sample(allCustomers, int(P))

        for route in solution.routes:
            for customer in customers_to_remove:
                if customer in route.route:
                    route.remove_customer_from_route(customer)


        for customer in customers_to_remove:
            solution.unserved_customers.append(customer)
            solution.remove_w_id_served(customer)

        solution.removeEmptyRoutes()
        return solution

class relatedCustomerRemovalOperator(CustomerRemovalOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Related Customer Removal Operator"
        self.score = score
    def resetScore(self):
        self.score=0.0
    def remove(self, solution):
        P = int(self.customerToBeRemoved(solution))
        allCustomers = solution.served_customers
        # tüm müşterileri döndüren bir fonksiyon yazılmalı rota ya da solution içinde
        seed_customer = random.choice(allCustomers)
        distances = {}

        for customer in allCustomers:
            if customer != seed_customer:
                # customer nesnesinin sahip olduğu distance fonksiyonu kullanılarak mesafe hesaplanıyor.
                distance = customer.distance_to(seed_customer)
                # mesafeler bir sözlükte tutuluyor.
                distances[customer] = distance

        # mesafelerin küçükten büyüğe sıralanması
        sorted_distances = dict(sorted(distances.items(), key=lambda item: item[1]))

        # sıralanmış mesafelerden P-1 tanesi seçiliyor.
        selected_customers = list(sorted_distances.keys())[: P - 1]
        for customer in selected_customers:
            solution.unserved_customers.append(customer)
            solution.remove_w_id_served(customer)

        for route in solution.routes:
            for customer in selected_customers:
                if customer in route.route:
                    route.remove_customer_from_route(customer)
        solution.removeEmptyRoutes()
        return solution

class leastTimeWindowCustomerRemovalOperator(CustomerRemovalOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Least Time Window Customer Removal Operator"
        self.score = score
    def resetScore(self):
        self.score=0.0
    def remove(self, solution):
        P = int(self.customerToBeRemoved(solution))
        allCustomers = solution.served_customers
        time_window_gaps = {}
        for customer in allCustomers:
            gap = customer.due_date - customer.ready_time
            time_window_gaps[customer] = gap

        # Sort customers based on time window gaps in ascending order
        sorted_customers = dict(
            sorted(time_window_gaps.items(), key=lambda item: item[1], reverse=False)
        )
        # Select the first P customers with the least time window gaps
        selected_customers = list(sorted_customers.keys())[:P]
        # Remove the selected customers from the routes
        for route in solution.routes:
            for customer in selected_customers:
                if customer in route.route:
                    route.remove_customer_from_route(customer)

        for customer in selected_customers:
            solution.unserved_customers.append(customer)
            solution.remove_w_id_served(customer)

        solution.removeEmptyRoutes()
        return solution

class worstDistanceCustomerRemovalOperator(CustomerRemovalOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Worst Distance Customer Removal Operator"
        self.score = score
    def resetScore(self):
        self.score=0.0
    def calculate_removal_gain(self, customer, current_solution):
        # Müşterinin çözümde olup olmamasının getirisini hesapla
        # Bu, müşteriyi çözümde bulundurmanın ve bulundurmamanın maliyet farkını içerir
        cost_with_customer = current_solution.calculate_obj_function()
        customerIndex = current_solution.find_item_index_in_solution(customer)
        # Müşteriyi geçici olarak çözümden çıkar
        current_solution.remove_customer_from_route(customer)
        cost_without_customer = current_solution.calculate_obj_function()

        # Removal gain hesapla
        removal_gain = cost_with_customer - cost_without_customer

        # Müşteriyi çözüme geri ekle
        current_solution.appendcustomer_at_certain_point(customer, customerIndex)

        return removal_gain

    def remove(self, solution):
        P = int(self.customerToBeRemoved(solution))
        allCustomers = solution.served_customers
        removal_gains = {}
        for route in solution.routes:
            for item in route.route:
                if type(item) is Customer:
                    removal_gains[item] = self.calculate_removal_gain(item, route)

        # Removal gain'e göre müşterileri sırala
        sorted_removal_gains = dict(
            sorted(removal_gains.items(), key=lambda x: x[1], reverse=True)
        )
        k=random.randint(0, 1)

        # İlk P müşteriyi çözümden çıkar
        removed_customers = [
            customer for customer in list(sorted_removal_gains.keys())[k:k+P]
        ]
        # Müşterileri çözümden çıkar
        for route in solution.routes:
            for customer in removed_customers:
                if customer in route.route:
                    route.remove_customer_from_route(customer)
                    solution.unserved_customers.append(customer)
                    solution.remove_w_id_served(customer)


        solution.removeEmptyRoutes()
        return solution

# Customer insertion operators
class greedyCustomerInsertionOperator(CustomerInsertionOperator):
    def __init__(self, stations=[], score=0.0):
        super().__init__()
        self.name = "Greedy Customer Insertion Operator"
        self.stations = stations
        self.score = score
    def resetScore(self):
        self.score=0.0

    def get_costs(self, customer, solution:Solution):
        costs = []  
        for route in solution.routes:
            # temp_route = copy.deepcopy(route)
            route_index = solution.routes.index(route)
            for i in range(1, len(route.route)):
                distance = route.route[i - 1].distance_to(route.route[i]) 
                route.route.insert(i, customer)
                if route.payload_capacity_constraint_violated() == True:
                    route.route.remove(customer)
                    # Eğer rotadaki bir noktaya koyduğunda payload sorun ise zaten her nokta için de payload sorunu olacaktır
                    # bu yüzden bu customer bu rotaya eklenemez, burada break yapılabilir gibi?
                    break 
                else:
                    to_customer = route.route[i - 1].distance_to(customer)
                    from_customer = customer.distance_to(route.route[i+1]) 
                    delta = to_customer + from_customer - distance
                    costs.append((delta, route, customer, route_index, i))
                    route.route.remove(customer)   
                
            
                
                
        return costs
            
    def insert(self, solution):
        
        unserved_customers = solution.unserved_customers
        for u_customer in unserved_customers:
            costs = self.get_costs(u_customer, solution)
            if len(costs) != 0:
                best_cost = min(costs, key=lambda x: x[0])
                solution.routes[best_cost[3]].appendcustomer_at_certain_point(u_customer, best_cost[4])
                solution.remove_w_id_unserved(u_customer)
                solution.served_customers.append(u_customer)
            else:
                # input("No feasible solution found")
                continue 
            
        solution.removeEmptyRoutes()   
        return solution
                
class regret2CustomerInsertionOperator(CustomerInsertionOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Regret 2 Customer Insertion Operator"
        self.score = score
    
    def resetScore(self):
        self.score=0.0
        
    def get_costs(self, customer, solution:Solution):
        costs = []
        for route in solution.routes:
            route_index = solution.routes.index(route)
            for i in range(1, len(route.route)):
                distance = route.route[i - 1].distance_to(route.route[i]) 
                route.route.insert(i, customer)
                if route.payload_capacity_constraint_violated() == True:
                    route.route.remove(customer)
                    break 
                else:
                    to_customer = route.route[i - 1].distance_to(customer)
                    from_customer = customer.distance_to(route.route[i+1]) 
                    delta = to_customer + from_customer - distance
                    costs.append((delta, route, customer, route_index, i))
                    route.route.remove(customer)   
                
        return costs
    
    def insert(self, solution):
        unserved_customers = solution.unserved_customers
        regret_values = []
        for u_customer in unserved_customers:
            # maliyetler aynı şekilde greedy yaklaşım ile hesaplanmalı 
            costs = self.get_costs(u_customer, solution)
            
            if len(costs) < 2:
                continue
            
            # Regret değeri hesaplanır
            # En düşük iki maliyeti bulun
            first, second = float('inf'), float('inf')
            for cost in costs:
                if cost[0] < first:
                    first, second = cost[0], first
                elif cost[0] < second:
                    second = cost[0]
           
            regret_value = (second - first, u_customer, costs)
            regret_values.append(regret_value)
            
            
        if len(regret_values) == 0:
            return solution
            
        # best regret tuple'ını seç, max delta olan seçilir. 
        best_regret = max(regret_values, key=lambda x: x[0])
        # best regret tuple'ı (delta_cost, best cost) içerir
        # 1. indeks olan  best cost değeri 4lü tuple'dır.bir cost tuple'ıdır 
        # (delta, temp_route, customer, route_index, i) içerir
        best_customer = best_regret[1]
        best_cost = min(best_regret[2], key=lambda x: x[0])

        # Insert the customer at the best position
        solution.routes[best_cost[3]].route.insert(best_cost[4], best_customer)
        solution.remove_w_id_unserved(best_customer)
        solution.served_customers.append(best_customer)

        solution.removeEmptyRoutes()
        return solution
    
class randomCustomerSwapOperator(SwapOperator):

    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Random Customer Swap Operator"
        self.score = score

    def __str__(self) -> str:
        return "randomCustomerSwapOperator"

    def resetScore(self):
        self.score = 0.0

    def swap(self, solution: Solution):
        """Bir rotadaki rastgele iki müşterinin yer değiştirilmesi."""
        try : 
            random_route = random.choice(solution.routes)
            route_size = len(random_route.route[1:-1])
            if route_size >= 2:
                customer_1, customer_2 = random.sample(random_route.route[1:-1], 2)
                # customer_1 = random.choice(random_route.route[1:-1])
                # customer_2 = random.choice(random_route.route[1:-1])
                # count = 0

                # aynı eleman olmasın diye
                # while customer_1 == customer_2:
                #     customer2 = random.choice(random_route.route[1:-1])
                #     count += 1
                #     if count > 5:
                #         break

                # Swap the customers
                index1 = random_route.route.index(customer_1)
                index2 = random_route.route.index(customer_2) 
                
                random_route.route[index1], random_route.route[index2] = (
                    random_route.route[index2],
                    random_route.route[index1],
                )
                # eğer yer değiştirme sonucunda payload sorunu olursa eski haline döndür

            else:
                return solution
        except ValueError as e:
            print("ValueError: ", e) 
            print("route_size: ", route_size)
            print("random_route: ", random_route)
            print("random_route.route: ", random_route.route)
            print("solution: ", solution.routes)
        
        if len(random_route.route) == 2:
            solution.removeEmptyRoutes()
        return solution

class randomBetweenRouteSwapOperator(SwapOperator):

    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Random Between Route Swap Operator"
        self.score = score

    def __str__(self) -> str:
        return "randomBetweenRouteSwapOperator"

    def resetScore(self):
        self.score = 0.0

    def swap(self, solution: Solution):
        """Rastgele seçilen Rotalar arasında rastgele iki müşterinin yer değiştirilmesi."""
        if len(solution.routes) < 2:
            return solution
        elif len(solution.routes) == 2:
            random_route_1 = solution.routes[0]
            random_route_2 = solution.routes[1]
        else:
            random_route_1, random_route_2 = random.sample(solution.routes, 2)

        last_1 = len(random_route_1.route) - 1
        last_2 = len(random_route_2.route) - 1
        # eğer rotada 1'den az eleman varsa
        if last_1 <= 1 or last_2 <= 1:
            return solution

        customer1 = random.choice(random_route_1.route[1:last_1])
        customer2 = random.choice(random_route_2.route[1:last_2])

        count = 0
        
        while random_route_1.route == random_route_2.route:
            random_route_2 = random.choice(solution.routes)
            last_2 = len(random_route_2.route) - 1
            customer2 = random.choice(random_route_2.route[1:last_2])
            count += 1
            if count > 5:
                break

        # Swap the routes
        index1 = random_route_1.route.index(customer1)
        index2 = random_route_2.route.index(customer2)
        random_route_1.route[index1], random_route_2.route[index2] = (
            random_route_2.route[index2],
            random_route_1.route[index1],
        )

        # eğer yer değiştirme sonucunda payload sorunu olursa eski haline döndür
        if random_route_1.payload_capacity_constraint_violated() or random_route_2.payload_capacity_constraint_violated():
            random_route_1.route[index1], random_route_2.route[index2] = (
                random_route_2.route[index2],
                random_route_1.route[index1],
        )
        solution.removeEmptyRoutes()
        return solution

# class randomCustomerRandomInsertionOperator(CustomerInsertionOperator):
#     def __init__(self, score=0.0):
#         super().__init__()
#         self.score = score

#     def __str__(self) -> str:
#         return "randomCustomerInsertionOperator"

#     def resetScore(self):
#         self.score = 0.0

#     def swap(self, solution: Solution):
#         """Rastgele bir müşterinin rastgele bir rotaya ve rastgele bir indise atılması."""
#         # print("Solution önce = ", solution.routes)
#         # input("randomCustomerRandomInsertionOperator")
#         if len(solution.routes) < 2:
#             return solution
#         elif len(solution.routes) == 2:
#             random_route_1 = solution.routes[0]
#             random_route_2 = solution.routes[1]
#         else :
#             random_route_1 = max(solution.routes, key=lambda x: len(x.route))
#             random_route_2 = min(solution.routes, key=lambda x: len(x.route))
#             # random_route_1, random_route_2 = random.sample(solution.routes, 2)

#         last_1 = len(random_route_1.route) - 1
#         last_2 = len(random_route_2.route) - 1
#         # eğer rotada 1'den az eleman varsa
#         if last_1 <= 1 or last_2 <= 1:
#             return solution

#         customer1 = random.choice(random_route_1.route[1:last_1])
#         customer1_index = random_route_1.route.index(customer1)
#         # eğer rotalar eşitse farklı bir rota seçene kadar döngü
#         count = 0
#         while random_route_1.route == random_route_2.route:
#             random_route_2 = random.choice(solution.routes)
#             last_2 = len(random_route_2.route) - 1
#             count += 1
#             if count > 5:
#                 break

#         # rastgele bir yere müşteriyi ekle
#         where = random.randint(1, last_2)
#         # print("Solution önce = ", solution.routes)
#         random_route_2.appendcustomer_at_certain_point(customer1, where)
#         random_route_1.remove_customer_from_route(customer1)
#         # print("Solution sonra = ", solution.routes)
#         # payload sorunu var mı kontrolü
#         if random_route_2.payload_capacity_constraint_violated():
#             random_route_2.remove_customer_from_route(customer1)
#             random_route_1.appendcustomer_at_certain_point(customer1, customer1_index)
#             # print("Solution geri aldım = ", solution.routes)
#         # input("randomCustomerRandomInsertionOperator")
#         return solution

# class randomCustomerAppendOperator(CustomerInsertionOperator):
#     def __init__(self, score=0.0):
#         super().__init__()
#         self.score = score

#     def __str__(self) -> str:
#         return "randomCustomerAppendOperator"

#     def resetScore(self):
#         self.score = 0.0

#     def swap(self, solution: Solution):
#         """Rastgele bir müşterinin rastgele bir rotaya sondan eklenmesi."""

#         if len(solution.routes) < 2:
#             return solution
#         elif len(solution.routes) == 2:
#             random_route_1 = solution.routes[0]
#             random_route_2 = solution.routes[1]
#         else:
#             random_route_1 = max(solution.routes, key=lambda x: len(x.route))
#             random_route_2 = min(solution.routes, key=lambda x: len(x.route))
#             # random_route_1, random_route_2 = random.sample(solution.routes, 2)

#         # son indisler
#         last_1 = len(random_route_1.route) - 1
#         last_2 = len(random_route_2.route) - 1

#         # eğer rotada 1'den az eleman varsa
#         if last_1 <= 1 or last_2 <= 1:
#             return solution

#         customer1 = random.choice(random_route_1.route[1:last_1])
#         customer1_index = random_route_1.route.index(customer1)
#         # eğer rotalar eşitse farklı bir rota seçene kadar döngü
#         count = 0
#         while random_route_1.route == random_route_2.route:
#             random_route_2 = random.choice(solution.routes)
#             last_2 = len(random_route_2.route) - 1
#             count += 1
#             if count > 5:
#                 break
#         # print("Solution önce = ", solution.routes)
#         # müşteriyi diğer rotaya sondan ekle
#         random_route_2.appendcustomer_at_certain_point(customer1, last_2)
#         random_route_1.remove_customer_from_route(customer1)
#         # print("Solution sonra = ", solution.routes)
#         # payload sorunu var mı kontrolü
#         if random_route_2.payload_capacity_constraint_violated():
#             random_route_2.remove_customer_from_route(customer1)
#             random_route_1.appendcustomer_at_certain_point(customer1, customer1_index)
#         #     print("Solution geri aldım = ", solution.routes)
#         # input("randomCustomerAppendOperator")
#         return solution


class infeasibleDivider(CustomerInsertionOperator):

    def __init__(self, stations=[], score=0.0):
        super().__init__()
        self.name = "Route Creator and Greedy Customer Insertion Operator"
        self.stations = stations
        self.score = score
    def resetScore(self):
        self.score=0.0

    def get_costs(self, customer, solution:Solution):
        costs = []  
        
        return costs
            
    def insert(self, solution: Solution):
        # input("geldi")
        # print("solution : ", solution.routes)
        unserved_customers = solution.unserved_customers
        config = solution.problemFile.config
        depot = solution.problemFile.depot
        new_routes = []

        cost = []
        # infeasible rotalardan max distance olanları çıkar
        for route in solution.routes:
            if route.tank_capacity_constraint_violated():
                if route.get_node_before_where_battery_is_negative():
                    node = route.get_node_before_where_battery_is_negative()
                    # eğer sonda depoya gidemiyorsa
                    if node.id == route.route[-1].id:
                        last_customer = route.route[-2]
                        route.route.remove(last_customer)
                        solution.remove_w_id_served(last_customer)
                        solution.unserved_customers.append(last_customer)
                    # eğer son nokta dışında bir yerse
                    else:
                        node_index = route.route.index(node)
                        # o noktadan itibaren unserved yapılır.
                        for node in route.route[node_index:-1]:
                            if type(node) == Customer:
                                route.remove_customer_from_route(node)
                                solution.remove_w_id_served(node)
                                solution.unserved_customers.append(node)
                            elif type(node) == ChargeStation:
                                route.remove_customer_from_route(node)
                                
        
        # Çıkarılan customerlar unserved listesinde tutuluyor. 
        # Bu listeyi tıpkı initial_solution'da olduğu gibi yeni rotalara atayacağız.
        # 
        while unserved_customers:
            initial_route = Route(config, depot)
            next_customer = min(unserved_customers, key=lambda n: depot.distance_to(n))
            initial_route.route.append(next_customer)
            
            solution.served_customers.append(next_customer)
            solution.remove_w_id_unserved(next_customer)
                        
            while not initial_route.payload_capacity_constraint_violated() and unserved_customers: 
                new_customer = min(unserved_customers, key=lambda u_cust: u_cust.due_date)
                initial_route.route.append(new_customer)

                solution.served_customers.append(new_customer)
                solution.remove_w_id_unserved(new_customer)
                
                if initial_route.payload_capacity_constraint_violated():
                    initial_route.route.pop()
                    solution.served_customers.remove(new_customer)
                    solution.unserved_customers.append(new_customer)
                    break
            
            initial_route.route.append(depot)
            new_routes.append(initial_route)
            
        # Rotalar solution içerisine eklenir 
        for new_route in new_routes:
            solution.routes.append(new_route)
            
        solution.removeEmptyRoutes()

        return solution