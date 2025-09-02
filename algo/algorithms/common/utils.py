from math import cos, sin
import numpy as np
from typing import List, Tuple

from arena.obstacle import Obstacle
from common.enums import Direction
from common.types import Position
from common.consts import OBSTACLE_WIDTH

_mappings = {
    '1': Direction.NORTH,
    '2': Direction.SOUTH,
    '3': Direction.EAST,
    '4': Direction.WEST
}

def calc_vector(
    theta: float,
    length: float
) -> np.array:
    """Calculate a vector of specified length, pointing in direction theta radians

    Args:
        theta (float) : Direction of vector
        length (float) : Magnitude of vector
    
    Returns:
        np.array : Column vector. Typically to calculate the vector going from robot's bottom left to top left corner.
    """
    return np.array([
        cos(theta) * length,
        sin(theta) * length
    ])

def euclidean(
    st: Position,
    end: Position
) ->  float:
    return ((st.y - end.y)**2 + (st.x - end.x)**2)**.5
