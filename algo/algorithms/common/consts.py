import math


INDOOR = True

# +------------------+
# | robot dimensions |
# +------------------+

ROBOT_WIDTH = 25
ROBOT_HEIGHT = 28
ROBOT_ACTUAL_WIDTH = 18.6
ROBOT_ACTUAL_HEIGHT = 23
ROBOT_VERT_OFFSET = (ROBOT_HEIGHT - ROBOT_ACTUAL_HEIGHT) / 2

# +--------------------+
# | collision checking |
# +--------------------+
"""
  # TODO: Measureable
  WPS: Waypoints
  Measure using Bottom Left of Robot
"""
# Indoor
WPS_FL_IN = [
    (  -0.5826683705,   4.425805671,  math.radians(15)),
    (  -2.290965595,   8.55,  math.radians(30)),
    (  -5,  12.1, math.radians(45))
]

WPS_FR_IN = [
    (  1.305040853,  9.912769427,   -math.radians(15)),
    (  5.131227035,  19.15,  -math.radians(30)),
    ( 11.4,  26.9,  -math.radians(45))
]

WPS_BR_IN = [
    (  1.318670523, -10.01629705,   math.radians(15)),
    (  5.184816874, -19.35,  math.radians(30)),
    ( 10.3, -28.4,  math.radians(45))
]

WPS_BL_IN = [
    (  -0.5962980399, -4.529333289,  -math.radians(15)),
    (  -2.344555434, -8.75,  -math.radians(30)),
    (  -5.1, -12.4,  -math.radians(45))
]

# Outdoor
WPS_FL_OUT = [
    (-0.6, 4.8, math.radians(15)),
    (-2.5, 9.3, math.radians(30)),
    (-5.4, 13.1, math.radians(45))
    ]
WPS_FR_OUT = [
    (1.4, 10.3, -math.radians(15)),
    (5.3, 19.9, -math.radians(30)),
    (11.6, 28.2, -math.radians(45))
    ]
WPS_BR_OUT = [
    (1.3, -10.0, math.radians(15)),
    (5.2, -19.4, math.radians(30)),
    (10.9, -27.9, math.radians(45))
    ]
WPS_BL_OUT = [
    (-0.7, -5.0, -math.radians(15)),
    (-2.6, -9.7, -math.radians(30)),
    (-5.1, -14.3, -math.radians(45))
    ]

WPS_FL = WPS_FL_IN if INDOOR else WPS_FL_OUT
WPS_FR = WPS_FR_IN if INDOOR else WPS_FR_OUT
WPS_BR = WPS_BR_IN if INDOOR else WPS_BR_OUT
WPS_BL = WPS_BL_IN if INDOOR else WPS_BL_OUT

BUFFER = 5.01

# +-------+
# | astar |
# +-------+
"""
  Ellipse Equation's `A` and `B` where `A` is the X radius / semi-major axis, and `B` is the Y radius / semi-minor axis
"""
# Indoor (SCSE Lab)
FL_A_IN, FL_B_IN = 17.1,  17.1
FR_A_IN, FR_B_IN = 38.3,  38.3
BR_A_IN, BR_B_IN = 38.7,  38.7
BL_A_IN, BL_B_IN = 17.5,  17.5

# Outdoor (SCSE Corridor)
FL_A_OUT, FL_B_OUT = 18.5, 18.5
FR_A_OUT, FR_B_OUT = 39.8, 39.8
BR_A_OUT, BR_B_OUT = 38.8, 38.8
BL_A_OUT, BL_B_OUT = 19.4, 19.4

FL_A, FL_B = (FL_A_IN, FL_B_IN) if INDOOR else (FL_A_OUT, FL_B_OUT)
FR_A, FR_B = (FR_A_IN, FR_B_IN) if INDOOR else (FR_A_OUT, FR_B_OUT)
BR_A, BR_B = (BR_A_IN, BR_B_IN) if INDOOR else (BR_A_OUT, BR_B_OUT)
BL_A, BL_B = (BL_A_IN, BL_B_IN) if INDOOR else (BL_A_OUT, BL_B_OUT)

_DIST_STR = 5
DIST_BW = _DIST_STR
DIST_FW = _DIST_STR

_circum = lambda a, b: math.pi * ( 3*(a+b) - math.sqrt( (3*a + b) * (a + 3*b) ) )
# x displacement, y displacement, arc length

