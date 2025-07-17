import sys
import os

project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_path)
from problemInstances import RoutingProblemConfiguration, RoutingProblemInstance 
from AlnsObjects.Solution import Solution
from AlnsObjects.Route import Route
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer
from DataObjects.Target import Target
import xml.etree.ElementTree as ET
import numpy as np


def get_requirements_with_xml() -> dict:
    
    input_xml_path = os.path.join(project_path, 'Input', 'Input.xml')
    tree = ET.parse(input_xml_path)
    root = tree.getroot()
    
    requirements_dict = {}
    for algorithm in root.findall('.//Algorithm[@name="ALNS"]/Parameters/Parameter'):
        name = algorithm.attrib['name']
        value = algorithm.text
        requirements_dict[name] = value
        
    return requirements_dict

def array_to_solution(routes):
    
    tree = ET.parse(file)
    root = tree.getroot()
    
    dijkstra_matrix_data = root.find(dijkstra_matrix_tag).text
    matrix_lines = dijkstra_matrix_data.splitlines()
    
    try : 
        result = []
        for line in matrix_lines:
            row = []
            for x in line.split():
                num = int(x)
                row.append(num)
            result.append(row)
            
        distance_matrix = np.array(result)
    except ValueError:
        print("x : ", x, "  |  ", line)
        input("durdum")
    points = root.find("Points")
    total_solution = 0        
    
    for route in routes:
        left = None
        right = None
        route_solution = 0
        last_part = 0
        for index in range(1,len(route)):
            
            left = index-1 
            right = index
            
            for point in points:
                left_item = route[left].replace(" ", "")
                
                if point.attrib["Name"] == left_item :
                    left_index = int(point.attrib["No"]) - 1
                    
                right_item = route[right].replace(" ", "")
                if point.attrib["Name"] == right_item :
                    right_index = int(point.attrib["No"]) - 1    
                    
            print(f"{route[left]}({left_index}) - {route[right]}({right_index}) \t: {distance_matrix[left_index][right_index]}")        
            route_solution += distance_matrix[left_index][right_index]
            # if route_solution > 3000:
            #     print(f"! ! ! !")        

            if "cs" in route[index]  :
                print("---------------------------------", "+", route_solution, "  |  ", 3000 - (route_solution - last_part))
                last_part = route_solution    
            
            
        total_solution += route_solution

    print("Total Solution : ", total_solution)

