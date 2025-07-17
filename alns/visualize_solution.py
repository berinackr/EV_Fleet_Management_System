import os
from matplotlib import pyplot as plt
import pandas as pd
import json
import os 

from Util.route4Plan import solution_to_Route4PlanXML
from Util.route4Sim import solution_to_Route4SimXML
from Util.route4Vehicle import solution_to_Route4VehicleXML

from AlnsObjects.Route import Route
from AlnsObjects.Solution import Solution

def writeExcel(excelResultsList: list[dict], requirements_dict: dict) -> None:
    """ 
    Gelen results listesini bir dataframe haline getirir ve dosyaya yazar.
    
    input: 
    excelResultsList: list[dict]
    requirements_dict: dict
    
    output:
    None
    """
    obj_function_option = requirements_dict["obj_function_option"]
    charge_option       = requirements_dict["charge_option"]
    output_excel_path = requirements_dict["output_excel_path"]
    excel_filename = f"results_{obj_function_option}_{charge_option}.xlsx"


    results_df = pd.DataFrame(excelResultsList)
    
    output = os.path.join(output_excel_path, excel_filename)
    results_df.to_excel(output)
    
    
def writeRML(xmlResultsList: list[dict], requirements_dict: dict) -> None:
    """ 
    Gelen results listesini haline getirir ve dosyaya yazar.
    "c5" : (route4planXML, route4simXML, route4vehicleXML)

    input:
    xmlResultsList: list[dict]
    requirements_dict: dict
    
    output:
    None
    """
    
    output_xml_path = requirements_dict["output_xml_path"]
    os.makedirs(output_xml_path, exist_ok=True) 
    # save_XML_files(xmlResults)
    for rmlObj in xmlResultsList:
        for fileName, (route4planXML, route4simXML, route4vehicleXML) in rmlObj.items():
        # for fileName, (route4planXML) in rmlObj.items():
            # Dosya yollarını oluştur
            route4plan_path = os.path.join(output_xml_path, f"{fileName}_Route4Plan.xml")
            route4sim_path = os.path.join(output_xml_path, f"{fileName}_Route4Sim.xml")
            route4vehicle_path = os.path.join(output_xml_path, f"{fileName}_Route4Vehicle.json")

            # Route4Plan XML dosyasını yaz
            with open(route4plan_path, "w", encoding="utf-8") as xml_file:
                xml_file.write(route4planXML)

            # Route4Sim XML dosyasını yaz
            with open(route4sim_path, "w", encoding="utf-8") as xml_file:
                xml_file.write(route4simXML)

            # Route4Vehicle JSON dosyasını yaz
            with open(route4vehicle_path, "w", encoding="utf-8") as json_file:
                json.dump(route4vehicleXML, json_file, indent=4)
    
    
