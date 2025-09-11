from arena.map import Map
from arena.obstacle import Obstacle

from common.consts import SNAP_COORD
from common.types import Position
from common.utils import _mappings as Int_to_Direction_mappings
from common.enums import Direction

from math import pi

from path_finding.hamiltonian_path import HamiltonianSearch, AlgoType

from robot.stm_commands import convert_segments_to_commands

import multiprocessing as mp
import time
import logging

""" -------------------------------------- """
""" ---------- Endpoint Schemas ---------- """
""" -------------------------------------- """
from pydantic import BaseModel
from enum import Enum
from typing import Optional

# Input
class AlgoInputMode(Enum):
  SIMULATOR = "simulator"
  LIVE = "live"

class AlgoInputValueObstacle(BaseModel):
  id: int # obstacle_id
  x: int # grid_format
  y: int # grid_format
  d: int # direction of obstacle; 1: North; 2: South; 3: East; 4: West

class AlgoInputValue(BaseModel):
  obstacles: list[AlgoInputValueObstacle]
  mode: int # (0: Task 1); (1: Task 2)

class AlgoInput(BaseModel):
  cat: str = "obstacles"
  value: AlgoInputValue
  server_mode: Optional[AlgoInputMode] = AlgoInputMode.LIVE
  algo_type: Optional[AlgoType] = AlgoType.EXHAUSTIVE_ASTAR

# Output
class AlgoOutputSimulatorPosition(BaseModel):
  x: int # in cm
  y: int # in cm
  theta: float # in radian


class AlgoOutputSimulator(BaseModel):
  positions: list[AlgoOutputSimulatorPosition]
  vert: list[int]
  steer: list[int]
  runtime: str

class AlgoOutputLivePosition(BaseModel):
  x: int # in cm
  y: int # in cm
  d: int # Robot Face -> 1: North; 2: South; 3: East; 4: West


class AlgoOutputLiveCommand(BaseModel):
  cat: str = "control"
  value: str
  # end_position: AlgoOutputLivePosition

class AlgoOutputLive(BaseModel):
  commands: list[AlgoOutputLiveCommand]
  
# logging.basicConfig(filename="stm_cmd.txt",
#                     filemode="w",
#                     format="%(asctime)s - %(message)s",
#                     level=logging.INFO)
logger = logging.getLogger('cmds')
class ImageDetectionResponse(BaseModel):
    detection_status: str = "Objects detected"
    objects: list[str]

""" -------------------------------------- """
""" ----------- Main Functions ----------- """
""" -------------------------------------- """
if __name__ == '__main__':
  mp.freeze_support() # Needed to run child processes (multiprocessing)

def main(algo_input: AlgoInput):
  # Algorithm Server Mode -> 'simulator' or 'live'
  server_mode = algo_input["server_mode"]

  # Obstacles
  obstacles = _extract_obstacles_from_input(algo_input["value"]["obstacles"], server_mode)

  # Start Position
  start_position = Position(x=0, y=10, theta=pi/2)

  # Map
  map = Map(obstacles=obstacles)

  # Algorithm
  algo_type = algo_input["algo_type"]
  print("Algorithm: ", algo_type)
  algo = HamiltonianSearch(map=map, src=start_position, algo_type=algo_type)

  # Algorithm Search⭐
  min_perm, paths = algo.search()

  # Results
  if server_mode == AlgoInputMode.SIMULATOR:
    simulator_algo_output = [] # Array of positions
    simulator_algo_vert = []
    simulator_algo_steer = []
    i = 1
    for path in paths:
      for node in path:
        simulator_algo_output.append(node.pos)
        simulator_algo_vert.append(node.v)
        simulator_algo_steer.append(node.s)
        # print(i, node.__str__())
        i += 1
      
      # Position configuration to represent scanning (*only for simulator)
      simulator_algo_output.append(Position(-1, -1, -2))
      simulator_algo_vert.append(-2)
      simulator_algo_steer.append(-2) 
      simulator_algo_output.append(Position(-1, -1, -1))
      simulator_algo_vert.append(-2)
      simulator_algo_steer.append(-2)
  

    return (simulator_algo_output, simulator_algo_vert, simulator_algo_steer)
  
  if server_mode == AlgoInputMode.LIVE:
    current_perm = 1
    stm_commands = []

    for path in paths:
      commands = convert_segments_to_commands(path)
      stm_commands.extend(commands)

      # Add SNAP1 command after each path (from one obstacle to another) (For Raspberry Pi Team to know when to scan the image)
      obID = min_perm[current_perm]
      destinationPos = path[-1].c_pos
      ob:Obstacle = obstacles[obID-1]
      if ob.facing == Direction.NORTH:
        errorDistance = destinationPos.y - ob.y
      elif ob.facing == Direction.SOUTH:
        errorDistance = ob.y - destinationPos.y
      elif ob.facing == Direction.EAST:
        errorDistance = destinationPos.x - ob.x
      else:
        errorDistance = ob.x - destinationPos.x
      print("EC" + "{:03d}".format(int(errorDistance)))
      stm_commands.append("EC" + "{:03d}".format(int(errorDistance)))
      stm_commands.append(f"SNAP{min_perm[current_perm]}")

      current_perm += 1 # Increment by current_perm to access the next obstacle_id
      
    print(stm_commands.__str__())
    logger.info(stm_commands.__str__())
    
    algoOutputLiveCommands: list[AlgoOutputLiveCommand] = [] # Array of commands
    for command in stm_commands:
      algoOutputLiveCommands.append(AlgoOutputLiveCommand(
        cat="control",
        value=command,
        # end_position=command[1]
      ))
    
    # Add FIN as the last command (For Raspberry Pi Team to know that the algorithm has ended)
    algoOutputLiveCommands.append(AlgoOutputLiveCommand(
      cat="control",
      value="FINXX",
      # end_position=algoOutputLiveCommands[-1].end_position
    ))

    return algoOutputLiveCommands

def _extract_obstacles_from_input(input_obstacles, server_mode):
  """
  Helper function to convert input obstacles to `Obstacle` object accepted by the algorithm
  """
  obstacles = []

  grid_pos_to_c_pos_multiplier = SNAP_COORD
  if server_mode == AlgoInputMode.LIVE:
    # Live mode uses 10cm grid format (so need to *2 to align with algo's 5cm grid format)
    grid_pos_to_c_pos_multiplier *= 2

  for obstacle in input_obstacles:
    obstacles.append(Obstacle(
      x=obstacle["x"] * grid_pos_to_c_pos_multiplier,
      y=obstacle["y"] * grid_pos_to_c_pos_multiplier,
      facing=Int_to_Direction_mappings[str(obstacle["d"])]
    ))

  return obstacles


""" -------------------------------------- """
""" ------ FastAPI (API Endpoints) ------- """
""" -------------------------------------- """
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:5000",
    "http://localhost:5000",
    "http://192.168.17.17"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
  return { "message": "Hello World" }

@app.post("/algo/simulator", response_model=AlgoOutputSimulator, tags=["Algorithm"])
async def algo_simulator(algo_input: AlgoInput):
  """Main endpoint for simulator"""
  start_time = time.time()
  positions, vert, steer = main(algo_input.model_dump())
  runtime = time.time() - start_time # in seconds

  return { "positions": positions, "vert": vert, "steer": steer, "runtime": "{:.4f} seconds".format(runtime) }

@app.post("/algo/live", response_model=AlgoOutputLive, tags=["Algorithm"])
async def algo_live(algo_input: AlgoInput):
  """Main endpoint for live mode"""
  commands = main(algo_input.model_dump())

  return { "commands": commands }
