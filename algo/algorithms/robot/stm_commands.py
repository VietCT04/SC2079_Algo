import math
import logging
from typing import List
from common.types import Position
from path_finding.astar import Node
# logging.basicConfig(filename="NODES.txt",
#                     filemode="w",
#                     format="%(asctime)s - %(message)s",
#                     level=logging.INFO)
logger = logging.getLogger('NODES')

def convert_segments_to_commands(
    path: List["Node"]
) -> list[list[str | Position]]:
    '''
        Converts Path Segments to Commands

        Returns:
            [command, AlgoOutputLIvePosition (end_position of robot after executing the command)]
    '''
    result = []
    from main import AlgoOutputLivePosition

    # Old Version
    for node in path:
        logger.info(f'{node.__str__()}')
        if node.d == 0:
            continue
        if node.v == 1:
            if node.s == -1:
                result.append("FL045")
            elif node.s == 0:
                result.append("FW"+"{:03d}".format(int(node.d)))
            elif node.s == 1:
                result.append("FR045")
            # print(result[-1])
        elif node.v == -1:
            if node.s == -1:
                result.append("BL045")
            elif node.s == 0:
                result.append("BW"+"{:03d}".format(int(node.d)))
            elif node.s == 1:
                result.append("BR045")
            # print(result[-1])

    
    def combine_fw_bw(commands):
        result = []
        temp_cmd = None
        temp_sum = 0
        
        for cmd in commands:
            if cmd.startswith(('FW', 'BW')):
                if temp_cmd and cmd[:2] != temp_cmd[:2]:
                    if temp_sum >= 100:
                        result.append(f"{temp_cmd[:2]}{math.floor(temp_sum/2):03d}")
                        result.append(f"{temp_cmd[:2]}{math.ceil(temp_sum/2):03d}")
                    else:
                        result.append(f"{temp_cmd[:2]}{temp_sum:03d}")
                    temp_sum = 0
                temp_cmd = cmd
                temp_sum += int(cmd[2:])
            else:
                if temp_cmd:
                    if temp_sum >= 100:
                        result.append(f"{temp_cmd[:2]}{math.floor(temp_sum/2):03d}")
                        result.append(f"{temp_cmd[:2]}{math.ceil(temp_sum/2):03d}")
                    else:
                        result.append(f"{temp_cmd[:2]}{temp_sum:03d}")
                    temp_cmd = None
                    temp_sum = 0
                result.append(cmd)
        
        if temp_cmd:
            if temp_sum >= 100:
                result.append(f"{temp_cmd[:2]}{math.floor(temp_sum/2)}")
                result.append(f"{temp_cmd[:2]}{math.ceil(temp_sum/2)}")
            else:
                result.append(f"{temp_cmd[:2]}{temp_sum:03d}")
            temp_cmd = None
            temp_sum = 0
            
        
        
        return result

    return combine_fw_bw(result)
