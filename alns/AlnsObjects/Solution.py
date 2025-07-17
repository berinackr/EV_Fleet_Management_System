
from DataObjects.Customer import Customer
from DataObjects.ChargeStation import ChargeStation
from AlnsObjects.Route import Route
from DataObjects.Customer import Customer
from DataObjects.ProblemInstances import *


class Solution:
    
    def __init__(self,unserved_customers,served_customers, routes, problemFile ):
        self.unserved_customers = unserved_customers
        self.served_customers = served_customers
        self.routes = routes
        self.problemFile = problemFile
        self.requirements_dict = problemFile.config.requirements_dict
        self.iteration_list=[]
        self.total_distance_list=[]
        self.total_elapsed_time_list=[]

    def setIterationList(self,maxIter):
        iteration_list=[i for i in range(1,maxIter+1)]
        self.iteration_list=iteration_list

    def setTotalDistanceList(self,total_distance_list):
        self.total_distance_list=total_distance_list

    def setTotalElapsedTimeList(self, total_elapsed_time_list):
        self.total_elapsed_time_list = total_elapsed_time_list
    
    def setRuntime(self,runtime):
        self.runtime = runtime
        
    def setAlnsObject(self, alns):
        self.alns = alns
    
    def getInfeasibleRoutesFinal(self):
        infeasibleRoutes=[]
        for route in self.routes:
            if route.is_feasible_all_final() == False:
                infeasibleRoutes.append(route)
        return infeasibleRoutes
    
    def getNumberOfCustomers(self):
        totalCustomers=0
        for route in self.routes:
            for customer in route.route:
                if(type(customer) is Customer):
                    totalCustomers+=1
        return totalCustomers
    
    def getAllCustomers(self):
        allCustomers=[]
        for route in self.routes:
            for customer in route.route:
                if(customer.id.startswith("C")):
                    allCustomers.extend(customer)
                else:
                    if(customer.id.startswith("S") or customer.id.startswith("D")):
                        continue
                    else:
                        print(customer.id)
        return allCustomers
    def getNumberOfNodes(self):
        numOfNodes = 0
        for route in self.routes:
            for item in route.route:
                numOfNodes+=1
        return numOfNodes
    
    def getNumberOfStation(self):
        numOfStations = 0
        for route in self.routes:
            for item in route.route:
                if(type(item) is ChargeStation):
                    numOfStations+=1
        return numOfStations
    def remove_w_id_served(self, customer):
        for item in self.served_customers:
            if item.id == customer.id:
                self.served_customers.remove(item)
    
    def remove_w_id_unserved(self, customer):
        for item in self.unserved_customers:
            if item.id == customer.id:
                self.unserved_customers.remove(item)
                
    def getAllStations(self):
        allStations=[]
        for route in self.routes:
            for item in route.route:
                if type(item) is ChargeStation and item not in allStations:
                    allStations.append(item)
        return allStations
    
    def getMissingCustomersInSolution(self):
        missingCustomers=[]
        for customer in self.problemFile.customers:
            if customer not in self.served_customers:
                missingCustomers.append(customer.id)
        return missingCustomers
    
    def getAllStationsWithRouteIndexAndStationIndex(self):
        allStations=[]
        for route in self.routes:
            for station in route.route:
                if type(station) is ChargeStation and station not in allStations:
                    allStations.append([route.route.index(station),self.routes.index(route),station])
        return allStations

    def isAllRoutesFeasible(self):
        for route in self.routes:
            if route.is_feasible_all() == False:
                return False
        return True
    def getnumberofFeasibleAndInfeasibleRoutes(self):
        feasible=0
        infeasible=0
        for route in self.routes:
            if route.is_feasible_all() == False:
                infeasible+=1
            else:
                feasible+=1
        return feasible,infeasible
    def get_Total_Objective_Function_Value(self):
        total=0
        for route in self.routes:
            total += route.calculate_obj_function()
        return total
       
    def getInfeasibleRoutes(self):
        infeasibleRoutes=[]
        for route in self.routes:
            if route.is_feasible_all() == False:
                infeasibleRoutes.append(route)
        return infeasibleRoutes
    
    def getSolutionWhyInfeasible(self):
        infeasible_routes_why = []
        for route in self.routes:
            if route.tank_capacity_constraint_violated():
                infeasible_routes_why.append("Tank capacity constraint violated")
            if route.payload_capacity_constraint_violated():
                infeasible_routes_why.append("Payload capacity constraint violated")
            if route.tw_constraint_violated():
                infeasible_routes_why.append("Time window constraint violated")
        return infeasible_routes_why
    
    def find_route_index_in_solution(self,route):
        for i in range(len(self.routes)):
            if self.routes[i] == route:
                return i
        return -1
    
    def getUnservedCustomers(self):
        return self.unserved_customers

    def getAllStationInProblemFile(self):
        return self.problemFile.charging_stations
    
    def getAllCustomersInProblemFile(self):
        return self.problemFile.customers
    
    def getTotalDistance(self):
        total_distance = 0
        for route in self.routes:
            total_distance += route.calculate_total_distance()
        return total_distance
    
    def getTotalTime(self):
        total_time = 0 
        for route in self.routes:
            total_time += route.calculate_total_time()
        return total_time
    
    def getInfeasibleRoutes_indexes(self):
        infeasibleRoutes=[]
        for i in range(len(self.routes)):
            if self.routes[i].is_feasible_all() == False:
                infeasibleRoutes.append(i)
        return infeasibleRoutes
    
    def doesContainAnyCustomer(self):
        for route in self.routes:
            for item in route.route:
                if type(item) is Customer:
                    return True
                
    def removeRouteByIndex(self,index):
        self.routes.remove(self.routes[index])
    
    # def removeEmptyRoutes(self):
    #     for route in self.routes:
    #         route_index=self.find_route_index_in_solution(route)
    #         iterate=0
    #         for item in route.route:
    #             if type(item) is Customer:
    #                 break
    #             elif(type(item) != Customer and iterate == len(route.route)-1):
    #                 self.removeRouteByIndex(route_index)
    #                 break
    #             iterate+=1
    def removeEmptyRoutes(self):
        routes_to_remove = [] 
        for route_index, route in enumerate(self.routes):
            has_customer = any(isinstance(item, Customer) for item in route.route)

            if not has_customer:
                routes_to_remove.append(route_index)

        # Rotayı sondan başa doğru silmek, indeks kaymasını önler
        for route_index in reversed(routes_to_remove):
            self.removeRouteByIndex(route_index)

            
