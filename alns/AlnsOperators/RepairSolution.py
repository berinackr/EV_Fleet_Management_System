import copy
import random
from AlnsObjects.Route import Route
from AlnsOperators.Operators import SolutionRepairOperator
from DataObjects.Customer import Customer
from DataObjects.ChargeStation import ChargeStation
from AlnsObjects.Solution import Solution
import time

class GreedyRepair(SolutionRepairOperator): 
    
    def __init__(self, weights=[1,1], probability=0.0):
        self.weights = weights
        self.name = "Greedy Repair Solution"
        self.probability = probability
        self.Q = 0
    
    def __str__(self):
        return "Greedy Repair Solution"
    
    def resetScore(self):
        self.score = 0. 
    
    def add_cs_to_route(self, route: Route, charge_stations, index):
        """ 
            Gidilemeyen node'dan öncesi bulunur ve rotaya en yakın şarj istasyonu eklenir.
        """
        before_node = route.route[index-1]
        closest_charge_station = min(charge_stations, key=lambda station: before_node.distance_to(station))
        route.append_charge_station_at_certain_point(closest_charge_station, index)
        if not route.tank_capacity_constraint_violated():
            return True
        else:
            route.remove_charge_station_from_route(closest_charge_station)
            return False
    
    def repairRoute_no_Loop(self, route: Route, charge_stations):
        
        where_node = route.get_node_before_where_battery_is_negative()
        if where_node is None:
            return route

        where_index = route.route.index(where_node)
        print(f"where_index: {where_index}, where_node: {where_node}")
        if where_index == 0:
            where_index = len(route.route) - 1  
        
        # bir önceki node'dan en yakın şarj istasyonları alınır 
        # if where_index:
        #     before_index = where_index - 1
        #     while where_index >= 0:
        #         before_node = route.route[before_index]
        #         closest_charge_station = min(charge_stations, key=lambda station: before_node.distance_to(station))
        #         route.append_charge_station_at_certain_point(closest_charge_station, before_index)

        charge_option = route.config.requirements_dict["charge_option"]    
   
        for index, node in enumerate(route.route[1:], start=1):
            
            remaining = route.calculate_remaining_tank_capacity(node)
            # print(f"now: {index}/{node}, remaining: {remaining} / {remaining > route.config.tank_capacity * 0.2}")
            time.sleep(2)
            if charge_option == "full":
                if remaining < 0:
                    # eğer şarj negatifse, en yakın şarj istasyonu bulunur ve rotaya eklenir
                    before_node = route.route[index-1]
                    closest_charge_station = min(charge_stations, key=lambda station: before_node.distance_to(station))
                    route.append_charge_station_at_certain_point(closest_charge_station, index)
                else:
                    continue
            elif charge_option == "20-80":
                if remaining < route.config.tank_capacity * 0.2: 
                    # print("--------------------------------------------------------")
                    # print(f"now: {index}/{node}, remaining: {remaining}")
                    # print(f"20-80 : {remaining} / {remaining > route.config.tank_capacity * 0.2}")
                    i = index
                    while True:
                        # bu noktadan itibaren bir döngü ile en akın istasyon önceki node'a eklenir
                        # eğer uygun değilse bir önceki node'a bakılır
                        # yapı bu şekilde devam eder
                        if i < 1:
                            # print("başa döndüm")
                            break
                        before_node = route.route[i-1]
                        closest_charge_station = min(charge_stations, key=lambda station: before_node.distance_to(station))
                        route.append_charge_station_at_certain_point(closest_charge_station, index)
                        # print(f"route: {route}")
                        remaining = route.calculate_remaining_tank_capacity(node)
                        # print(f"now: {index}/{node}, remaining: {remaining}/ {remaining > route.config.tank_capacity * 0.2}")
                        if remaining > route.config.tank_capacity * 0.2:
                            # print("bir istasyon ile başardım")
                            break
                        else:
                            route.remove_charge_station_from_route(closest_charge_station)
                            i -= 1
                            
                else:
                    continue
            elif charge_option == "partial":
                required = ""
        # print("-----------------------rota bitti---------------------------------")
        # print("route: ", route)
        # print("is_feasible: ", route.is_feasible())
    
    def repairRoute(self, route: Route, charge_stations):
        where_battery_negative = route.get_node_before_where_battery_is_negative()
        index = route.route.index(where_battery_negative)
        if where_battery_negative is None:
            return route
        # en sonda negatifse get_node_before_where_battery_is_negative cs5 döner, fakat cs5 iki tane olduğu için index olarak bize ilkini, yani 0 dönmekte.
        # bu durumda index -1 olmalıdır ki sonuncu cs5 i alsın.
        if index == 0:
            index = len(route.route) - 1
            
        if where_battery_negative:
            before_index = index-1
            while before_index >= 0:
                before_node = route.route[before_index]
                closest_charge_station = min(charge_stations, key=lambda station: before_node.distance_to(station))
                route.append_charge_station_at_certain_point(closest_charge_station, before_index + 1)

                if not route.tank_capacity_constraint_violated():
                    break  # Uygun bir şarj istasyonu bulunduğunda döngüden çık
                else:
                    route.remove_charge_station_from_route(closest_charge_station)
                    before_index -= 1  # Önceki düğüme geri dönüp tekrar deneyin

            if before_index < 0:
            # buraya girdiğinde rotada uygun bir şarj istasyonu bulunamadı demektir.
            # bu yüzden birden fazla şarj istasyonuna ihtiyacı vardır. 
                i = 1
                # son node'a kadar gidecek, depoya girmemeli (indis hatası olur.)
                while i <= len(route.route)-1: 
                    if i >= len(route.route):
                        break
                    remaining = route.calculate_remaining_tank_capacity(route.route[i])
                    # print(f"[{i}]  : remaining = {remaining}")
                    if (i == len(route.route)-1) and (remaining <= 0) :
                        where = i
                        while where>=1:
                            before_node = route.route[where-1]
                            closest_charge_stations = sorted(charge_stations, key=lambda station: before_node.distance_to(station))
                            costs_ = []
                            for station in closest_charge_stations:
                                # en yakın istasyonları arka ve ön kısıta göre irdele
                                route.append_charge_station_at_certain_point(station, where)
                                # istasyona kadar gidebilecek mi(istasyona geldiğinde ne kadar şarjı kaldı)
                                back_remaining    = route.calculate_remaining_tank_capacity(route.route[where])
                                # istasyondan sonraki node'a gidebilecek mi (sonraki node'da ne kadar şarjı kaldı)
                                forward_remaining = route.calculate_remaining_tank_capacity(route.route[where+1]) 
                                route.remove_charge_station_from_route_at_certain_point(where)
                                
                                if back_remaining < 0:
                                    # eğer istasyona bile gidemiyorsa dur çünkü zaten en yakın istasyona bile gidemiyorsun
                                    continue
                                # burası daha sonrasında %20 veya kısmi olacak
                                if back_remaining > 0 and forward_remaining>0:
                                    costs_.append((forward_remaining, back_remaining, station))
                                
                            if len(costs_) > 0:        
                                # eğer uygun istasyonlar eklendiyse listeye, forward'a göre en iyisini al ve ekle
                                best_station_cost = max(costs_, key=lambda x: x[0] + x[1])
                                best_station = best_station_cost[2]
                                route.append_charge_station_at_certain_point(best_station, where)
                                break
                            else :
                                where -= 1         
                    
                    if remaining <= 0:
                        where = i
                        # şarjın negatif olduğu yerden itibaren geriye doğru giderek uygun şarj istasyonlarını keşfet
                        if i >= len(route.route):
                            return route
                        while where>=1:
                            
                            if where >= len(route.route):
                                return route
                            before_node = route.route[where-1]
                            closest_charge_stations = sorted(charge_stations, key=lambda station: before_node.distance_to(station))
                            costs = []
                            
                            for station in closest_charge_stations:
                                # en yakın istasyonları arka ve ön kısıta göre irdele
                                route.append_charge_station_at_certain_point(station, where)
                                # istasyona kadar gidebilecek mi(istasyona geldiğinde ne kadar şarjı kaldı)
                                back_remaining    = route.calculate_remaining_tank_capacity(route.route[where])
                                # istasyondan sonraki node'a gidebilecek mi (sonraki node'da ne kadar şarjı kaldı)
                                forward_remaining = route.calculate_remaining_tank_capacity(route.route[where+1]) 
                                route.remove_charge_station_from_route_at_certain_point(where)
                                if back_remaining < 0:
                                    # eğer istasyona bile gidemiyorsa dur çünkü zaten en yakın istasyona bile gidemiyorsun
                                    break
                                # burası daha sonrasında %20 veya kısmi olacak
                                if back_remaining > 0 and forward_remaining>0:
                                    costs.append((forward_remaining, back_remaining, station))
                                
                                if back_remaining < 0:
                                    # eğer istasyona bile gidemiyorsa dur çünkü zaten en yakın istasyona bile gidemiyorsun
                                    break
                                # burası daha sonrasında %20 veya kısmi olacak
                                if back_remaining > 0 and forward_remaining>0:
                                    costs.append((forward_remaining, back_remaining, station))
                                
                            
                            if len(costs) > 0:        
                                # eğer uygun istasyonlar eklendiyse listeye, forward'a göre en iyisini al ve ekle
                                # !!!!!!!
                                # best_station_cost = max(costs, key=lambda x: x[0] + x[1])
                                # x1 = 7527
                                best_station_cost = max(costs, key=lambda x: x[1])
                                best_station = best_station_cost[2]
                                route.append_charge_station_at_certain_point(best_station, where)
                                break
                            else:
                                where -= 1                                
                    else:
                        i += 1                                             
        return route
    
    def repair_one_solution(self, solution: Solution):
        temp_solution = copy.deepcopy(solution)
        # print("Temp Solution: ", temp_solution)
        charge_stations = temp_solution.getAllStationInProblemFile()
        infeasible_routes = temp_solution.getInfeasibleRoutes()
        i = 1
        for route in infeasible_routes:
            print("i : ",i)
            route = self.repairRoute(route,charge_stations)
            # input("devam et")
            i += 1
        
        # print("feasible olmuş olaiblir ")
        
        for route in temp_solution.routes:
            isFeasible = route.is_feasible()
            for index,item in enumerate(route.route):
                if type(item) == ChargeStation and isFeasible :
                    # Burada şarj istasyonu varsa ve rota feasible ise şarj istasyonu silinir
                    del route.route[index]
                    if not route.is_feasible_all():
                        # Eğer rota feasible değilse şarj istasyonu geri eklenir
                        route.append_charge_station_at_certain_point(item,index)
                    else:
                        # print("feasible oldu")
                        continue
                else:
                    continue
        return temp_solution
    
    def repair(self, solutions) -> Solution:
        repaired_solutions = []
        # print("----------------------------------------------")
        charge_stations = solutions[0][1].getAllStationInProblemFile()
        temp_solutions = copy.deepcopy(solutions)
        for solution_tuple in temp_solutions:  
            # solution[0] = total objective 
            # solution[1] = Solution object
            infeasible_routes = solution_tuple[1].getInfeasibleRoutes()
            for route in infeasible_routes:
                route = self.repairRoute(route,charge_stations)
            
            repaired_solutions.append((solution_tuple[1].get_Total_Objective_Function_Value() ,solution_tuple[1]))
        
        return repaired_solutions
        # print("----------------------------------------------")
            # 
            # if len(infeasibleRoutes) == 0:
            #     return solution
            # else:
            #     for route in infeasibleRoutes:
            #         self.repairRoute(route)
                    
            # repaired_solutions.append(solution)
        
        
