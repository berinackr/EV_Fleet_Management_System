import os
import logging
from pathlib import Path
import shutil
import subprocess
import zipfile
import xml.etree.ElementTree as ET
from fastapi import FastAPI, File, UploadFile, HTTPException

from typing import List
from fastapi.responses import FileResponse, JSONResponse
from Util.route4Plan import solution_to_Route4PlanXML
from Util.route4Sim import solution_to_Route4SimXML
from Util.route4Vehicle import solution_to_Route4VehicleXML
from read_problem_instances import readRMLInstancesCloud
from test_funcs import calculateObjectives, processTestFile
from visualize_solution import excelResult, writeExcel, writeRML
from fastapi.middleware.cors import CORSMiddleware

# Setup logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                   handlers=[logging.StreamHandler()])
logger = logging.getLogger("alns-server")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # veya ["*"] tüm origin'lere izin vermek için
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Klasör yapılandırmaları
ALNS_INPUT_FOLDER = os.path.join("RequestData", "Input")  # Kullanıcıdan alınan dosyaların geçici olarak saklandığı klasör
XML_DATASET_FOLDER = os.path.join("RequestData","Dataset") # 
XML_OTHER_FOLDER = os.path.join(XML_DATASET_FOLDER, "RML") # Diğer Info4'lar 
RESULTS_FOLDER = os.path.join("SolutionFiles")
OUTPUT_RML_FOLDER = os.path.join(RESULTS_FOLDER, "RML")
OUTPUT_EXCEL_FOLDER = os.path.join(RESULTS_FOLDER, "Excel")

os.makedirs(ALNS_INPUT_FOLDER, exist_ok=True)
os.makedirs(XML_OTHER_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_RML_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_EXCEL_FOLDER, exist_ok=True)


