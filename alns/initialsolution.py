from AlnsObjects.Solution import Solution
from DataObjects.Customer import Customer
from DataObjects.ChargeStation import ChargeStation
from AlnsObjects.Route import Route
from DataObjects.Target import Target
from DataObjects.ProblemInstances import *


def initialSolution(depot, customers, problem_instance):

    routes = []
    served_customers = []
    unserved_customers = customers.copy()
    
    # sorted_customers = sorted(unserved_customers, key=lambda customer: problem_instance.depot.distance_to(customer))
    
    while unserved_customers:
        initial_route = Route(problem_instance.config, problem_instance.depot)
        # burda sorted customerlar due date'e göre sıralı. Bunlar arasında depoya en yakını almak tw açısından mantıklı olmayabilir. ! 
        next_node = min(unserved_customers, key=lambda n: depot.distance_to(n))
        last = next_node
        
        initial_route.route.append(next_node)
        served_customers.append(next_node)
        unserved_customers.remove(next_node)
        
        while not initial_route.payload_capacity_constraint_violated() and unserved_customers: 
            
            next_node = min(unserved_customers, key=lambda customer: last.distance_to(customer))
            initial_route.route.append(next_node)
                        
            if initial_route.payload_capacity_constraint_violated():
                initial_route.route.pop()
                break
            if initial_route.tank_capacity_constraint_violated():
                initial_route.route.pop()
                break 
            else:
                served_customers.append(next_node)
                unserved_customers.remove(next_node)
                last = next_node
                
        initial_route.route.append(depot)  

        routes.append(initial_route)
    
    solution = Solution(unserved_customers, served_customers, routes, problem_instance)
    print("-----------------------------------------------------------------------------------")
    print("\033[96mProcessing file : ", problem_instance.fileName, "\033[0m")
    print("Initial solution : ", solution.routes)
    for route in solution.routes:
        if route.payload_capacity_constraint_violated():
            print("Payload capacity violated : ", route)
    
    print("-----------------------------------------------------------------------------------")
    # input(" . . . ")
    return solution

def initial_solution_with_tw(depot: Target, customers: list[Customer], problem_instance: RoutingProblemInstance) -> Solution:
    

    routes = []
    served_customers = []
    unserved_customers = customers.copy()
    
    # sorted_customers = sorted(unserved_customers, key=lambda customer: problem_instance.depot.distance_to(customer))
    while unserved_customers:
        # Rota oluştur  [ ] ve içine depoyu koy -> [ cs5 ]
        initial_route = Route(problem_instance.config, problem_instance.depot)
        # Sonraki node saçiminde unserved customer'lar arasından ready time'a en yakın olanı seç. 
        # 
        next_node = min(unserved_customers, key=lambda n: n.ready_time)
        initial_route.route.append(next_node)
        
        served_customers.append(next_node)
        unserved_customers.remove(next_node)
        
        while not initial_route.payload_capacity_constraint_violated() and unserved_customers: 
            get_closest_customers = sorted(unserved_customers, key=lambda customer: customer.due_date)
            initial_route.route.append(get_closest_customers[0])
            
            served_customers.append(get_closest_customers[0])
            unserved_customers.remove(get_closest_customers[0])
            
            if initial_route.payload_capacity_constraint_violated():
                initial_route.route.pop()
                served_customers.remove(get_closest_customers[0])
                unserved_customers.append(get_closest_customers[0])
                break
         
        initial_route.route.append(depot)  
        routes.append(initial_route)
        
    solution = Solution(unserved_customers, served_customers, routes, problem_instance)
    print("-----------------------------------------------------------------------------------")
    print("\033[96mProcessing file : ", problem_instance.fileName, "\033[0m")
    print("Initial solution with TW: ", solution.routes)
    for route in solution.routes:
        if route.payload_capacity_constraint_violated():
            print("Payload capacity violated : ", route)
        
        if route.tw_constraint_violated():
            print("TW constraint violated : ", route)
            
        if route.tank_capacity_constraint_violated():
            print("Tank capacity violated : ", route)
    
    print("-----------------------------------------------------------------------------------")
    input(" . . . ")
    return solution


def initial_solution_with_every_route_one_customer(depot: Target, customers: list[Customer], problem_instance: RoutingProblemInstance) -> Solution:
    
    routes = []
    served_customers = []
    unserved_customers = customers.copy()
    
    # sorted_customers = sorted(unserved_customers, key=lambda customer: problem_instance.depot.distance_to(customer))
    
    while unserved_customers:
        initial_route = Route(problem_instance.config, problem_instance.depot)
        # burda sorted customerlar due date'e göre sıralı. Bunlar arasında depoya en yakını almak tw açısından mantıklı olmayabilir. ! 
        next_node = min(unserved_customers, key=lambda n: depot.distance_to(n))
        initial_route.route.append(next_node)
        
        served_customers.append(next_node)
        unserved_customers.remove(next_node)
        

        if initial_route.payload_capacity_constraint_violated():
            initial_route.route.pop()
            served_customers.remove(next_node)
            unserved_customers.append(next_node)
             
        initial_route.route.append(depot)  
        routes.append(initial_route)
        
    solution = Solution(unserved_customers, served_customers, routes, problem_instance)
    print("-----------------------------------------------------------------------------------")
    print("\033[96mProcessing file : ", problem_instance.fileName, "\033[0m")
    print("Initial solution : ", solution.routes)
    for route in solution.routes:
        if route.payload_capacity_constraint_violated():
            print("Payload capacity violated : ", route)
    
    print("-----------------------------------------------------------------------------------")
    # input(" . . . ")
    return solution

