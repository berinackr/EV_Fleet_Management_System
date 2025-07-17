
import os
import json 
from AlnsObjects import Route, Solution

from read_problem_instances import *
from initialsolution import *
from Algorithms.alns_main import alns_main
from visualize_solution import saveALNSResultsDevelopment, saveVisualizeAllRoutes, saveVisualizeRoutesSeperately


def calculateObjectives(solution: Solution) -> dict:
    """ 
    Excel çıktsı oluştururken kullanılacak metriklerin hesaplanmasını sağlar. 
    Ayrıca JSON olarak tüm rota ve node bilgilerini de hesaplamaktadır. 
    
    args:
    solution: Solution object 
    
    Returns:
    total_distance: float
    total_energy: float
    total_time: float
    total_tardiness: float
    total_charging_time: float
    charge_count: int
    tw_result: list[dict]
    time_results: list[dict] 
    """
    total_distance = 0
    total_energy = 0
    total_time = 0 
    total_charging_time = 0
    total_tardiness = 0 
    charge_count = 0 
    tw_result = []
    time_result = []
    
    for route_id, route in enumerate(solution.routes):
        isFeasible = route.is_feasible_all()
        route_distance = route.calculate_total_distance()
        route_energy = route.calculate_total_energy()
        route_time = route.calculate_total_time()
        
        route_charging_time = route.calculate_charging_time()
        
        total_distance += route_distance
        total_energy += route_energy
        total_time += route_time
        
        total_charging_time += route_charging_time
        
        arrival_time = route.calculate_arrival_time()
        waiting_time = route.calculate_waiting_time()
        route_tardiness = route.calculate_total_tardiness()
        total_tardiness += route_tardiness
        # charge_count += route.calculate_number_of_visit_station()
        tw_route = {}
        for item in route.route:
            tw_route[item.id] = (item.ready_time, item.service_time, item.due_date) 
        tw_result.append(tw_route)
        
        
        
        tdistance = 0
        route_data = []
        for i in range(1, len(route.route)):
            before = route.route[i - 1]
            after = route.route[i]
            distance = before.distance_to(after)
            tdistance += distance
            remaining_tank = route.calculate_remaining_tank_capacity(after)
            
            json_data = {
                f"{before.id} -> {after.id}": {
                    "Arrival Time": after.arrival_time,
                    "Waiting Time": after.waiting_time,
                    "Tardiness": after.tardiness,
                    "Distance": distance,
                    "Remaining Tank": remaining_tank,
                    "TW": f"[{after.ready_time} - {after.service_time} - {after.due_date}]",
                },
            }
            
            route_data.append(json_data)
            
        route_json = {
            "Route": route_id,
            "Route IsFeasible" : isFeasible,
            "Route Distance" : route_distance,
            "Route Energy": route_energy,
            "Route Time": route_time,
            "Route Tardiness": route_tardiness,
            "Route Waiting Time" : waiting_time,
            "Route Charging Time": route_charging_time,
            "Route": str(route),
            "Data": route_data,
        }
        
        # solution_json = {
        #     "Solution": "solution_name",
        #     "Total Distance": total_distance,
        #     "Total Energy": total_energy,
        #     "Total Time": total_time,
        #     "Total Tardiness": total_tardiness,
        #     "Total Charging Time": total_charging_time,
        #     "Charge Count": charge_count,
        #     "Time Window Violations": tw_result,
        #     "Routes": route_json,
        # }
        
        time_result.append(route_json)
        json_results = json.dumps(time_result)
        
        
    obj = {
        "total_distance": total_distance,
        "total_energy": total_energy,
        "total_time": total_time,
        "total_tardiness": total_tardiness,
        "total_charging_time": total_charging_time,
        "tw_result": tw_result,
        "time_results": json_results
        
    }
    
    return obj

def processTestFile(file_path: str, parameters: dict) -> Solution:
    """
    Verilen dosya pathi okunarak Instance oluşturmak için ve çözdürüp Visualize etmek için gerekli fonksiyonları çağıran metod.
    
    input:
    
    file_path: str
    parameters: dict
    
    output:
    
    Solution, Solution
    """

    data_filename = os.path.basename(file_path)
    problem_instance = readRMLProblemInstances(file_path, parameters)
    initial_solution = initialSolution(
        depot=problem_instance.depot,
        customers=problem_instance.customers,
        problem_instance=problem_instance,
    )
    
   
    file_name = os.path.splitext(os.path.basename(file_path))[0]
    # file_name = file_name.split("-")[1]
    alns_solution = alns_main(
        solution=initial_solution, data_filename=data_filename, parameters=parameters
    )    
    
    return alns_solution