def clean_requests():
    try:
        dataset_dir = XML_DATASET_FOLDER
        input_dir = ALNS_INPUT_FOLDER
        solution_files = RESULTS_FOLDER
        if os.path.exists(dataset_dir):
            shutil.rmtree(dataset_dir)
        if os.path.exists(input_dir):
            shutil.rmtree(input_dir)
        # if os.path.exists(solution_files):
        #     shutil.rmtree(solution_files)
        # Silinen klasörlerin yeniden oluşturulması
        os.makedirs(dataset_dir, exist_ok=True)
        os.makedirs(input_dir, exist_ok=True)
        os.makedirs(XML_OTHER_FOLDER, exist_ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning directories: {str(e)}")

def clean_solutions():
    try:
        solution_files = RESULTS_FOLDER
        if os.path.exists(solution_files):
            shutil.rmtree(solution_files)
        os.makedirs(solution_files, exist_ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning directories: {str(e)}")

@app.get("/hello")
async def hello_world():
    return {"message": "Hello, World!"}

@app.get("/")
async def root():
    return {"message": "ALNS API is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring services"""
    return {
        "status": "ok", 
        "service": "ALNS API", 
        "version": "5.2",
        "endpoints": [
            {"path": "/", "method": "GET", "description": "Root endpoint"},
            {"path": "/hello", "method": "GET", "description": "Test endpoint"},
            {"path": "/health", "method": "GET", "description": "Health check endpoint"},
            {"path": "/start_alns", "method": "POST", "description": "Start ALNS algorithm with uploaded files"}
        ]
    }

@app.post("/start_alns", response_class=FileResponse)
async def start_alns(input_files: List[UploadFile] = File(...)):
    """
    ALNS algoritmasının çalıştırılması:
      1. Yüklenen dosyalar ilgili klasörlere kaydedilir.
      2. Ana input XML (Input.xml) CLIENT_INPUT_FOLDER'dan okunur.
      3. XML dosyaları XML_DATA_FOLDER'dan alınır ve algoritma çalıştırılır.
      4. Çıktı metrikleri hesaplanıp XML/Excel dosyaları oluşturulup zip arşivi haline getirilir.
    """
    logger.info(f"ALNS processing started with {len(input_files)} files")
    
    clean_solutions()
    clean_requests()

    os.makedirs(ALNS_INPUT_FOLDER, exist_ok=True)
    os.makedirs(XML_OTHER_FOLDER, exist_ok=True)
    os.makedirs(RESULTS_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_RML_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_EXCEL_FOLDER, exist_ok=True)
    
    for input_file in input_files:
        try:
            logger.info(f"Processing file: {input_file.filename}")
            contents = await input_file.read()
            if input_file.filename == "Input.xml":
                save_path = os.path.join(ALNS_INPUT_FOLDER, "Input.xml")
                logger.info(f"Saving Input.xml to {save_path}")
            else:
                try:
                    root = ET.fromstring(contents)
                except ET.ParseError as pe:
                    logger.error(f"XML parse error for {input_file.filename}: {pe}")
                    raise HTTPException(status_code=400, detail=f"XML parse hatası ({input_file.filename}): {pe}")
                
                if root.tag == "Info4Vehicle":
                    save_path = os.path.join(XML_OTHER_FOLDER, "Info4Vehicle.xml")
                elif root.tag == "Info4Environment":
                    save_path = os.path.join(XML_OTHER_FOLDER, "Info4Environment.xml")
                elif root.tag == "Info4ChargingStation":
                    save_path = os.path.join(XML_OTHER_FOLDER, "Info4ChargingStation.xml")
                elif root.tag == "net":
                    save_path = os.path.join(XML_OTHER_FOLDER, "Map4Environment.xml")
                elif root.tag == "Info4Task":
                    save_path = os.path.join(XML_DATASET_FOLDER, input_file.filename)
                else:
                    logger.error(f"Unexpected root element in {input_file.filename}: {root.tag}")
                    raise HTTPException(status_code=400, detail=f"{input_file.filename} dosyasında beklenmeyen root elementi: {root.tag}")
                
                logger.info(f"Saving {input_file.filename} to {save_path}")
            
            with open(save_path, "wb") as f:
                f.write(contents)
        except Exception as e:
            logger.error(f"Error processing file {input_file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            await input_file.close()

    try:
        logger.info("Reading RML instances...")
        requirements_dict = readRMLInstancesCloud()
        
        requirements_dict["folder_path"] = os.path.join(RESULTS_FOLDER)
        requirements_dict["output_excel_path"] = os.path.join(OUTPUT_EXCEL_FOLDER)
        requirements_dict["output_xml_path"] = os.path.join(OUTPUT_RML_FOLDER)
        requirements_dict["output_rml_path"] = os.path.join(OUTPUT_RML_FOLDER)
        folder_path = XML_DATASET_FOLDER

        xml_dataset_files = [file for file in os.listdir(XML_DATASET_FOLDER) if file.endswith(".xml")]
        logger.info(f"Found {len(xml_dataset_files)} XML dataset files")
        
        xmlResultsList = []
        excelResultsList = []
        
        for filename in xml_dataset_files:
            if filename.endswith('.xml'):
                file_path = os.path.join(folder_path, filename)
                logger.info(f"Processing test file: {file_path}")

                try:
                    result = processTestFile(file_path, requirements_dict)
                    logger.info(f"Test file processed successfully")
                    
                    # benchmark : 
                    performanceMeasure = calculateObjectives(result)
                    
                    # excel çıktısı için gerekli olan obje (Json) oluştur.
                    result_object = excelResult(result, performanceMeasure)
                    excelResultsList.append(result_object)
                                
                    # RML çıktıları için gerekli olan obje (XML) oluştur.
                    route4planXML = solution_to_Route4PlanXML(result, performanceMeasure)
                    route4simXML = solution_to_Route4SimXML(result)
                    route4vehicleXML = solution_to_Route4VehicleXML(result)
                    rmlObj = {
                        f"{result.problemFile.fileName}" : (route4planXML, route4simXML, route4vehicleXML)
                    }
                    xmlResultsList.append(rmlObj)
                    logger.info(f"Results created for {filename}")
                except Exception as e:
                    logger.error(f"Error processing {filename}: {str(e)}", exc_info=True)
                    raise HTTPException(status_code=500, detail=f"Error processing {filename}: {str(e)}")
        
        logger.info("Writing Excel results...")
        writeExcel(excelResultsList, requirements_dict)
        
        logger.info("Writing RML results...")
        writeRML(xmlResultsList, requirements_dict)
        
        zip_filename = "results_and_rml_files.zip"
        zip_filepath = os.path.join(RESULTS_FOLDER, zip_filename)
        logger.info(f"Creating zip file: {zip_filepath}")

        try:
            with zipfile.ZipFile(zip_filepath, 'w') as zipf:
                # RESULTS_FOLDER içerisindeki Excel dosyalarını ekle
                for excel_file in os.listdir(OUTPUT_EXCEL_FOLDER):
                    excel_file_path = os.path.join(OUTPUT_EXCEL_FOLDER, excel_file)
                    zipf.write(excel_file_path, arcname=os.path.join("Excel", excel_file))  # Excel alt klasörüne ekleme
                    logger.info(f"Excel file added to zip: {excel_file_path}")

                # OUTPUT_RML_FOLDER içerisindeki RML dosyalarını ekle
                for rml_file in os.listdir(OUTPUT_RML_FOLDER):
                    rml_file_path = os.path.join(OUTPUT_RML_FOLDER, rml_file)
                    zipf.write(rml_file_path, arcname=os.path.join("RML", rml_file))  # RML alt klasörüne ekleme
                    logger.info(f"RML file added to zip: {rml_file_path}")
        except Exception as e:
            logger.error(f"Error creating zip file: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Zip dosyası oluşturulurken hata oluştu: {str(e)}")
            
        finally:
            clean_requests()# Port changed from 8002 to 8005
            logger.info(f"Returning zip file: {zip_filepath}")
            return FileResponse(
                zip_filepath, 
                media_type="application/zip", 
                filename=zip_filename,
                headers={"Connection": "close"}
            )
    except Exception as e:
        logger.error(f"Error in ALNS process: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"ALNS işleminde hata: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)  # Changed from 127.0.0.1 to 0.0.0.0 and port from 8002 to 8005

