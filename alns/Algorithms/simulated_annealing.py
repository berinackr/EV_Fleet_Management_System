import time
import copy
import random
import math
from tabulate import tabulate 
from AlnsObjects.Alns import ALNS
from AlnsObjects.Solution import Solution 
from AlnsObjects.Route import Route 
import sys
import os 

current_dir = os.path.dirname(__file__)

sys.path.append(current_dir)
from write_solution import *


def calculate_acceptance_rate(delta, temperature):
    return math.exp(-delta / temperature)
    



def SA_with_ALNS(solution: Solution, data_filename: str, parameters: dict) -> tuple[Solution]:
    
    from AlnsOperators.Operators import (
        SwapOperator,
        SolutionRepairOperator,
        CustomerInsertionOperator,
        LocalSearchOperator,
    )
    maxIterations = int(parameters["maxIterations"])
    cooling_rate = float(parameters["cooling_rate"])
    temperature = float(parameters["initial_temperature"])
        

    weights_update_interval = 5
    start_time = time.time()  
    

    start_time = time.time()  # Başlangıç zamanı alınır

    Swap_ops  = SwapOperator()
    LS_ops = LocalSearchOperator()
    CI_ops = CustomerInsertionOperator()
    Solution_ops = SolutionRepairOperator()
    
    best_solution = copy.deepcopy(solution)
    current_solution = copy.deepcopy(solution)
    i_solution = copy.deepcopy(solution)
    
    alns = ALNS(best_solution, current_solution)
    
    total_distance_list = []

    min_temperature = 0.0001
    best_solution_energy = best_solution.get_Total_Objective_Function_Value()

    results = []
    results.append((best_solution_energy, best_solution))
    
    
    time_1 = 0
    time_2 = 0
    time_3 = 0
    j = 0 
    for i in range(1,maxIterations+1):
          
        start_1 = time.time()
        i_solution = copy.deepcopy(current_solution)
        ls_ops_index = LS_ops.selectOperator()
        ls_operator = alns.localSearchOps[ls_ops_index]
        # input(f"LS Operator : {ls_operator}")
        # input(f"Current Solution Before Swap: {i_solution.routes}" )
        ls_operator.swap(i_solution)
        # input(f"Current Solution After Swap  : {i_solution.routes} ")



            
            
        end_1 = time.time()
        time_1 += (end_1 - start_1)
        

        start_2 = time.time()
        i_solution_energy = i_solution.get_Total_Objective_Function_Value()
        current_solution_energy = current_solution.get_Total_Objective_Function_Value()   
        
        if i_solution_energy < best_solution_energy:
            score_increase = 0 
        elif best_solution_energy < i_solution_energy < current_solution_energy:
            score_increase = 0
        elif i_solution_energy > current_solution_energy:
            score_increase = 0
        else:
            score_increase = 0 
        
        delta_E = abs(current_solution_energy - i_solution_energy)       
        
        acceptance_rate = calculate_acceptance_rate(delta_E, temperature)
        
        end_2 = time.time()    
        time_2 += (end_2 - start_2)
        
        start_3 = time.time()
        
        random_number = random.uniform(0,1)
        if i_solution_energy <= current_solution_energy or acceptance_rate > random_number:
            current_solution = copy.deepcopy(i_solution)
            current_solution_energy = i_solution_energy
            alns.localSearchOps[ls_ops_index].score += score_increase
            
            # current < best olmalı
            if current_solution_energy < best_solution_energy:
                
                best_solution_energy = current_solution_energy  # Güncellenmiş enerji değeri
                best_solution = copy.deepcopy(current_solution)
                results.append((best_solution.get_Total_Objective_Function_Value(), best_solution))
   
            j = 0  
             
        else:
            j += 1        

                    
        temperature *= cooling_rate
        
        end_3 = time.time()
        time_3 += (end_3 - start_3)
        
        if i % weights_update_interval == 0:
            for idx, score in enumerate(alns.swapOps):
                Swap_ops.weights[idx] += score.score

            alns.resetScoresForAllOperators()
            
        total_distance_list.append(best_solution.getTotalDistance())
        
        if i % 100 == 0 and i != 0:
            write_solution_per_100_iteration(
                data_filename=data_filename,
                i=i,
                i_solution=i_solution,
                i_energy=i_solution_energy,
                current_energy=current_solution_energy,
                best_solution=best_solution,
                best_energy=best_solution_energy,
                temperature=temperature,
                delta_E=delta_E,
                acceptance_rate=acceptance_rate
            )
        
    # Solution sort and repair   
    best_10_solution = sorted(results, key=lambda x: x[0])[:50]
    print("Ham sonuçlar  : ")
    print("--------------------|İstasyon Eklenmeden Sonuçlar|-----------------------------")
    for i in best_10_solution:
        print(i[0], i[1].routes)
    print("_______________________________________________________________________________")
    
    sa_best = best_10_solution[0][1]
    sa_best.setIterationList(maxIterations)
    sa_best.setTotalCostList(total_distance_list)
    # return sa_best, sa_best

    from AlnsOperators.RepairSolution import GreedyRepair
    greedy_repair = GreedyRepair()
    repaired_best_solutions = greedy_repair.repair(best_10_solution)
    
 
    
    print("Repaired Sonuçları  : ")
    print("--------------------|İstasyon Eklenmdikten sonra|-----------------------------")
    for i in repaired_best_solutions:
        print(i[0], i[1].routes, i[1].getSolutionWhyInfeasible())
    print("_______________________________________________________________________________")
    #input("....")
    # sort repaired solution
    repaired_sorted_best_10_solution = sorted(repaired_best_solutions, key=lambda x: x[0])[:10]
    repaired_best_solution = repaired_sorted_best_10_solution[0][1]
    # write multipe solution to console with tabulate
    write_multisolution_to_console(repaired_best_solutions)
    # scores
    print("Scores Swap_ops : ", Swap_ops.rouletteWheelSelection())
    print("Scores CI_ops : ", CI_ops.rouletteWheelSelection())    
    
    # calculate runtime 
    end_time = time.time() 
    iteration_time = end_time - start_time
    print("İterasyon süresi : ", iteration_time)
    print("\n\n")

    
    
    print("Initial solution : ", solution.routes)
    print("Initial solution total distance : ", solution.getTotalDistance())
    


    repaired_best_solution.setIterationList(maxIterations)
    repaired_best_solution.setTotalCostList(total_distance_list)
    
    if repaired_best_solution.getSolutionWhyInfeasible():
        print("İnfeasible solution : ", repaired_best_solution.getSolutionWhyInfeasible())
    print("Repaired best solution : ", repaired_best_solution.routes)
    print("Repaired best solution total distance : ", repaired_best_solution.getTotalDistance())
    return repaired_best_solution, repaired_best_solution
    """ getTotalDuration yok hatası alıyoruz."""
    """ burada kaldık , tahminimce return ettiklerimiz güncel yapı ile uyumlu değil"""