class Regret2Repair(SolutionRepairOperator):
    def __init__(self, weights=[1,1], probability=0.0):
        self.weights = weights
        self.probability = probability
        self.Q = 0
    
    def __str__(self):
        return "Regret2 Repair Solution"
    
    def repairRoute(self, route: Route, charge_stations):
        
        # Check if the route is feasible
        where_battery_negative = route.get_node_before_where_battery_is_negative()
        index = route.route.index(where_battery_negative)
        
        if where_battery_negative is None:
            return route
        
        # en sonda negatifse get_node_before_where_battery_is_negative cs5 döner, fakat cs5 iki tane olduğu için index olarak bize ilkini, yani 0 dönmekte.
        # bu durumda index -1 olmalıdır ki sonuncu cs5 i alsın.
        if index == 0:
            index = len(route.route) - 1
            
        if where_battery_negative:
            before_index = index-1
            while before_index >= 0:
                before_node = route.route[before_index]
                closest_charge_station = min(charge_stations, key=lambda station: before_node.distance_to(station))
                route.append_charge_station_at_certain_point(closest_charge_station, before_index + 1)

                if not route.tank_capacity_constraint_violated():
                    break  # Uygun bir şarj istasyonu bulunduğunda döngüden çık
                else:
                    route.remove_charge_station_from_route(closest_charge_station)
                    before_index -= 1  # Önceki düğüme geri dönüp tekrar deneyin

            if before_index < 0:
            # buraya girdiğinde rotada uygun bir şarj istasyonu bulunamadı demektir.
            # bu yüzden birden fazla şarj istasyonuna ihtiyacı vardır. 
                i = 1
                # son node'a kadar gidecek, depoya girmemeli (indis hatası olur.)
                while i <= len(route.route)-1: 
                    
                    remaining = route.calculate_remaining_tank_capacity(route.route[i])
                    
                    if (i == len(route.route)-1) and (remaining < 0) :
                        where = i
                        while where>=1:
                            before_node = route.route[where-1]
                            closest_charge_station = min(charge_stations, key=lambda station: before_node.distance_to(station))
                            costs_ = []
                            for station in closest_charge_stations:
                                # en yakın istasyonları arka ve ön kısıta göre irdele
                                route.append_charge_station_at_certain_point(station, where)
                                # istasyona kadar gidebilecek mi(istasyona geldiğinde ne kadar şarjı kaldı)
                                back_remaining    = route.calculate_remaining_tank_capacity(route.route[where])
                                # istasyondan sonraki node'a gidebilecek mi (sonraki node'da ne kadar şarjı kaldı)
                                forward_remaining = route.calculate_remaining_tank_capacity(route.route[where+1]) 
                                route.remove_charge_station_from_route_at_certain_point(where)
                                
                                if back_remaining < 0:
                                    # eğer istasyona bile gidemiyorsa dur çünkü zaten en yakın istasyona bile gidemiyorsun
                                    break
                                # burası daha sonrasında %20 veya kısmi olacak
                                if back_remaining > 0 and forward_remaining>0:
                                    costs_.append((forward_remaining, back_remaining, station))
                                
                            if len(costs_) > 0:        
                                # eğer uygun istasyonlar eklendiyse listeye, forward'a göre en iyisini al ve ekle
                                best_station_cost = max(costs, key=lambda x: x[0] + x[1])
                                best_station = best_station_cost[2]
                                route.append_charge_station_at_certain_point(best_station, where)
                                break
                            else :
                                where -= 1         

                    if remaining < 0:
                        where = i
                        # şarjın negatif olduğu yerden itibaren geriye doğru giderek uygun şarj istasyonlarını keşfet
                        while where>=1:
                            
                            before_node = route.route[where-1]
                            closest_charge_stations = sorted(charge_stations, key=lambda station: before_node.distance_to(station))
                            costs = []
                            
                            for station in closest_charge_stations:
                                # en yakın istasyonları arka ve ön kısıta göre irdele
                                route.append_charge_station_at_certain_point(station, where)
                                # istasyona kadar gidebilecek mi(istasyona geldiğinde ne kadar şarjı kaldı)
                                back_remaining    = route.calculate_remaining_tank_capacity(route.route[where])
                                # istasyondan sonraki node'a gidebilecek mi (sonraki node'da ne kadar şarjı kaldı)
                                forward_remaining = route.calculate_remaining_tank_capacity(route.route[where+1]) 
                                route.remove_charge_station_from_route_at_certain_point(where)
                                if back_remaining < 0:
                                    # eğer istasyona bile gidemiyorsa dur çünkü zaten en yakın istasyona bile gidemiyorsun
                                    break
                                # burası daha sonrasında %20 veya kısmi olacak
                                if back_remaining > 0 and forward_remaining>0:
                                    costs.append((forward_remaining, back_remaining, station))
                                
                                if back_remaining < 0:
                                    # eğer istasyona bile gidemiyorsa dur çünkü zaten en yakın istasyona bile gidemiyorsun
                                    break
                                # burası daha sonrasında %20 veya kısmi olacak
                                if back_remaining > 0 and forward_remaining>0:
                                    costs.append((forward_remaining, back_remaining, station))
                                
                            
                            if len(costs) > 0 :        
                                # eğer uygun istasyonlar eklendiyse listeye, forward'a göre en iyisini al ve ekle
                                # !!!!!!!
                                # best_station_cost = max(costs, key=lambda x: x[0] + x[1])
                                # x1 = 7527
                                best_station_cost = max(costs, key=lambda x: x[0] + x[1])
                                best_station = best_station_cost[2]
                                route.append_charge_station_at_certain_point(best_station, where)
                                break
                            else :
                                where -= 1
                                                        
                    else:
                        i += 1 
        return route
    
    def repair_one_solution(self, solution: Solution):
        temp_solution = copy.deepcopy(solution)
        charge_stations = temp_solution.getAllStationInProblemFile()
        infeasible_routes = temp_solution.getInfeasibleRoutes()
        for route in infeasible_routes:
            route = self.repairRoute(route,charge_stations)
        return temp_solution
    
    def repair(self, solutions: tuple):
        repaired_solutions = []
        # print("----------------------------------------------")
        charge_stations = solutions[0][1].getAllStationInProblemFile()
        
        for solution in solutions:  
            # solution[0] = total objective 
            # solution[1] = Solution object
            infeasible_routes = solution[1].getInfeasibleRoutes()
            for route in infeasible_routes:
                route = self.repairRoute(route,charge_stations)
                
                if not route.is_feasible():
                    deneme = 1
                    
            
            repaired_solutions.append(solution)
        
        return repaired_solutions