def excelResult(result: Solution, performanceMeasure: dict) -> dict:
    """ 
    Excel çıktısı için gerekli olan obje (Json) oluşturur ve döndürür.
    
    input:
    result: Solution
    total_distance: float
    total_energy: float
    total_time: float
    total_tardiness: float
    charging_time: float
    tw_result: list[dict]
    time_results: list[dict]
    
    output:
    dict
    """
    total_distance = performanceMeasure["total_distance"]
    total_energy =  performanceMeasure["total_energy"]
    total_time = performanceMeasure["total_time"]
    total_tardiness = performanceMeasure["total_tardiness"]
    charging_time = performanceMeasure["total_charging_time"]
    tw_result = performanceMeasure["tw_result"]
    time_results = performanceMeasure["time_results"]
    
    requirements_dict = result.requirements_dict
    operator_scores = result.alns.calculateOperatorsAndWeights()
    operator_scores_json = json.dumps(operator_scores)
    runtime = result.runtime
    obj_function_option = requirements_dict["obj_function_option"]
    charge_option       = requirements_dict["charge_option"]
    requirements_dict["charge_option"] = charge_option
    requirements_dict["obj_function_option"] = obj_function_option
    # folder_path = requirements_dict["folder_path"]
    
    maxIterations = int(requirements_dict["maxIterations"])
    N = int(requirements_dict["N"])
    K = int(requirements_dict["K"])
    Z = int(requirements_dict["Z"])
    # _filename = result.problemFile.fileName.split("-")[1]
    _filename = result.problemFile.fileName
    _num_of_ev = len(result.routes)
    _num_of_cs = result.getNumberOfStation()
    _objective = f"{obj_function_option}/{charge_option}"
    _routes = str(result.routes)
    
    obj = {
        "File": _filename,
        "Runtime for Data": runtime,
        "Number of Ev": _num_of_ev,
        "Battery": result.problemFile.config.tank_capacity,
        f"{_objective}": result.get_Total_Objective_Function_Value(),
        "Total Distance": total_distance,
        "Total Time": total_time,
        "Total Energy": total_energy,
        "Total Tardiness": total_tardiness,
        "Charging Time": charging_time,
        "Charge Count": _num_of_cs,
        "Time Window Violations": tw_result,
        "Time Results": time_results,
        "Routes": _routes,
        "Parameters": {
            "maxIterations": maxIterations,
            "Temperature": requirements_dict["initial_temperature"],
            "Cooling Rate": requirements_dict["cooling_rate"],
            "Max. iter. without imp.": N,
            "Route remove interval": K,
            "Weight update interval": Z,
            "Load Capacity": requirements_dict["load_capacity"],
            "Charging Rate": requirements_dict["charging_rate"],
        },
        "Operator Weights": operator_scores_json,
        "Infeasible Routes": str(result.getInfeasibleRoutesFinal()),
    }

    return obj

def rmlResults(result: Solution, performanceMeasure: dict) -> dict:
    """ 
        RML çıktılarını oluşturmak için gerekli fonksiyonları çağırır.
        Şu an runtime'ı arttırmamak için kullanılmamaktadır.
        input: result: Solution object
        output: dict
    """
    runtime = result.runtime 
    total_distance = performanceMeasure["total_distance"]
    total_energy = performanceMeasure["total_energy"]
    total_time = performanceMeasure["total_time"]
    total_tardiness = performanceMeasure["total_tardiness"]
    charging_time = performanceMeasure["charging_time"]
    route4planXML = solution_to_Route4PlanXML(result, runtime, total_distance=total_distance, total_energy=total_energy, total_time=total_time, total_tardiness=total_tardiness, charging_time=charging_time)
    route4simXML = solution_to_Route4SimXML(result)
    route4vehicleXML = solution_to_Route4VehicleXML(result)
    
    rmlObj = {
        f"{result.problemFile.fileName}" : (route4planXML, route4simXML, route4vehicleXML)
    }
    return route4planXML, route4simXML, route4vehicleXML
            
def saveVisualizeAllRoutes(routes, problem_instance, file_name):
    """
    Tüm rotaları görselleştiren fonksiyon.

    Args:
        routes (list): Rotaları içeren liste.
        problem_instance (RoutingProblemInstance): Rota problemi örneği.
    """
    plt.ioff()
    route_manager = Route(problem_instance.config, problem_instance.depot) 
    route_manager.route = routes
    plt.figure()
    route_manager.visualizeAllRoutes(0)
    fig=route_manager.visualizeAllRoutes(0)

    folder_path = os.path.join("SolutionFiles", file_name, "RouteGraphs")
    os.makedirs(folder_path, exist_ok=True) 
    img_path = os.path.join(folder_path, f"AllRoutes_{file_name}.png")
    fig.savefig(img_path)
    plt.close(fig)