DIST_FL45 = WPS_FL[-1][0], WPS_FL[-1][1], _circum(FL_A, FL_B)/4
DIST_FR45 = WPS_FR[-1][0], WPS_FR[-1][1], _circum(FR_A, FR_B)/4
DIST_BL45 = WPS_BL[-1][0], WPS_BL[-1][1], _circum(BL_A, BL_B)/4
DIST_BR45 = WPS_BR[-1][0], WPS_BR[-1][1], _circum(BR_A, BR_B)/4

PENALTY_STOP = 40
MAX_THETA_ERR = math.pi / 12
MAX_X_ERR = 5, 5  # L, R (Configurable: Change to edit the node boundaries)
MAX_Y_ERR = 7.5, 10 # U, D (Configurable: Change to edit the node boundaries)

# +---------------------+
# | obstacle dimensions |
# +---------------------+

OBSTACLE_WIDTH = 10
EDGE_ERR = 0.1

# +--------------------+
# | Priority obstacles |
# +--------------------+
"""For identifying obstacles that are potentially in the path of the robot"""

# *_X = LEFT, RIGHT
# *_Y = UP, DOWN

FL_OUTER_IN = 41
FR_OUTER_IN = 54
BL_OUTER_IN = 47
BR_OUTER_IN = 69

FL_OUTER_OUT = 40.8
FR_OUTER_OUT = 51.6
BL_OUTER_OUT = 46.7
BR_OUTER_OUT = 63

FL_OUTER = FL_OUTER_IN if INDOOR else FL_OUTER_OUT
FR_OUTER = FR_OUTER_IN if INDOOR else FR_OUTER_OUT
BL_OUTER = BL_OUTER_IN if INDOOR else BL_OUTER_OUT
BR_OUTER = BR_OUTER_IN if INDOOR else BR_OUTER_OUT

# [TODO: Editable] To increase the boundaries to identify obstacles potentially in the path of the robot more accurately (before doing obstacle collision detection)
BACKWARDS_A_B_MULTIPLIER = 1.5

FL_X_BOUND = [OBSTACLE_WIDTH/2 + FL_A - ROBOT_WIDTH/2 + ROBOT_HEIGHT - ROBOT_VERT_OFFSET, 
              OBSTACLE_WIDTH/2 + ROBOT_WIDTH]

FL_Y_BOUND = [OBSTACLE_WIDTH/2 + FL_OUTER + (FL_B - FL_A) + ROBOT_VERT_OFFSET, 
              OBSTACLE_WIDTH/2]

FR_X_BOUND = [OBSTACLE_WIDTH/2, 
              OBSTACLE_WIDTH/2 + FR_A + ROBOT_WIDTH/2 + ROBOT_HEIGHT - ROBOT_VERT_OFFSET]

FR_Y_BOUND = [OBSTACLE_WIDTH/2 + FR_OUTER + (FR_B - FL_A) + ROBOT_VERT_OFFSET, 
              OBSTACLE_WIDTH/2]

BL_X_BOUND = [OBSTACLE_WIDTH/2 + (BL_A*BACKWARDS_A_B_MULTIPLIER) - ROBOT_WIDTH/2 + ROBOT_VERT_OFFSET, 
              OBSTACLE_WIDTH/2 + BL_OUTER - ((BL_A*BACKWARDS_A_B_MULTIPLIER) - ROBOT_WIDTH/2)] 

BL_Y_BOUND = [OBSTACLE_WIDTH/2 + ROBOT_HEIGHT, 
              OBSTACLE_WIDTH/2 + (BL_B*BACKWARDS_A_B_MULTIPLIER) + ROBOT_WIDTH/2 - ROBOT_VERT_OFFSET]

BR_X_BOUND = [OBSTACLE_WIDTH/2 + BR_OUTER - (BR_A*BACKWARDS_A_B_MULTIPLIER) - ROBOT_WIDTH/2, 
              OBSTACLE_WIDTH/2 + (BR_A*BACKWARDS_A_B_MULTIPLIER) + ROBOT_WIDTH/2 + ROBOT_VERT_OFFSET]

BR_Y_BOUND = [OBSTACLE_WIDTH/2 + ROBOT_HEIGHT, 
              OBSTACLE_WIDTH/2 + (BR_B*BACKWARDS_A_B_MULTIPLIER) + ROBOT_WIDTH/2 - ROBOT_VERT_OFFSET]

ROBOT_MIN_CAMERA_DIST = 20

# +----------------+
# | map dimensions |
# +----------------+

MAP_WIDTH = 200 
MAP_HEIGHT = 200
SNAP_COORD = _DIST_STR # for cell snap (coords) 5. Max value < 1.5* min(DIST_BL, DIST_BR, ... DIST_FW)
SNAP_THETA = 15 # for cell snap (theta) 15
