
import sys
main_path = r"E:/Kodlar/alnsesogutest_v1/Tests"
sys.path.append(main_path)

from initial_solution import solution 

print(solution)

from AlnsOperators.Operators import (
    CustomerInsertionOperator,
    CustomerRemovalOperator,
    RouteOperator,
    StationInsertionOperator,
    StationRemovalOperator,
)

import DataObjects.Target
import DataObjects.ChargeStation
from AlnsObjects import Solution
from AlnsObjects.Alns import ALNS

CI_   = CustomerInsertionOperator()
CR_   = CustomerRemovalOperator()
SI_   = StationInsertionOperator()
SR_   = StationRemovalOperator()
RO_   = RouteOperator() 
alns  = ALNS(solution, solution)

CI_index = CI_.selectOperator()
CR_index = CR_.selectOperator()
SI_index = SI_.selectOperator()
SR_index = SR_.selectOperator()
RO_index = RO_.selectOperator()

 
CR_operator = alns.customerRemovalOps[CR_index]
CI_operator = alns.customerInsertionOps[CI_index]
SR_operator = alns.stationRemovalOps[SR_index]
SI_operator = alns.stationInsertionOps[SI_index]
RO_operator = alns.routeRemovalOps[RO_index]

print("SOLUTION : ", solution.routes)
SR_operator.remove(solution)
print("unfeasible : ",solution.getUnfeasibleRoutes())
print("REMOVE :", solution.routes)
SI_operator.insert(solution)
print("sonuç :", solution.routes)
# CR_operator.remove(solution)
# print("REMOVE :", solution.routes)
# deneme = CI_operator.insert(solution)
# print("INSERT :", deneme.routes)
# CI_operator.insert(solution)
# random customer change in solution

print("------------------------------------")
print(CI_operator)
print(CR_operator)
print(SI_operator)
print(SR_operator)
print(RO_operator)
print("------------------------------------")
