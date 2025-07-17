import sys 

main_path = r"E:/Kodlar/alnsesogutest_v1"
sys.path.append(main_path)


from readProblemInstances import readProblemInstances
from initialsolution import initial_solution

file_path = r"E:/Kodlar/alnsesogutest_v1/SchneiderData/newesogu-c20-ds1.xml"
requirements_dict={"charge_option": "full", "obj_function_option": "total_distance"}
problemFile = readProblemInstances(file_path,requirements_dict=requirements_dict,)
solution = initial_solution(depot=problemFile.depot, customers=problemFile.customers, problem_instance=problemFile )

