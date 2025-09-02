from math import pi
from common.consts import (
    DIST_BW,
    DIST_FW,
    DIST_BR45,
    DIST_BL45,
    DIST_FL45,
    DIST_FR45
)
from common.utils import calc_vector
from common.types import Position


D_THETA = pi/2


def fwd(pos: "Position") -> "Position":
    new = pos.clone()
    new.add(calc_vector(pos.theta, DIST_FW))
    return new


def bwd(pos: "Position") -> "Position":
    new = pos.clone()
    new.add(calc_vector(pos.theta, -DIST_BW))
    return new


def fwd_left(pos: "Position") -> "Position":
    vh = calc_vector(pos.theta-pi/2, DIST_FL45[0])
    vv = calc_vector(pos.theta, DIST_FL45[1])
    new = pos.clone()
    new.add(vv + vh)
    new.theta = pos.theta + pi/4
    return new


def fwd_right(pos: "Position") -> "Position":
    vh = calc_vector(pos.theta-pi/2, DIST_FR45[0])
    vv = calc_vector(pos.theta, DIST_FR45[1])
    new = pos.clone()
    new.add(vv + vh)
    new.theta = pos.theta - pi/4
    return new


def bwd_left(pos: "Position") -> "Position":
    vh = calc_vector(pos.theta-pi/2, DIST_BL45[0])
    vv = calc_vector(pos.theta, DIST_BL45[1])
    new = pos.clone()
    new.add(vv + vh)
    new.theta = pos.theta - pi/4
    return new


def bwd_right(pos: "Position") -> "Position":
    vh = calc_vector(pos.theta-pi/2, DIST_BR45[0])
    vv = calc_vector(pos.theta, DIST_BR45[1])
    new = pos.clone()
    new.add(vv + vh)
    new.theta = pos.theta + pi/4
    return new