class RandomRepair(SolutionRepairOperator):
    """ 
    Bu repair metodu her rotaya rastgele yerlere random stations atamak için yazıldı 
    Yöntem rotayı feasible hale getirmeyi garanti etmez
    """
    def __init__(self, weights=[1,1], probability=0.0):
        self.weights = weights
        self.name = "Greedy Repair Solution"
        self.probability = probability
        self.Q = 0
    
    def __str__(self):
        return "Greedy Repair Solution"
    
    def resetScore(self):
        self.score = 0. 
    
    
    def repair_one_solution(self, solution: Solution) -> Solution:
        
        charge_stations = solution.getAllStationInProblemFile()
        for route in solution.routes:
            if route.tank_capacity_constraint_violated():
                if len(route.route) < 3:
                    continue
                
                elif len(route.route) < 6:
                    random_index = random.randint(1, len(route.route)-1)
                    node = route.route[random_index]
                    nearest_station_1 = min(charge_stations, key=lambda station: node.distance_to(station))
                    route.append_charge_station_at_certain_point(nearest_station_1, random_index)
                    
                elif len(route.route) < 10:
                    random_index1 = random.randint(1, len(route.route) - 1)
                    random_index2 = random_index1
                    while random_index2 == random_index1:
                        random_index2 = random.randint(1, len(route.route) - 1)
                    
                    node1 = route.route[random_index1]
                    node2 = route.route[random_index2]
                    
                    nearest_station_1 = min(charge_stations, key=lambda station: node1.distance_to(station))
                    nearest_station_2 = min(charge_stations, key=lambda station: node2.distance_to(station))
                    
                    route.append_charge_station_at_certain_point(nearest_station_1, random_index1)
                    route.append_charge_station_at_certain_point(nearest_station_2, random_index2)
                    
                    
                    
        return solution
    
    def repair(self, solutions: list[Solution]) -> list[Solution]:
        repaired_solutions = []
        # print("----------------------------------------------")
        charge_stations = solutions[0][1].getAllStationInProblemFile()
        temp_solutions = copy.deepcopy(solutions)
        
        return repaired_solutions
        