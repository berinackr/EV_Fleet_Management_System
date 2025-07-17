from tabulate import tabulate 
from AlnsObjects.Solution import Solution 

math_model_solution = {
    "newesogu-c5-ds1"   : 4129,
    "newesogu-c10-ds1"  : 6412,
    "newesogu-c20-ds1"  : 10221,
    "newesogu-c40-ds1"  : 17463,
    "newesogu-c60-ds1"  : 33600,
    "newesogu-r5-ds1"   : 5631,
    "newesogu-r10-ds1"  : 5789,
    "newesogu-r20-ds1"  : 11682,
    "newesogu-r40-ds1"  : 21673,
    "newesogu-r60-ds1"  : 33056,
    "newesogu-rc5-ds1"  : 4982,
    "newesogu-rc10-ds1" : 6531,
    "newesogu-rc20-ds1" : 9765,
    "newesogu-rc40-ds1" : 19601,
    "newesogu-rc60-ds1" : 31789         
}



def percantage(predicted, real):
    """ 
        İki sayı arasındaki farkı yüzde olarak hesaplar.
    """
    diff = predicted - real 
    ratio = diff / real
    percantage = ratio * 100 
    return percantage

def wrap_text(text, width):
    return '\n'.join([text[i:i+width] for i in range(0, len(text), width)])

def write_multisolution_to_console(solutions):
    """ 
    Konsola birden çok çözüm yazdırır. 
    """
    data = []
    for solution in solutions:
        total_distance = solution[1].getTotalDistance()
        total_time = solution[1].getTotalDuration()
        routes_ = str(solution[1].routes)
        infeasible_routes = str(solution[1].getInfeasibleRoutes())
        
        # Metinleri sar
        wrapped_routes = wrap_text(routes_, 100)
        wrapped_infeasible_routes = wrap_text(infeasible_routes, 25)
        
        data.append([total_distance, total_time, wrapped_routes, wrapped_infeasible_routes])

    # Tabloyu yazdır
    print(tabulate(data, headers=["Distance", "Duration", "Routes", "Infeasible Routes"], tablefmt="grid"))
 
def write_one_solution_to_console(solution: Solution):
    """
    Bir çözümü konsola yazdırır.

    Args:
        solution (Solution): _description_
    """
    filename = solution.problemFile.fileName

    routes_ = str(solution.routes)
    infeasible_routes = str(solution.getInfeasibleRoutes())
    
    # Metinleri sar
    wrapped_routes = wrap_text(routes_, 100)
    wrapped_infeasible_routes = wrap_text(infeasible_routes, 25)
    
    total_distance = solution.getTotalDistance()
    total_time = solution.getTotalTime()  
    
    # math_result = math_model_solution[filename]
    # diff = percantage(total_distance, math_result)
    
    # data = [[total_distance, total_time, wrapped_routes, wrapped_infeasible_routes, math_result, diff ]]
    data = [[total_distance, total_time, wrapped_routes, wrapped_infeasible_routes]]
    # Tabloyu yazdır
    print("+-------------------------+")
    max_length = 24
    file_name_length = len(filename)
    spaces_needed = max_length - file_name_length
    spaces = " " * spaces_needed
    print(f"| \033[96m{filename}{spaces}\033[0m|")
    print("+-------------------------+")
    # print("| " , solution.problemFile.fileName, " "*135 , "|")
    print(tabulate(data, headers=["Distance", "Time", "Routes", "Infeasible Routes"], tablefmt="grid"))
      
def write_solution_per_100_iteration(data_filename, i, i_solution: Solution, i_energy, current_energy, best_solution: Solution, best_energy, temperature, delta_E, acceptance_rate):
    """ 
    Her 100 iterasyonda bir çağırılan fonksiyondur.
    """
    if best_solution is None:
        return "Feasible Best Solution is None"
    print(f"--------------------------------------{data_filename}---------------------------------------------------------")
    print(f"Temperature at iteration {i}: {temperature} ,  deltaE : {delta_E} , f(): {acceptance_rate}")
    print(f"Iteration: {i}, Routes \t\t\t: {i_solution.routes}")
    print(f"Iteration: {i}, iSolution - objective \t: {i_energy}")
    print(f"Iteration: {i}, Current - objective \t: {current_energy}")
    print(f"Iteration: {i}, Best - objective  \t: {best_energy}")
    print(f"Iteration: {i}, Unserviced Customers \t: {best_solution.getUnservedCustomers()}")
    print(f"Iteration: {i}, Infeasible Routes \t: {best_solution.getInfeasibleRoutes()}")
    print(f"Infeasible Routes Why \t\t: {set(best_solution.getSolutionWhyInfeasible())}")

    # time.sleep(1)
    print("+------------+------------+------------------------------------------------------------------------------------------------------+---------------------+\n")
