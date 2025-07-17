import copy
from AlnsOperators.Operators import StationInsertionOperator, StationRemovalOperator

from DataObjects.Customer import Customer
from DataObjects.ChargeStation import ChargeStation
from collections import defaultdict
import random

# CHARGE STATION REMOVAL OPERATORS


# class randomStationRemovalOperator(StationRemovalOperator):
#     def __init__(self, score=0.0):
#         super().__init__()
#         self.score = score
#     def resetScore(self):
#         self.score=0.0
        
#     def getRandomStationsToBeRemoved(self, solution):
#         Q = self.stationToBeRemoved(solution)
#         charge_stations = solution.getAllStationsWithRouteIndexAndStationIndex()
#         random_stations = random.sample(charge_stations, int(Q))
#         return random_stations
#     def remove(self, solution):
#         random_stations = self.getRandomStationsToBeRemoved(solution)
        
#         if len(random_stations) == 0:
#             return solution.routes
        
#         for station in random_stations:
#             charge_station = solution.routes[station[1]].route[station[0]]
#             solution.routes[station[1]].remove_charge_station_from_route(
#             charge_station)
#         solution.removeEmptyRoutes()
#         return solution.routes


class worstChargeUsageStationRemovalOperator(StationRemovalOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.score = score
    def resetScore(self):
        self.score=0.0
    def getChargeRemaining(self, station, selectedRoute):
        # Find the index of the station in the selectedRoute
        station_index = selectedRoute.route.index(station)

        # Copy elements from the beginning of selectedRoute until the station
        newRoute = copy.copy(selectedRoute)
        newRoute.route = selectedRoute.route[:station_index]
        return newRoute.calculate_remaining_tank_capacity()

    def remove(self, solution):
        charge_dict = {}
        Q = self.stationToBeRemoved(solution)
        for route_index, route in enumerate(solution.routes):
            for item in route.route:
                if isinstance(item, ChargeStation):
                    # Get the current charge remaining for the ChargeStation
                    current_charge = self.getChargeRemaining(item, route)

                    # Check if the ChargeStation ID is already in charge_dict
                    if item.id in charge_dict:
                        # Update the value with the maximum of the current and existing values
                        charge_dict[item][0] = max(
                            charge_dict[item.id][0], current_charge
                        )
                    else:
                        # If not present, add the ChargeStation ID with its current charge and route index
                        charge_dict[item] = [current_charge, route_index]

        # Sort the stations by charge remaining in descending order
        sorted_stations = sorted(
            charge_dict.items(), key=lambda x: x[1][0], reverse=True
        )

        # Take the top Q stations with the highest charge remaining
        stations_to_remove = sorted_stations[: int(Q)]

        # Remove the selected stations from the routes
        for charge_station_id, (charge_remaining, route_index) in stations_to_remove:
            solution.routes[route_index].remove_charge_station_from_route(
                charge_station_id
            )
        solution.removeEmptyRoutes()
        return solution.routes

class worstStationRemovalOperator(StationRemovalOperator):
    """ 
        En kötü Q adet şarj istasyonunu çıkarır.
    """
    def __init__(self, score=0.0):
        super().__init__()
        self.score = score
    def resetScore(self):
        self.score=0.0
    def remove(self, solution):
        Q = self.stationToBeRemoved(solution)
        stations_to_remove = {}
        for route_index, route in enumerate(solution.routes):
            if route.get_charge_stations() != []:
                for index, item in enumerate(route.route):
                    if isinstance(item, ChargeStation):
                        stations_to_remove[route_index] = {
                            "item": item,
                            "energy": route.calculate_energy_consumption(
                                route.route[index - 1], item
                            ),
                        }

        sorted_stations = sorted(
            stations_to_remove.items(), key=lambda x: x[1]["energy"], reverse=True
        )
        stations_to_remove = sorted_stations[: int(Q)]
        for route_index, station in stations_to_remove:
            solution.routes[route_index].remove_charge_station_from_route(
                station["item"]
            )
        return solution

class randomNearestStationInsertion(StationInsertionOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.score = score
        
    def resetScore(self):
        self.score=0.0
        
    def insert(self, solution):
        charge_stations = solution.getAllStationInProblemFile()
        min_distance = []
        costs = []
        infeasible_routes = solution.getInfeasibleRoutes()
        for route in infeasible_routes:
            random_index = random.randint(1, len(route.route)-1)
            random_node = route.route[random_index]
            if type(random_node) == ChargeStation:
                continue
            else: 
                nearest_station = sorted(
                    charge_stations,
                    key=lambda station: route.route[random_index].distance_to(station),
                )[0]
                route.append_charge_station_at_certain_point(nearest_station, random_index)

        for route in solution.routes:
            isFeasible = route.is_feasible()
            for index,item in enumerate(route.route):
                if type(item) == ChargeStation and isFeasible :
                    # Burada şarj istasyonu varsa ve rota feasible ise şarj istasyonu silinir
                    del route.route[index]
                    if not route.is_feasible_all():
                        # Eğer rota feasible değilse şarj istasyonu geri eklenir
                        route.append_charge_station_at_certain_point(item,index)
                    else:
                        continue
                else:
                    continue
        return solution
        
class greedyStationInsertion(StationInsertionOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.score = score
        
    def resetScore(self):
        self.score=0.0
        
    def insert(self, solution):
        charge_stations = solution.getAllStationInProblemFile()
        for infeasible_route in solution.getInfeasibleRoutes():
            where_battery_negative = infeasible_route.get_node_before_where_battery_is_negative() 
            index = infeasible_route.route.index(where_battery_negative)
            before_index = index-1
            
            before_node = infeasible_route.route[before_index]
            if type(before_node) == ChargeStation:
                continue
             
            stations_cost = []
            for station in charge_stations:
                back_distance = before_node.distance_to(station)
                forward_distance = station.distance_to(where_battery_negative)
                cost = back_distance + forward_distance
                stations_cost.append((cost, station))
            
            best_station = min(stations_cost, key=lambda x: x[0])[1] # (cost, station) -> [1] = station
            infeasible_route.append_charge_station_at_certain_point(best_station, before_index)

            if infeasible_route.is_feasible_all() == False:
                infeasible_route.remove_charge_station_from_route(best_station)
                continue
            
        # Eğer fazladan istasyon varsa kaldırır.
        for route in solution.routes:
            isFeasible = route.is_feasible()
            for index,item in enumerate(route.route):
                if type(item) == ChargeStation and isFeasible :
                    # Burada şarj istasyonu varsa ve rota feasible ise şarj istasyonu silinir
                    del route.route[index]
                    if not route.is_feasible_all():
                        # Eğer rota feasible değilse şarj istasyonu geri eklenir
                        route.append_charge_station_at_certain_point(item,index)
                    else:
                        continue
                else:
                    continue
        return solution
        
# CHARGE STATION INSERTION OPERATORS
class bestStationInsertionOperator(StationInsertionOperator):
    def __init__(self, score=0.0):
        super().__init__()
        self.score = score
    def resetScore(self):
        self.score=0.0
    def insert(self, solution):
        charge_stations = solution.getAllStationInProblemFile()
        min_distance = []
        costs = []
        infeasible_routes = solution.getInfeasibleRoutes()

        for route in infeasible_routes:
            
            # if there is no charge station in the route
            if route.tank_capacity_constraint_violated():
                added_customer = route.get_node_before_where_battery_is_negative()
            
            if added_customer == None:
                added_customer = route.route[-1]

            added_customer_index = route.route.index(added_customer)-1
            if(added_customer_index==0):
                added_customer_index=len(route.route)-1
                
            
            get_closest_station = sorted(
                charge_stations,
                key=lambda station: added_customer.distance_to(station),
            )

            # Eklenmiş şarj istasyonunu bu döngüde dene
            for station in get_closest_station:
                route.append_charge_station_at_certain_point(station, added_customer_index)
                

                if route.is_feasible_all() == True:
                    costs.append(
                        (
                            copy.deepcopy(route.calculate_obj_function()),
                            copy.deepcopy(route),
                            solution.find_route_index_in_solution(route),
                        )
                    )
                    route.remove_charge_station_from_route(station)
                else:
                    route.remove_charge_station_from_route(station)

        if(len(costs)==0):
            return solution
        else:
            sorted_costs = sorted(costs, key=lambda x: x[0])
            tobeadded_route = sorted_costs[0][1]
            tobeadded_route_index = sorted_costs[0][2]
            solution.routes[tobeadded_route_index] = tobeadded_route  
            solution.removeEmptyRoutes()
        return solution
        
# class greedyStationInsertionOperator(StationInsertionOperator):
#     def __init__(self, score=0.0):
#         super().__init__()
#         self.score = score
#     def resetScore(self):
#         self.score=0.0
#     def insert(self, solution):
#         charge_stations = solution.getAllStationInProblemFile()
#         infeasible_routes = solution.getInfeasibleRoutes()
#         for route in infeasible_routes:
#             if route.tank_capacity_constraint_violated() == False:
#                 continue
#             else:
#                 if route.tank_capacity_constraint_violated():
#                     added_customer = route.get_node_before_where_battery_is_negative()
                
#                 if added_customer == None:
#                     added_customer = route.route[-1]

#                 added_customer_index = route.route.index(added_customer)-1
#                 if(added_customer_index==0):
#                     added_customer_index=len(route.route)-1
                            
#                 get_closest_station = sorted(
#                     charge_stations,
#                     key=lambda station: station.distance_to(added_customer),
#                 )

#                 route.append_charge_station_at_certain_point(get_closest_station[0], added_customer_index)
#                 if route.is_feasible_all() == True:
#                     continue
#                 else:
#                     route.remove_charge_station_from_route(get_closest_station[0])
                    
#         solution.removeEmptyRoutes()
#         return solution
        


class Compare_K_Insertion(StationInsertionOperator):
    def __init__(self, k, score=0.0):
        super().__init__()
        self.k = k
        self.score = score
    def resetScore(self):
        self.score=0.0
    def insert(self, solution):
        charge_stations = solution.getAllStationInProblemFile()
        costs = []
        k = self.k
        
        infeasible_routes = solution.getInfeasibleRoutes()
        # rota içerisinde infeasible olan rotalarda dolanacak ve her bir customer'ı inceleyecek
        # 
        for route in infeasible_routes:
            if route.is_feasible_all() == False:
                if(len(route.route)<4):
                    k=1
                elif(len(route.route)<5):
                    k=2
                for customer in route.route:
                    if isinstance(customer, Customer):
                        available_charge = route.calculate_remaining_tank_capacity(
                            customer
                        )
                        customer_index = route.route.index(customer)
                        if customer_index + 1 < len(route.route):
                            to_node = route.route[customer_index + 1]
                        else:
                            continue 
                        needed_charge = route.calculate_charge_required_between_nodes(
                            customer, to_node
                        )
                        if available_charge < needed_charge:
                            temp_route = copy.deepcopy(route)
                            get_closest_charge_station = sorted(
                                charge_stations, key=lambda x: customer.distance_to(x)
                            )
                            for charge_station in get_closest_charge_station:
                                temp_route.append_charge_station_at_certain_point(
                                    charge_station,
                                    route.route.index(customer)+1-k,
                                )
                                if temp_route.is_feasible_all() == True:
                                    costs.append(
                                        (
                                            copy.deepcopy(temp_route.calculate_obj_function()),
                                            copy.deepcopy(temp_route),
                                            solution.find_route_index_in_solution(route),
                                        )
                                    )
                                    temp_route.remove_charge_station_from_route(
                                        charge_station
                                    )
                                else:
                                    temp_route.remove_charge_station_from_route(
                                        charge_station
                                    )
            
        if(len(costs)==0):
            return solution
        min_cost = min(costs, key=lambda x: x[0])
        tobeadded_route = min_cost[1]
        tobeadded_route_index = min_cost[2]
        solution.routes[tobeadded_route_index] = tobeadded_route
        solution.removeEmptyRoutes()

        return solution
    
    
