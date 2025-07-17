import os
import time

from Util.route4Plan import solution_to_Route4PlanXML
from Util.route4Sim import solution_to_Route4SimXML
from Util.route4Vehicle import solution_to_Route4VehicleXML

from test_funcs import processTestFile, calculateObjectives

from visualize_solution import excelResult, writeExcel, writeRML

def startProcess(requirements_dict: dict) -> None:
    """
    Çözülecek datasetleri alır ve çözümün yapılacağı fonksiyonu çağırır.
    Ayrıca dönen değerleri dosyalara yazdıracak fonksiyonlara yönlendirir.

    input: requirements_dict: dict
    output: None
    """
    
    folder_path = requirements_dict["folder_path"]
    # Dosya isimlerini oku ve sırala
    fileNames = sorted(os.listdir(folder_path))
    xmlResultsList = []
    excelResultsList = []
    for i in range(3):
        for fileName in fileNames:
            if fileName.endswith(".xml"):
                file_path = os.path.join(folder_path, fileName)

                start_time = time.time()
                result = processTestFile(file_path, requirements_dict)
                end_time = time.time()

                # benchmark : 
                performanceMeasure = calculateObjectives(result)
                # excel çıktısı için gerekli olan obje (Json) oluştur.
                result_object = excelResult(result, performanceMeasure)
                excelResultsList.append(result_object)
                
                # RML çıktıları için gerekli olan obje (XML) oluştur.
                # route4planXML = solution_to_Route4PlanXML(result, performanceMeasure)
                # route4simXML = solution_to_Route4SimXML(result)
                # route4vehicleXML = solution_to_Route4VehicleXML(result)
                # rmlObj = {
                #     f"{result.problemFile.fileName}" : (route4planXML, route4simXML, route4vehicleXML)
                # }
                # xmlResultsList.append(rmlObj)
                  
    writeExcel(excelResultsList, requirements_dict)
    writeRML(xmlResultsList, requirements_dict)