def array_to_solution_with_objective(routes: list[list], requirements_dict: dict) -> Solution:
    
    
    tree = ET.parse(matrix_file)
    root = tree.getroot()
    # Distance matrix verisini al
    distance_matrix_data = root.find(distance_matrix_tag).text
    energy_matrix_data = root.find(energy_matrix_tag).text

    # Distance matrix verisinden metin verisini al ve boşluklara göre ayırarak distance matrix oluştur
    distance_matrix_lines = distance_matrix_data.splitlines()
    distance_matrix = np.array([[float(x) for x in line.split()] for line in distance_matrix_lines])
    
    # Energy matrix verisinden metin verisini al ve boşluklara göre ayırarak energy matrix oluştur
    energy_matrix_lines = energy_matrix_data.splitlines()
    energy_matrix = np.array([[float(x) for x in line.split()] for line in energy_matrix_lines])
    

    tree = ET.parse(request_file)
    root = tree.getroot()
    customers = []
    fuel_stations = []
    depot = None 
    
    for point in root.findall('Point'):
        id = point.get('Name') 
        idx = int(point.get('No'))
        x = float(point.get('X'))
        y = float(point.get('Y'))
        lat = float(point.get('lat'))
        lon = float(point.get('lon'))
        request_element = point.find('Requests/Request')
        
        if request_element is not None:
            demand = int(request_element.get('TotalWeight', '0'))
            ready_time = int(request_element.get('ReadyTime', '0'))
            due_date = int(request_element.get('DueDate', '0'))
            service_time = int(request_element.get('ServiceTime', '0'))
            quantity = int(request_element.get('Quantity', '0'))
        else:
            demand = 0  # Requests/Request öğesi bulunmuyorsa, varsayılan olarak 0 kullanılıyor
            ready_time = 0
            due_date = 0
            service_time = 0
            quantity = 0 
            
        if point.get('Type') == 'DepoCharging':
            depot = Target(id, idx, x, y, lat, lon, ready_time, due_date, service_time, distance_matrix, energy_matrix)

        elif point.get('Type') == 'Charging' or point.get('Type') == 'DepoCharging':
            new_target = ChargeStation(id, idx, x, y, lat, lon, ready_time, due_date, service_time, distance_matrix, energy_matrix)
            fuel_stations.append(new_target)

        elif point.get('Type') == 'Delivery':
            new_target = Customer(id, idx, x, y, lat, lon, demand, quantity, ready_time, due_date, service_time, distance_matrix, energy_matrix)
            customers.append(new_target)
              
        
 
    tank_capacity = int(requirements_dict["tank_capacity"])  # q Vehicle fuel tank capacity    
    load_capacity = int(requirements_dict["load_capacity"])  # C Vehicle load capacity
    fuel_consumption_rate = 1.0  # r fuel consumption rate
    charging_rate = 0.18 # g inverse refueling rate
    velocity = float(requirements_dict["vmax"])
    tank_capacity = int(requirements_dict["tank_capacity"])  # q Vehicle fuel tank capacity    
    load_capacity = int(requirements_dict["load_capacity"])  # C Vehicle load capacity
    fuel_consumption_rate = 1.0  # r fuel consumption rate
    charging_rate = 0.18 # g inverse refueling rate
    velocity = float(requirements_dict["vmax"])
    fileName = "isimyok"
    routing_problem_configuration = RoutingProblemConfiguration(
        tank_capacity,
        load_capacity,
        fuel_consumption_rate,
        charging_rate,
        velocity,
        requirements_dict
    )
    routing_problem_instance = RoutingProblemInstance(
        routing_problem_configuration, depot, customers, fuel_stations, fileName
    )

    unserved_customers = []
    served_customers = []
    solution_routes = []
    for route in routes:
        initial_route = Route(routing_problem_instance.config, routing_problem_instance.depot)
        
        for node in route:
            if node == "cs5" :
                continue
            elif "cs" in node:
                for fuel_station in fuel_stations:
                    if fuel_station.id == node:
                        initial_route.route.append(fuel_station)
                        break
            else:
                for customer in customers:
                    if customer.id == node:
                        initial_route.route.append(customer)
                        served_customers.append(customer)
                        break 
        
        initial_route.route.append(depot)   
        solution_routes.append(initial_route)
        
    solution = Solution(unserved_customers, served_customers, solution_routes, routing_problem_instance)  
    return solution
    
def get_Solution(routes, problem_instance):
    
    unserved_customers = []
    served_customers = []

    solution = Solution(unserved_customers, served_customers, routes, problem_instance)
    return solution

def string_to_array(string_data):

    cleaned_data = string_data.strip("[]").replace("], ", "]|").split("|")
    final_data = [[item.strip(" '[]") for item in row.split(",")] for row in cleaned_data]

    return final_data



file = os.path.join(project_path, "SchneiderData", "dataset", "newesogu-c10-ds1.xml")
request_file = os.path.join(project_path, "Tests", "data", "all_requests.xml")
matrix_file = os.path.join(project_path, "Tests", "data", "matrix.xml")
distance_matrix_tag = 'DistanceMatrix'
dijkstra_matrix_tag = 'DijkstraMatrix'
energy_matrix_tag = 'EnergyMatrix'

requirements_dict = get_requirements_with_xml()

my_solution = "[[cs5, 32, 19, cs6, 31, 60A/2, 75, cs3, cs5, ]]"
my_solution = string_to_array(my_solution)
solution = array_to_solution_with_objective(my_solution, requirements_dict)


for route in solution.routes:
    
    for node in route.route:
        if type(node) == ChargeStation or type(node) == Target:
            print(f"{node.id} ,  location : ({node.lat:.6f} - {node.lon:.6f}), [{node.ready_time} - {node.service_time} - {node.due_date}]")
        else: 
            print(f"{node.id} ,  location : ({node.lat:.6f} - {node.lon:.6f}), demand : {node.demand},   [{node.ready_time} - {node.service_time}- {node.due_date}]")