import os
import time
from xml.etree import ElementTree as ET 
from start_process import startProcess
from read_problem_instances import readRequirementsFromXml, readRMLInstances
# from read_problem_instances import readRMLInstances

def main():
    
    requirements_dict = readRMLInstances()
    startProcess(requirements_dict)
    
    
if __name__ == "__main__":
    main()
