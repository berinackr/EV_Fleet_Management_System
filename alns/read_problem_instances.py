import os
import numpy as np
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer
from DataObjects.Target import Target
from DataObjects.ProblemInstances import RoutingProblemConfiguration, RoutingProblemInstance
import xml.etree.ElementTree as ET
import re 

def camel_to_snake(name):
    # CamelCase'den snake_case'e dönüştürür
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    

def readRMLInstances():
    """ 
    Read xml files and set Input.xml parameters
    Info4Vehicle, Info4ChargingStation, Info4Environment, Map4Environment
    """
    # tüm parametrelerin tutulacağı sözlük yapımız.
    requirements_dict = {}

    # Input XML içerisinden ALNS_RML okunur
    main_path = os.path.dirname(os.path.abspath(__file__))
    input_xml_path = os.path.join(main_path, "Input", "Input.xml")
    tree = ET.parse(input_xml_path)
    root = tree.getroot()
    for algorithm in root.findall('.//Algorithm[@name="ALNS_RML"]/Parameters/Parameter'):
        name = algorithm.attrib['name']
        value = algorithm.text
        requirements_dict[name] = value
        
    # Diğer verisetleri de EsoguDataset içerisinden okunur
    main_path = os.path.dirname(os.path.abspath(__file__))
    rml_input_folder = os.path.join(main_path, 'EsoguDataset', 'dataset_v3.2', "RML")
    
    Info4Vehicle = os.path.join(rml_input_folder, "Info4Vehicle.xml")
    Info4ChargingStation = os.path.join(rml_input_folder, "Info4ChargingStation.xml")
    Info4Environment = os.path.join(rml_input_folder, "Info4Environment.xml")
    Map4Environment = os.path.join(rml_input_folder, "Map4Environment.xml")

    # Read xml files
    # READ INFO4VEHICLE
    tree = ET.parse(Info4Vehicle)
    root = tree.getroot() 
    
    charge_option = str(root.find("ChargingStrategy").text)
    if charge_option == "FullCharge":
        requirements_dict["charge_option"] = "full"
    elif charge_option == "PartialCharge":
        requirements_dict["charge_option"] = "partial"
    elif charge_option == "20-80":
        requirements_dict["charge_option"] = "20-80"
        
    requirements_dict["tank_capacity"] = int(root.attrib.get("BatteryCapacity"))
    requirements_dict["vmax"] = float(root.attrib.get("MaxSpeed"))
    requirements_dict["vehicle_mass"] = int(root.attrib.get("VehicleMass"))
    requirements_dict["load_capacity"] = int(root.attrib.get("MaximumLoadCapacityKg"))
    requirements_dict["charging_rate"] = float(root.attrib.get("BatteryRechargingRate"))
    requirements_dict["fuel_consumption_rate"] = float(root.attrib.get("EnergyConsumptionRate"))
    requirements_dict["front_surface_area"] = float(root.attrib.get("FrontSurfaceArea"))
    requirements_dict["torque"] = float(root.attrib.get("Torque"))
    
    # READ INFO4ENVIRONMENT
    tree = ET.parse(Info4Environment)
    root = tree.getroot()
    requirements_dict["air_density"] = float(root.find('.//AirDensity').text)
    requirements_dict["temperature"] = float(root.find('.//Temperature').text)
    requirements_dict["humidity"] = float(root.find('.//Humidity').text)
    locale_coordinate_center = root.find('.//LocaleCoordinateCenter')
    
    graph = root.find('.//Graph')
    if locale_coordinate_center is not None:
        requirements_dict["LocaleCoordinateCenter"] = locale_coordinate_center
    
    # if graph is not None:
    #     distance_matrix = graph.find('.//DistanceMatrix')
    #     energy_matrix = graph.find('.//EnergyMatrix')
    #     if distance_matrix is not None:
    #         requirements_dict["DistanceMatrix"] = distance_matrix
    #     if energy_matrix is not None:
    #         requirements_dict["EnergyMatrix"] = energy_matrix

    # READ INFO4CHARGINGSTATION
    # tree = ET.parse(Info4ChargingStation)
    # Burada zaten environment içerisinden şarj istasyonu bilgilerini aldık

    # READ MAP4ENVIRONMENT
    # Bunu henüz kullanmıyoruz.
    # save all parameters to a file
    
    # requirements_dict = {camel_to_snake(key): value for key, value in requirements_dict.items()}

    # READ Input.xml for Algorithm parameter 
    

    return requirements_dict

