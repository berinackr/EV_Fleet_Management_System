import os
import sys
import logging
from pathlib import Path
import xml.etree.ElementTree as ET
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("alns-test")

# Add the current directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from read_problem_instances import readRMLInstancesCloud
    from test_funcs import calculateObjectives, processTestFile
    from visualize_solution import excelResult, writeExcel, writeRML
    from Util.route4Plan import solution_to_Route4PlanXML
    from Util.route4Sim import solution_to_Route4SimXML
    from Util.route4Vehicle import solution_to_Route4VehicleXML
except ImportError as e:
    logger.error(f"Import error: {e}")
    sys.exit(1)

def setup_folders():
    """Create the necessary folders for testing"""
    # Klasör yapılandırmaları
    ALNS_INPUT_FOLDER = os.path.join("RequestData", "Input")
    XML_DATASET_FOLDER = os.path.join("RequestData", "Dataset")
    XML_OTHER_FOLDER = os.path.join(XML_DATASET_FOLDER, "RML")
    RESULTS_FOLDER = os.path.join("SolutionFiles")
    OUTPUT_RML_FOLDER = os.path.join(RESULTS_FOLDER, "RML")
    OUTPUT_EXCEL_FOLDER = os.path.join(RESULTS_FOLDER, "Excel")

    os.makedirs(ALNS_INPUT_FOLDER, exist_ok=True)
    os.makedirs(XML_OTHER_FOLDER, exist_ok=True)
    os.makedirs(RESULTS_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_RML_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_EXCEL_FOLDER, exist_ok=True)

    return {
        "input": ALNS_INPUT_FOLDER,
        "dataset": XML_DATASET_FOLDER,
        "other": XML_OTHER_FOLDER,
        "results": RESULTS_FOLDER,
        "rml": OUTPUT_RML_FOLDER,
        "excel": OUTPUT_EXCEL_FOLDER
    }

def run_test():
    """Run a test of the ALNS functionality"""
    logger.info("Starting ALNS test")
    
    # Create folders
    folders = setup_folders()
    for name, folder in folders.items():
        logger.info(f"Folder {name}: {folder}")
    
    # Sample test files
    test_files = [
        os.path.join("SampleData", "sample_info4task.xml"),
        os.path.join("SampleData", "sample_info4vehicle.xml"),
        os.path.join("SampleData", "sample_info4environment.xml"),
        os.path.join("SampleData", "sample_input.xml")
    ]
    
    # Check if test files exist
    missing_files = []
    for file in test_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        logger.error(f"Missing test files: {missing_files}")
        logger.info("Please create sample files in the SampleData directory")
        return
    
    try:
        # Read requirements from configuration
        logger.info("Reading RML instances")
        requirements_dict = readRMLInstancesCloud()
        
        # Set output paths
        requirements_dict["folder_path"] = folders["results"]
        requirements_dict["output_excel_path"] = folders["excel"]
        requirements_dict["output_xml_path"] = folders["rml"]
        requirements_dict["output_rml_path"] = folders["rml"]
        
        # Process test XML files
        xml_dataset_files = [file for file in os.listdir(folders["dataset"]) if file.endswith(".xml")]
        logger.info(f"Found {len(xml_dataset_files)} XML dataset files")
        
        if not xml_dataset_files:
            logger.warning("No XML dataset files found. Copying sample file...")
            # Copy sample file to dataset folder
            sample_path = test_files[0]
            target_path = os.path.join(folders["dataset"], "sample_info4task.xml")
            with open(sample_path, 'rb') as src, open(target_path, 'wb') as dst:
                dst.write(src.read())
            xml_dataset_files = ["sample_info4task.xml"]
        
        xmlResultsList = []
        excelResultsList = []
        
        # Process each file
        for filename in xml_dataset_files:
            file_path = os.path.join(folders["dataset"], filename)
            logger.info(f"Processing test file: {file_path}")
            
            try:
                result = processTestFile(file_path, requirements_dict)
                logger.info(f"Successfully processed file {filename}")
                
                # Benchmark
                performanceMeasure = calculateObjectives(result)
                
                # Create Excel object
                result_object = excelResult(result, performanceMeasure)
                excelResultsList.append(result_object)
                
                # Create RML objects
                route4planXML = solution_to_Route4PlanXML(result, performanceMeasure)
                route4simXML = solution_to_Route4SimXML(result)
                route4vehicleXML = solution_to_Route4VehicleXML(result)
                rmlObj = {
                    f"{result.problemFile.fileName}" : (route4planXML, route4simXML, route4vehicleXML)
                }
                xmlResultsList.append(rmlObj)
                
            except Exception as e:
                logger.error(f"Error processing {filename}: {str(e)}", exc_info=True)
                raise
        
        # Write results
        logger.info("Writing Excel results")
        writeExcel(excelResultsList, requirements_dict)
        
        logger.info("Writing RML results")
        writeRML(xmlResultsList, requirements_dict)
        
        logger.info("Test completed successfully")
        
    except Exception as e:
        logger.error(f"Error in ALNS test: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    run_test()
