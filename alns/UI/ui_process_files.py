import os
import sys 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from Algorithms.alns_main import alns_main  # Gerekli işlevi veya sınıfı içe aktarın

import time

from initialsolution import initial_solution
from AlnsObjects import Route, Solution
from readProblemInstances import readProblemInstances
from visualize_solution import  saveALNSResultsDevelopment, saveVisualizeAllRoutes, saveVisualizeRoutesSeperately, writeSolution
from test_funcs import solution_to_xml
import pandas as pd 
from test_funcs import process_test_file

def ui_process_files(parameters: dict, dataset_path: list):
    """ 
        main.py ile aynı kod, test files tek tek alınır ve algoritma tarafından işlenir.
        Farkı UI tarafından başlatılmasıdır. 
    """
    project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    folder_path = os.path.join(project_path, 'SchneiderData')
    j = 0 
    results = []
    results_to_be_displayed = []
    results_xml = []
    obj_function_option = parameters["obj_function_option"]
    charge_option = parameters["charge_option"]
    maxIterations = parameters["maxIterations"]
    N = parameters["N"]
    K = parameters["K"]
    Z = parameters["Z"]
    
    for filename in dataset_path:
        
        start_time = time.time()
        print("Processing file: ", filename)
        
        result = process_test_file(file_path=filename, parameters=parameters)
        
        end_time = time.time()
        runtime = end_time - start_time
        # xml çıktısı için
        # Routing XML çıktıları için 
        # route4planXML = solution_to_Route4PlanXML(result, runtime)    
        # route4simXML = solution_to_Route4SimXML(result)
        
        # excel çıktısı için
        
        
        _filename = os.path.basename(filename).split("-")[1]
        _num_of_ev = len(result.routes)
        _objective = f"{obj_function_option}/{charge_option}"
        _routes = str(result.routes)
        
        total_distance, total_energy, total_time, charging_time, charge_count, tw_result = calculate_objectives(result)
        
        results.append({
                'File': _filename ,
                'Runtime for Data': runtime,
                'Number of Ev' : _num_of_ev,
                'Battery' : result.problemFile.config.tank_capacity,
                f'Objective {_objective}' : result.get_Total_Objective_Function_Value(),
                'Total Distance': total_distance,
                'Total Time': total_time,
                'Total Energy': total_energy,
                'Charging Time': charging_time,
                'Charge Count': charge_count,
                'Time Window Violations': tw_result,
                'Routes' : _routes,
                'Iteration': maxIterations,
                'Max iter. without improvement': N,
                'Route remove interval': K,
                'Weight update interval': Z,
                'Infeasible Routes': str(result.getInfeasibleRoutes())
            })     
        
        results_to_be_displayed.append(result)

    results_df = pd.DataFrame(results)
    output_excel_path = f'SolutionFiles/results_{obj_function_option}_{charge_option}.xlsx'
    results_df.to_excel(output_excel_path)
    # with open("", "wb") as f:
    #     f.write(result.encode("utf-8"))
    return results_to_be_displayed

def calculate_objectives(solution: Solution):
    
    total_distance = 0
    total_energy = 0
    total_time = 0 
    charging_time = 0
    charge_count = 0 
    tw_result = []
    
    for route in solution.routes:
        total_distance += route.calculate_total_distance()
        total_energy += route.calculate_total_energy()
        total_time += route.calculate_total_time()
        charging_time += route.calculate_charging_time()
        charge_count += route.calculate_number_of_visit_station()
        tw_route = {}
        for item in route.route:
            tw_route[item.id] = (item.ready_time, item.service_time, item.due_date) 
        tw_result.append(tw_route)
        
    return total_distance, total_energy, total_time, charging_time, charge_count, tw_result