def readRMLInstancesCloud():
    """ 
    Read xml files and set Input.xml parameters
    Info4Vehicle, Info4ChargingStation, Info4Environment, Map4Environment
    """
    # tüm parametrelerin tutulacağı sözlük yapımız.
    requirements_dict = {}

    # Input XML içerisinden ALNS_RML okunur
    main_path = os.path.dirname(os.path.abspath(__file__))
    input_xml_path = os.path.join(main_path, "RequestData", "Input", "Input.xml")
    tree = ET.parse(input_xml_path)
    root = tree.getroot()
    for algorithm in root.findall('.//Algorithm[@name="ALNS"]/Parameters/Parameter'):
        name = algorithm.attrib['name']
        value = algorithm.text
        requirements_dict[name] = value
        
    # Diğer verisetleri de EsoguDataset içerisinden okunur
    main_path = os.path.dirname(os.path.abspath(__file__))
    rml_input_folder = os.path.join(main_path, 'RequestData', 'Dataset', "RML")
    
    Info4Vehicle = os.path.join(rml_input_folder, "Info4Vehicle.xml")
    Info4ChargingStation = os.path.join(rml_input_folder, "Info4ChargingStation.xml")
    Info4Environment = os.path.join(rml_input_folder, "Info4Environment.xml")
    Map4Environment = os.path.join(rml_input_folder, "Map4Environment.xml")

    # Read xml files
    # READ INFO4VEHICLE
    tree = ET.parse(Info4Vehicle)
    root = tree.getroot() 
    
    charge_option = str(root.find("ChargingStrategy").text)
    if charge_option == "FullCharge":
        requirements_dict["charge_option"] = "full"
    elif charge_option == "PartialCharge":
        requirements_dict["charge_option"] = "partial"
    elif charge_option == "20-80":
        requirements_dict["charge_option"] = "20-80"
        
    requirements_dict["tank_capacity"] = int(root.attrib.get("BatteryCapacity"))
    requirements_dict["vmax"] = float(root.attrib.get("MaxSpeed"))
    requirements_dict["vehicle_mass"] = int(root.attrib.get("VehicleMass"))
    requirements_dict["load_capacity"] = int(root.attrib.get("MaximumLoadCapacityKg"))
    requirements_dict["charging_rate"] = float(root.attrib.get("BatteryRechargingRate"))
    requirements_dict["fuel_consumption_rate"] = float(root.attrib.get("EnergyConsumptionRate"))
    requirements_dict["front_surface_area"] = float(root.attrib.get("FrontSurfaceArea"))
    requirements_dict["torque"] = float(root.attrib.get("Torque"))
    
    # READ INFO4ENVIRONMENT
    tree = ET.parse(Info4Environment)
    root = tree.getroot()
    requirements_dict["air_density"] = float(root.find('.//AirDensity').text)
    requirements_dict["temperature"] = float(root.find('.//Temperature').text)
    requirements_dict["humidity"] = float(root.find('.//Humidity').text)
    locale_coordinate_center = root.find('.//LocaleCoordinateCenter')
    
    graph = root.find('.//Graph')
    if locale_coordinate_center is not None:
        requirements_dict["LocaleCoordinateCenter"] = locale_coordinate_center
    
    # if graph is not None:
    #     distance_matrix = graph.find('.//DistanceMatrix')
    #     energy_matrix = graph.find('.//EnergyMatrix')
    #     if distance_matrix is not None:
    #         requirements_dict["DistanceMatrix"] = distance_matrix
    #     if energy_matrix is not None:
    #         requirements_dict["EnergyMatrix"] = energy_matrix

    # READ INFO4CHARGINGSTATION
    # tree = ET.parse(Info4ChargingStation)
    # Burada zaten environment içerisinden şarj istasyonu bilgilerini aldık

    # READ MAP4ENVIRONMENT
    # Bunu henüz kullanmıyoruz.
    # save all parameters to a file
    
    # requirements_dict = {camel_to_snake(key): value for key, value in requirements_dict.items()}

    # READ Input.xml for Algorithm parameter 
    

    return requirements_dict

def readRequirementsFromXml() -> dict:
    """
    Input.xml içerisindeki @ALNS elementi altındaki parametreleri dictionary olarak döndürür.
    input: None
    output: dict
    """
    main_path = os.path.dirname(os.path.abspath(__file__))
    input_xml_path = os.path.join(main_path, "Input", "Input.xml")
    tree = ET.parse(input_xml_path)
    root = tree.getroot()

    requirements_dict = {}
    for algorithm in root.findall('.//Algorithm[@name="ALNS"]/Parameters/Parameter'):
        name = algorithm.attrib["name"]
        value = algorithm.text
        requirements_dict[name] = value

    return requirements_dict

