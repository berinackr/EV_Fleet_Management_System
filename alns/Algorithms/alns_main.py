import time
import copy
import random
import math

# ALNS Sınıfları/Modelleri
from AlnsObjects.Alns import ALNS
from AlnsObjects.Solution import Solution 
from AlnsObjects.Route import Route 
# Operatörler
from AlnsOperators.Operators import (
    CustomerRemovalOperator,
    CustomerInsertionOperator,
    StationRemovalOperator,
    StationInsertionOperator,
    RouteOperator
)
from AlnsOperators.Operators import SwapOperator
from AlnsOperators.Operators import LocalSearchOperator
from AlnsOperators.RepairSolution import SolutionRepairOperator
# Data Sınıfları/Modelleri
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer
from DataObjects.Target import Target

import sys
import os 
current_dir = os.path.dirname(__file__)

sys.path.append(current_dir)
from write_solution import *

def calculate_acceptance_rate(delta, temperature):
    return math.exp(-delta / temperature)


# Orjinal alns'ye bağlı kalınan fonksiyon
def alns_main(solution: Solution, data_filename: str, parameters: dict) -> Solution:
    # Parametreler
    maxIterations = int(parameters["maxIterations"])
    cooling_rate = float(parameters["cooling_rate"])
    temperature = float(parameters["initial_temperature"])
        
    max_iter_without_improvement = int(parameters["N"])
    pre_iter_interval = int(parameters["K"])
    weights_update_interval = int(parameters["Z"])
    min_temperature = 0.000001
    
    total_distance_list = []        # en iyi değerlerin yakınsamasını grafik ile görebilmek için sonuçları bu listede tutuyorum.

    start_time = time.time()                        # Başlangıç zamanı 
    # Operatör nesneleri
    CI_ops    = CustomerInsertionOperator()         # Müşteri ekleme operatörü için
    CR_ops    = CustomerRemovalOperator()           # Müşteri kaldırma operatörü için
    SI_ops    = StationInsertionOperator()          # İstasyon ekleme operatörü için
    SR_ops    = StationRemovalOperator()            # İstasyon kaldırma operatörü için
    SW_ops    = SwapOperator()                      # 2/4 adet yerel arama/swap operatörü için
    LS_ops    = LocalSearchOperator()               # 8 adet yerel arama operatörü için
    Route_ops = RouteOperator()                     # Rota kaldırma operatörü için 
    Solution_ops = SolutionRepairOperator()         # Solution repaired için
        
    # Local Search operatörleri
    # Solutions
    i_solution = copy.deepcopy(solution)            # iterasyon boyunca değişen solution'ları tutar
    current_solution = copy.deepcopy(solution)      # şimdiki iyi çözümü tutar(kabul kriteri ile güncellenir)
    best_solution =  copy.deepcopy(solution)         # en iyi çözümü tutar, kabul kriteri ile güncellenen current_solution'dan daha iyi olmalıdır
    # objective function değerleri (örn: total_distance)
    current_energy = current_solution.get_Total_Objective_Function_Value()   
    i_energy = current_energy                       # ilk başta current_energy ile aynıdır
    best_energy = current_energy                    # ilk başta current_energy ile aynıdır
    
    alns = ALNS(best_solution, current_solution)    # ALNS nesnesi. Tüm operatör seçimleri vb bu nesne üzerinden yapılır.  
    # best solution repair edilir. Feasible çözümleri kıyaslayabilmek için 
    # kabul kriteri içerisindeki if yapısını incele
    solution_repair_op_index = Solution_ops.selectOperator()
    RE_op = alns.solutionRepairOps[solution_repair_op_index]
    # best_solution  = RE_op.repair_one_solution(best_solution)

    start = time.time()
    
    j = 0 
    si_flag = False # station insertion flag
    for i in range(1,maxIterations+1):
        
        # for x in range(0,1):
        #     local_search_index = LS_ops.selectOperator()
        #     local_search_op = alns.localSearchOps[local_search_index]
        #     local_search_op.swap(i_solution)
        
        if j == max_iter_without_improvement:
            # istasyon kaldırma operatörü 
            station_removeOp_index = SR_ops.selectOperator()
            station_removeOp = alns.stationRemovalOps[station_removeOp_index]
            station_removeOp.remove(i_solution)
            # istasyon ekleme operatörü,
            counter = 0
            station_insertOp_index = SI_ops.selectOperator()
            while i_solution.isAllRoutesFeasible() == False:
                counter += 1
                station_insertOp_index = SI_ops.selectOperator()
                station_insertOp = alns.stationInsertionOps[station_insertOp_index]
                station_insertOp.insert(i_solution)
                if counter > 10:
                    break
           
            j = 0 
            si_flag = True
        else: 
            # rota kaldırma ve müşterileri ekleme işlemi 
            if i % pre_iter_interval == 0 and i != 0:
                t_2_1 = time.time()
                route_removeOp_index = Route_ops.selectOperator()
                route_removeOp = alns.routeRemovalOps[route_removeOp_index]
                route_removeOp.remove(i_solution)

                counter = 0
                route_customer_insertOp_index = CI_ops.selectOperator()
                while len(i_solution.unserved_customers) != 0:
                    counter += 1
                    route_customer_insertOp_index = CI_ops.selectOperator()
                    route_customer_insertOp = alns.customerInsertionOps[route_customer_insertOp_index]
                    route_customer_insertOp.insert(i_solution)
                    if counter > 10:
                        break
                    
            else:
                t_2_2 = time.time()
                customer_removeOp_index = CR_ops.selectOperator()
                customer_removeOp = alns.customerRemovalOps[customer_removeOp_index]
                customer_removeOp.remove(i_solution)
                
                counter = 0
                customer_insertOp_index = None
                while len(i_solution.unserved_customers) != 0:
                    counter += 1
                    customer_insertOp_index = CI_ops.selectOperator()
                    customer_insertOp = alns.customerInsertionOps[customer_insertOp_index]
                    customer_insertOp.insert(i_solution)
                    if counter > 10:
                        break
                    

        # Unserved Kontrolü
        if len(i_solution.getUnservedCustomers()) == 0:
            i_energy = i_solution.get_Total_Objective_Function_Value()
        else : 
            i_solution = copy.deepcopy(current_solution)
        
        
        if i_energy < best_energy:
            score_increase = 0.075 
        elif best_energy < i_energy < current_energy:
            score_increase = 0.0095
        elif i_energy > current_energy:
            score_increase = 0.0045
        else:
            score_increase = 0 
        

        delta_E = abs(current_energy - i_energy)
        if delta_E == 0:
            delta_E = 1.0
        
        acceptance_rate = calculate_acceptance_rate(delta_E, temperature) 
        acceptance_rate = max(acceptance_rate, 0.0001)

        random_number = random.uniform(0,1)
        
        # Eğer 20-80 ise bu aşağıdaki kodu deneyebilirsin fakat iterasyon sayısını artırman gerekebilir.
        # if i%1000 == 0 :
        #     i_solution = RE_op.repair_one_solution(i_solution)
        #     i_energy = i_solution.get_Total_Objective_Function_Value()
            
        if i_solution.isAllRoutesFeasible():
            if not best_solution.isAllRoutesFeasible():
                best_solution = copy.deepcopy(i_solution)
                best_energy = i_energy
        
        if (i_energy < current_energy) or ( acceptance_rate > random_number):
            # print("accept")
            current_solution = copy.deepcopy(i_solution)
            current_energy = i_energy
            # LOCAL SEARCH
            local_search_index = LS_ops.selectOperator()
            local_search_op = alns.localSearchOps[local_search_index]
            local_search_op.swap(i_solution)
            new_i_energy = i_solution.get_Total_Objective_Function_Value()
            if new_i_energy < current_energy:
                ls_increase = 0.0095  
                if new_i_energy < best_energy:
                    ls_increase = 0.075    
                current_solution = copy.deepcopy(i_solution)
                current_energy = new_i_energy   
                alns.localSearchOps[local_search_index].score += ls_increase
            
            # SWAP 
            # swap_ops_index = SW_ops.selectOperator()
            # swap_operator = alns.swapOps[swap_ops_index]
            # swap_operator.swap(i_solution)
            # new_i_energy = i_solution.get_Total_Objective_Function_Value()
            # if new_i_energy < current_energy:
            #     swap_increase = 0.0095
            #     if new_i_energy < best_energy:
            #         swap_increase = 0.075
                
            #     current_solution = copy.deepcopy(i_solution) 
            #     current_energy = new_i_energy
            #     alns.swapOps[swap_ops_index].score += swap_increase
                
            if i % pre_iter_interval == 0 and i != 0:
                alns.routeRemovalOps[route_removeOp_index].score += score_increase
                alns.customerInsertionOps[route_customer_insertOp_index].score += score_increase
            elif si_flag:
                alns.stationRemovalOps[station_removeOp_index].score += score_increase
                alns.stationInsertionOps[station_insertOp_index].score += score_increase
                si_flag = False
            else:
                alns.customerRemovalOps[customer_removeOp_index].score += score_increase
                if customer_insertOp_index is not None:
                    alns.customerInsertionOps[customer_insertOp_index].score += score_increase
            
     
            if current_energy < best_energy and current_solution.isAllRoutesFeasible():
                best_solution = copy.deepcopy(current_solution)
                best_energy = current_energy
                
                
        else:
            j+=1
             

        temperature =  temperature * cooling_rate
        temperature = max(temperature, min_temperature)
    
        total_distance_list.append(best_solution.getTotalDistance())
            
        if i % weights_update_interval == 0:
            for idx, score in enumerate(alns.customerInsertionOps):
                CI_ops.weights[idx] += score.score

            for idx, score in enumerate(alns.customerRemovalOps):
                CR_ops.weights[idx] += score.score
                
            for idx, score in enumerate(alns.stationInsertionOps):
                SI_ops.weights[idx] += score.score
                
            for idx, score in enumerate(alns.stationRemovalOps):
                SR_ops.weights[idx] += score.score
                
            for idx, score in enumerate(alns.routeRemovalOps):
                Route_ops.weights[idx] += score.score
            
            for idx, score in enumerate(alns.swapOps):
                SW_ops.weights[idx] += score.score
            
            for idx, score in enumerate(alns.localSearchOps):
                LS_ops.weights[idx] += score.score
        
        if i % 100 == 0 and i != 0:
            write_solution_per_100_iteration(
                data_filename=data_filename,
                i=i,
                i_solution=i_solution,
                i_energy=i_energy,
                current_energy=current_energy,
                best_solution=best_solution,
                best_energy=best_energy,
                temperature=temperature,
                delta_E=delta_E,
                acceptance_rate=acceptance_rate
            )

    end_time = time.time()
    runtime = end_time - start_time
    best_solution.setIterationList(maxIterations)
    best_solution.setTotalDistanceList(total_distance_list)
    best_solution.setRuntime(runtime)
    best_solution.setAlnsObject(alns)
    print("Runtime  : ", runtime)
    alns.resetScoresForAllOperators()
    write_one_solution_to_console(best_solution)
    return best_solution
