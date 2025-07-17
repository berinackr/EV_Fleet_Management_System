import time
import copy
import random
import math
from tabulate import tabulate
from collections import deque
from heapq import heappush, heappop

# ALNS Sınıfları/Modelleri
from AlnsObjects.Alns import ALNS
from AlnsObjects.Solution import Solution
from AlnsObjects.Route import Route
# Operatörler
from AlnsOperators.Operators import (
    CustomerRemovalOperator,
    CustomerInsertionOperator,
    StationRemovalOperator,
    StationInsertionOperator,
    RouteOperator,
    SwapOperator,
    LocalSearchOperator
)
from AlnsOperators.RepairSolution import SolutionRepairOperator, GreedyRepair
# Data Sınıfları/Modelleri
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer
from DataObjects.Target import Target


def distance_order(solution: Solution):
    for route in solution.routes:
        customers = route.route[1:-1]
    return solution

def VNS(solution: Solution):
    config = solution.problemFile.config
    depot = solution.problemFile.depot
    all_customers = []
    for route in solution.routes:
        all_customers.extend(route.route[1:-1])  # İlk ve son elemanlar hariç

    new_routes = []
    while all_customers:
        random.shuffle(all_customers)
        all_customers = sorted(all_customers, key=lambda x: x.due_date)
        current_route = Route(config, depot)
        random_size = random.randint(3, 5)
        random_num = random.randint(2, random_size)

        if random_num > len(all_customers):
            random_num = len(all_customers)

        customers_to_add = all_customers[:random_num]
        all_customers = all_customers[random_num:]
        current_route.route.extend(customers_to_add)
        current_route.route.append(depot)
        new_routes.append(current_route)

    solution.routes = copy.deepcopy(new_routes)
    random_num = random.uniform(0, 1)
    if random_num < 0.3:
        AAP_Repaired(solution)
    return solution

def AAP_Repaired(solution: Solution):
    config = solution.problemFile.config
    depot = solution.problemFile.depot
    newRouteForTWCustomers = []
    for route in solution.routes:
        if route.tw_constraint_violated_with_Schneider():
            where = route.get_node_before_where_time_window_is_violated()
            if where:
                node_index = route.route.index(where)
                for node in route.route[node_index:-1]:
                    if isinstance(node, Customer):
                        route.route.remove(node)
                        newRouteForTWCustomers.append(node)
                        break
    while newRouteForTWCustomers:
        new_route = Route(config, depot)
        for customer in newRouteForTWCustomers:
            new_route.route.append(customer)
            new_route.route.append(depot)
            newRouteForTWCustomers.remove(customer)
            break
    return solution

def TabuSearch(solution: Solution, data_filename: str, parameters: dict):
    maxIterations = int(parameters.get('maxIterations', 1000))
    tabu_tenure  = int(parameters.get('tabu_length', 7))

    start_time = time.time()

    from AlnsOperators.Operators import (
        SwapOperator,
        LocalSearchOperator,
        CustomerInsertionOperator
    )
    Swap_ops = SwapOperator()
    LS_ops   = LocalSearchOperator()
    CI_ops   = CustomerInsertionOperator()

    from AlnsObjects.Alns import ALNS
    alns = ALNS(solution, solution)

    best_solution     = copy.deepcopy(solution)
    best_objective    = best_solution.get_Total_Objective_Function_Value()
    current_solution  = copy.deepcopy(solution)
    current_objective = current_solution.get_Total_Objective_Function_Value()

    # Tabu listesi için deque kullan
    tabu_list = deque(maxlen=tabu_tenure)

    # Yalnızca en iyi 10 çözümü saklamak için min-heap benzeri yapı
    # (heap'e eksi değerle atarak min yerine max tutabiliriz)
    best_solutions = []

    def store_best_solution(obj_val, sol, keep=10):
        # obj_val en iyiye göre düşükse listeye ekle
        heappush(best_solutions, (-obj_val, copy.deepcopy(sol)))
        # listenin boyutu 10'dan fazlaysa en kötüyü (heap'in başını) at
        if len(best_solutions) > keep:
            heappop(best_solutions)

    # Başlangıç çözümünü hemen ekle
    store_best_solution(best_objective, best_solution)

    n = 0  # İyileştirme olmadan geçen iterasyon sayısı

    def generate_neighborhood(curr_sol, alns, LS_ops, num_neighbors=5):
        neighbors = []
        for _ in range(num_neighbors):
            temp_solution = copy.deepcopy(curr_sol)
            ls_ops_index  = LS_ops.selectOperator()
            ls_operator   = alns.localSearchOps[ls_ops_index]
            # input(f"temp_solution before swap: {temp_solution.routes}")
            # input(f"ls_operator: {ls_operator}")
            ls_operator.swap(temp_solution)
            # input(f"temp_solution after swap: {temp_solution.routes}")

            neighbors.append(temp_solution)
        return neighbors

    def select_best_solution(neighborhood_solutions, tabu_list, current_sol):
        best_sol_value = current_sol.get_Total_Objective_Function_Value()
        best_sol       = copy.deepcopy(current_sol)
        for sol in neighborhood_solutions:
            if sol not in tabu_list:  # O(n) ama deque ile daha hızlı
                val = sol.get_Total_Objective_Function_Value()
                if val < best_sol_value:
                    best_sol_value = val
                    best_sol       = sol
        return best_sol

    def update_tabu_list(tabu_list, sol):
        # sol Tabu listede yoksa ekle (deque maxlen'ı otomatik eskiyi atar)
        if sol not in tabu_list:
            tabu_list.append(sol)

    for i in range(1, maxIterations + 1):
        neighborhood_solutions = generate_neighborhood(current_solution, alns, LS_ops, num_neighbors=5)
        selected_solution      = select_best_solution(neighborhood_solutions, tabu_list, current_solution)

        update_tabu_list(tabu_list, selected_solution)
        current_solution  = copy.deepcopy(selected_solution)
        current_objective = current_solution.get_Total_Objective_Function_Value()

        if current_objective < best_objective:
            best_solution   = copy.deepcopy(current_solution)
            best_objective  = current_objective
            store_best_solution(best_objective, best_solution)
            n = 0
        else:
            n += 1

        if i % 50 == 0:
            print(f"Iteration {i}: Current Obj: {current_objective}, Best Obj: {best_objective}")

        # if n == 1000:  # istersek erken durdurma
        #     print("Stuck in local minimum. Exiting...")
        #     break

    # Elimizdeki en iyi 10 çözümler
    best_10_solutions = []
    while best_solutions:
        val, sol_ = heappop(best_solutions)
        best_10_solutions.append((-val, sol_))  # Eksiyi geri al
    # küçükten büyüğe sıralanmış oluyor, istersen terse çevir
    best_10_solutions.sort(key=lambda x: x[0])

    # Greedy Repair
    greedy_repair = GreedyRepair()
    repaired_best_solutions = greedy_repair.repair(best_10_solutions)
    # Tekrar en iyi 10'u al
    repaired_best_solutions = sorted(repaired_best_solutions, key=lambda x: x[0])[:10]
    repaired_best_solution  = repaired_best_solutions[0][1]

    if repaired_best_solution.getSolutionWhyInfeasible():
        print("İnfeasible solution:", repaired_best_solution.getSolutionWhyInfeasible())

    print("Repaired best solution total distance:",
          repaired_best_solution.getTotalDistance())

    return repaired_best_solution, repaired_best_solution