def saveVisualizeRoutesSeperately(routes, problem_instance, file_name):
    """
    Rotaları ayrı ayrı görselleştiren fonksiyon.

    Args:
        routes (list): Rotaları içeren liste.
        problem_instance (RoutingProblemInstance): Rota problemi örneği.
    """
    route_manager = Route(problem_instance.config, problem_instance.depot) 
    route_manager.route = routes
    figList=route_manager.visualizeRoute()
    folder_path = os.path.join("SolutionFiles", file_name, "RouteGraphs")
    os.makedirs(folder_path, exist_ok=True)
    
    for i, fig in enumerate(figList, start=1):
        plt.ioff()
        plt.figure()
        img_path = os.path.join(folder_path, f"Route_{i}.png")
        fig.savefig(img_path)
        plt.close(fig)

def saveALNSResultsDevelopment(alns_solution, file_name):
    folder_path = os.path.join(filePath, file_name)
    os.makedirs(folder_path, exist_ok=True)
    plt.ioff()
    # plt.figure()

    objective = alns_solution.requirements_dict["obj_function_option"]
    fig, ax = plt.subplots()
    
    # Tüm listeleri en küçük boyuta göre eşitle
    min_length = min(len(alns_solution.iteration_list), 
                     len(alns_solution.isol_cost_list), 
                     len(alns_solution.current_cost_list), 
                     len(alns_solution.best_cost_list))

    iteration_list = alns_solution.iteration_list[:min_length]
    isol_cost_list = alns_solution.isol_cost_list[:min_length]
    current_cost_list = alns_solution.current_cost_list[:min_length]
    best_cost_list = alns_solution.best_cost_list[:min_length]

    # Çözüm grafikleri
    ax.plot(iteration_list, isol_cost_list, label='Initial Solution', linestyle='--')
    ax.plot(iteration_list, current_cost_list, label='Current Solution', linestyle='-')
    ax.plot(iteration_list, best_cost_list, label='Best Solution', linestyle='-.')

    # Eksen etiketleri ve başlık
    ax.set_xlabel('Iteration')
    ax.set_ylabel(f'Cost ({objective})')
    ax.set_title(f'ALNS Algorithm Progress - {objective}')
    ax.legend()

    # Grafiği kaydetme
    img_path = os.path.join(folder_path, f"{alns_solution.problemFile.fileName}_ALNS_Progress.png")
    fig.savefig(img_path)
    plt.close(fig)  # Açık olan figürü kapat

    # Açık tüm grafikleri kapat
    plt.close('all')



def writeSolution(routes, solution, problem_instance, data_set_path):
    """
    Verilen rotaları bir çözüm dosyasına yazan fonksiyon.
    Bu fonksiyon artık kullanılmamakta.

    Args:
        routes (list): Rotaları içeren liste.
        solution: Elde edilen çözüm.
        problem_instance (RoutingProblemInstance): Rota problemi örneği.
        data_set_path (str): Veri seti yolu.
        unfeasible_routes (list): Geçersiz rotalar listesi.
    """

    filePath = "SolutionFiles/"
    dosya_adı = data_set_path + "_solution.txt"

    # Klasörü oluştur
    folder_path = os.path.join(filePath, data_set_path)
    os.makedirs(folder_path, exist_ok=True)

    # Dosya yolunu güncelle
    file_path = os.path.join(folder_path, dosya_adı)

    with open(file_path, 'w') as dosya:
        dosya.write(f"#{data_set_path}")
        dosya.write("\n")
        dosya.write(f"{solution.getTotalDistance()}")
        dosya.write("\n")
        for i, route in enumerate(routes, start=0):
            j = 0
            for location in route.route:
                dosya.write(f"{location.id}")
                if j != len(route.route) - 1:
                    dosya.write(", ")
                j += 1
            dosya.write("\n")

        # Geçersiz rotaları dosyaya ya
        infeasible_routes = solution.getInfeasibleRoutes()
        dosya.write("\n# Infeasible Routes\n")
        
        for route in infeasible_routes:
            dosya.write("[")
            for item in route.route:
                dosya.write(item.id)
                dosya.write(", ")
            dosya.write("]")