def readRMLProblemInstances(file, requirements_dict):
    """
    Verilen RML uyumlu dosyadan rota problemi örneklerini okuyan fonksiyon.

    Args:
        file (str): Okunacak dosyanın adı.

    Returns:
        RoutingProblemInstance: Okunan rota problemi örneği.
    """
    
    customers = []
    fuel_stations = []
    depot = None 
    
    project_path = os.path.dirname(os.path.abspath(__file__))
    XML_DATASET_FOLDER = os.path.join("RequestData","Dataset")
    XML_OTHER_FOLDER = os.path.join(XML_DATASET_FOLDER, "RML")
    environment_file = os.path.join(XML_OTHER_FOLDER, "Info4Environment.xml")
    # rml_input_folder = os.path.join(project_path, 'EsoguDataset', 'dataset_v3.2', "RML")
    # ENVIRONMENT / Matrix
    # environment_file = os.path.join(rml_input_folder, "Info4Environment.xml")
    tree = ET.parse(environment_file)
    root = tree.getroot()
    
    graph = root.find('.//Graph')
    if graph is not None:
        _distance_matrix = graph.find('.//DistanceMatrix')
        _energy_matrix = graph.find('.//EnergyMatrix')
        if _distance_matrix is not None:
            distance_matrix_data = _distance_matrix.text
            distance_matrix_lines = distance_matrix_data.splitlines()
            distance_matrix = np.array([[float(x) for x in line.split()] for line in distance_matrix_lines])
        
        if _energy_matrix is not None:
            energy_matrix_data = _energy_matrix.text
            energy_matrix_lines = energy_matrix_data.splitlines()
            energy_matrix = np.array([[float(x) for x in line.split()] for line in energy_matrix_lines])
                
    # CS 
    for node in root.findall('Graph/Node'):
        node_type = node.get('NodeType')
        if node_type == 'ChargingStation':
            id = node.get('Name')
            idx = int(node.get('No'))
            location = node.find('Location')
            lat = float(location.find('Latitude').text)
            lon = float(location.find('Longitude').text)
            x = float(location.find('X_Coordinates').text)
            y = float(location.find('Y_Coordinates').text)
            demand = 0  
            quantity = 0
            ready_time = 0
            due_date = 0
            service_time = 0
            new_target = ChargeStation(id, idx, x, y, lat, lon, ready_time, due_date, service_time, distance_matrix, energy_matrix)
            fuel_stations.append(new_target)

    
    tree = ET.parse(file)
    root = tree.getroot()
    print("root:", root)
    # DEPOT AND CUSTOMERS
    for node in root.findall('.//Nodes/Node'):
        id = node.get('Name')
        idx = int(node.get('No')) 
        node_type = node.get('Type')  
        location = node.find('Location')
        lat = float(location.find('Latitude').text)
        lon = float(location.find('Longitude').text)
        x = float(location.find('X_Coordinates').text)
        y = float(location.find('Y_Coordinates').text)
        request_element = node.find('Requests/Request')
        if request_element is not None:
            demand = int(request_element.find('LoadInformation/Weight').text)
            quantity = int(request_element.find('LoadInformation/Quantity').text)
            ready_time = int(request_element.get('ReadyTime'))
            due_date = int(request_element.get('DueDate'))
            service_time = int(request_element.get('ServiceTime'))   
        else:
            demand = 0  
            quantity = 0
            ready_time = 0
            due_date = 0
            service_time = 0

        if node_type == 'DepoCharging':
            depot = Target(id, idx, x, y, lat, lon, ready_time, due_date, service_time, distance_matrix, energy_matrix)
        
        elif node_type == 'Delivery':
            new_target = Customer(id, idx, x, y, lat, lon, demand, quantity, ready_time, due_date, service_time, distance_matrix, energy_matrix)
            customers.append(new_target)
    
    performance_measure_element = root.find('.//PerformanceMeasure')
    if performance_measure_element is not None:
        # ObjectiveFunction Name
        objective_function_element = performance_measure_element.find('ObjectiveFunction')
        objective_function_name = objective_function_element.get('Name') 
        # MultiCriteria
        criteria_elements = performance_measure_element.findall('MultiCriteria/Criteria')
        multi_criteria_names = [criteria.get('Name') for criteria in criteria_elements if criteria is not None]
        if objective_function_name == "MinDistance":
            requirements_dict["obj_function_option"] = "total_distance"
        elif objective_function_name == "MinTime":
            requirements_dict["obj_function_option"] = "total_time"
        elif objective_function_name == "MinEnergy":
            requirements_dict["obj_function_option"] = "total_energy"
        elif objective_function_name == "MinTardiness":
            requirements_dict["obj_function_option"] = "total_tardiness"

        requirements_dict["multi_criteria"] = multi_criteria_names
    
    
    
    tank_capacity = int(requirements_dict["tank_capacity"])  # q Vehicle fuel tank capacity    
    load_capacity = int(requirements_dict["load_capacity"])  # C Vehicle load capacity
    fuel_consumption_rate = float(requirements_dict["fuel_consumption_rate"])  # r fuel consumption rate
    charging_rate = float(requirements_dict["charging_rate"]) # g inverse refueling rate
    velocity = float(requirements_dict["vmax"])
    fileName = os.path.splitext(os.path.basename(file))[0]
    fileName  = re.sub(r'-v\d+-', '-', fileName)
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
    return routing_problem_instance    