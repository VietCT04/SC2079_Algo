import {
  GRID_TOTAL_HEIGHT,
  GRID_TOTAL_WIDTH,
  ROBOT_GRID_HEIGHT,
  ROBOT_GRID_WIDTH,
} from "../../../../constants";
import { Obstacle, ObstacleDirection } from "../../../../schemas/obstacle";
import { Position, RobotDirection } from "../../../../schemas/robot";
import { convertThetaToDirectionString } from "./conversions";

/**
 * Creates a HTML Grid.
 * Paint order (highest priority first inside the loop):
 *  1) Robot (body/camera/center)
 *  2) Stored centerTrail cells (past centers)  ← NEW
 *  3) Turning path
 *  4) Obstacles
 *  5) Empty
 *
 * @returns React.ReactNode[][] - `<td />[][]`
 */
export const createHTMLGrid = (
  robotPosition: Position,
  movementVertical: number[],
  movementSteer: number[],
  turningPath: { x: number; y: number }[],
  obstacles: Obstacle[],
  canAddObstacle: boolean,
  highlightCenterCell: { x: number; y: number }[],
  handleAddObstacle: (x: number, y: number, d: number) => void,
  handleChangeObstacleDirection: (x: number, y: number, new_d: number) => void
  /** NEW: list of all center cells visited so far */
) => {
  const grid: React.ReactNode[][] = [];

  for (let y = GRID_TOTAL_HEIGHT - 1; y >= 0; y--) {
    const currentRow: React.ReactNode[] = [];

    for (let x = 0; x < GRID_TOTAL_WIDTH; x++) {
      // --- Robot first (so current center is never covered) ---
      if (isRobotCell(robotPosition, x, y)) {
        const [cxOff, cyOff] = convertRobotThetaToCenterOffsetBlock(
          robotPosition.theta
        );
        const centerX = robotPosition.x + cxOff;
        const centerY = robotPosition.y + cyOff;
        const isCenter =
          (x === centerX && y === centerY) ||
          highlightCenterCell.some((c) => c.x === x && c.y === y);
        if (isCenter) highlightCenterCell.push({ x, y });
        const [camOffX, camOffY] = convertRobotThetaToCameraOffsetBlock(
          robotPosition.theta
        );
        const isCamera =
          x === robotPosition.x + camOffX && y === robotPosition.y + camOffY;

        currentRow.push(
          createHTMLGridCellRobot(
            x,
            y,
            isCenter ? "center" : isCamera ? "camera" : "body"
          )
        );
      }
      // --- Turning path (only if not occupied above) ---
      else if (turningPath.some((p) => p.x === x && p.y === y)) {
        currentRow.push(createHTMLGridCellTurn(x, y));
      }
      // --- Obstacles ---
      else if (obstacles.some((o) => o.x === x && o.y === y)) {
        const dir = obstacles.find((o) => o.x === x && o.y === y)!.d;
        currentRow.push(
          createHTMLGridCellObstacle(
            x,
            y,
            dir,
            canAddObstacle,
            handleChangeObstacleDirection
          )
        );
      } else if (highlightCenterCell.some((c) => c.x === x && c.y === y)) {
        currentRow.push(createHTMLGridCellVisitedCenter(x, y));
      }
      // --- Empty ---
      else {
        currentRow.push(
          createHTMLGridCellEmpty(x, y, canAddObstacle, handleAddObstacle)
        );
      }
    }
    grid.push(currentRow);
  }
  return grid;
};

// ---------- Helper Functions - HTML ---------- //
const createHTMLGridCellEmpty = (
  x: number,
  y: number,
  canAddObstacle: boolean,
  handleAddObstacle: (x: number, y: number, d: number) => void
) => {
  if (!canAddObstacle) {
    return (
      <td id={`cell-${x}-${y}`} className="w-8 h-8 border border-orange-900" />
    );
  }

  return (
    <td
      id={`cell-${x}-${y}`}
      className="w-8 h-8 border border-orange-900 cursor-pointer hover:bg-amber-400 hover:border-t-4 hover:border-t-red-700"
      onClick={() => handleAddObstacle(x, y, 1)} // Default North Facing
      title="Add obstacle"
    />
  );
};

const createHTMLGridCellTurn = (x: number, y: number) => {
  return (
    <td
      id={`cell-${x}-${y}`}
      className="w-8 h-8 text-center align-middle bg-yellow-200 border-2 border-orange-900"
    />
  );
};

const createHTMLGridCellVisitedCenter = (x: number, y: number) => {
  // Style for stored centers; same red as live center for consistency
  return (
    <td
      id={`cell-${x}-${y}`}
      className="border-2 border-orange-900 w-8 h-8 align-middle text-center bg-red-500"
    />
  );
};

/** Robot cells (body/camera/center) */
const createHTMLGridCellRobot = (
  x: number,
  y: number,
  type: "camera" | "body" | "center"
) => {
  return (
    <td
      id={`cell-${x}-${y}`}
      className={`border-2 border-orange-900 w-8 h-8 align-middle text-center ${
        type === "center"
          ? "bg-red-500" // middle cell (current) stays red
          : type === "body"
          ? "bg-orange-400" // other robot cells
          : "bg-blue-500" // camera
      }`}
    />
  );
};

const createFaceClass = (direction: ObstacleDirection) => {
  switch (direction) {
    case ObstacleDirection.N:
      return "border-t-4 border-t-red-700";
    case ObstacleDirection.S:
      return "border-b-4 border-b-red-700";
    case ObstacleDirection.E:
      return "border-r-4 border-r-red-700";
    case ObstacleDirection.W:
      return "border-l-4 border-l-red-700";
  }
  return "";
};

/** Obstacle cell */
const createHTMLGridCellObstacle = (
  x: number,
  y: number,
  direction: ObstacleDirection,
  canChangeObstacleDirection: boolean,
  handleChangeObstacleDirection: (x: number, y: number, new_d: number) => void
) => {
  const face = createFaceClass(direction);

  if (!canChangeObstacleDirection) {
    return (
      <td
        id={`cell-${x}-${y}`}
        className={`border border-orange-900 w-8 h-8 align-middle text-center bg-amber-400 ${face}`}
      />
    );
  }

  return (
    <td
      id={`cell-${x}-${y}`}
      className={`border border-orange-900 w-8 h-8 align-middle text-center bg-amber-400 ${face} cursor-pointer hover:bg-amber-500`}
      title="Change obstacle direction"
      onClick={() =>
        handleChangeObstacleDirection(x, y, (direction.valueOf() % 4) + 1)
      }
    />
  );
};

/** Adds x-axis and y-axis labels to the Grid */
export const addHTMLGridLables = (grid: React.ReactNode[][]) => {
  grid.forEach((row, index) =>
    row.unshift(
      <td className="pr-2 font-bold">{GRID_TOTAL_HEIGHT - index - 1}</td>
    )
  );

  const gridColumnLabels: React.ReactNode[] = [];
  for (let c = -1; c < GRID_TOTAL_WIDTH; c++) {
    if (c === -1) gridColumnLabels.push(<td />);
    else
      gridColumnLabels.push(
        <td className="pt-2 font-bold text-center">{c}</td>
      );
  }
  grid.push(gridColumnLabels);
  return grid;
};

// ---------- Helper Functions - Calculations ---------- //
/**
 * Used mixed anchors depending on facing (matches isRobotCell):
 * - N / NE / NW    : anchor at bottom-left
 * - S / SE / SW    : anchor at top-right
 * - E              : anchor at top-left
 * - W              : anchor at bottom-right
 * Converts a Robot's Theta rotation to the associated Camera Offset on the grid
 * @returns (x, y) offset of the robot's camera from the robot anchor
 */
export const convertRobotThetaToCameraOffsetBlock = (theta: number) => {
  const robotDirection = convertThetaToDirectionString(theta);
  if (robotDirection === RobotDirection.E) return [2, -1];
  else if (robotDirection === RobotDirection.N) return [1, 2];
  else if (robotDirection === RobotDirection.W) return [-2, 1];
  else if (robotDirection === RobotDirection.S) return [-1, -2];
  else if (robotDirection === "NorthEast") return [2, 2];
  else if (robotDirection === "NorthWest") return [0, 2];
  else if (robotDirection === "SouthEast") return [0, -2];
  else if (robotDirection === "SouthWest") return [-2, -2];
  return [0, 0];
};

/** Offset from robot anchor to the **center cell** of the 3×3 body */
export const convertRobotThetaToCenterOffsetBlock = (theta: number) => {
  const dir = convertThetaToDirectionString(theta);
  switch (dir) {
    case RobotDirection.N:
    case "NorthEast":
    case "NorthWest":
      return [1, 1]; // from bottom-left to center
    case RobotDirection.S:
    case "SouthEast":
    case "SouthWest":
      return [-1, -1]; // from top-right to center
    case RobotDirection.E:
      return [1, -1]; // from top-left to center
    case RobotDirection.W:
      return [-1, 1]; // from bottom-right to center
    default:
      return [0, 0];
  }
};

/** Is a cell inside the 3×3 robot footprint given the current anchor/facing */
export const isRobotCell = (
  robotPosition: Position,
  cell_x: number,
  cell_y: number
) => {
  const robotDirection: string = convertThetaToDirectionString(
    robotPosition.theta
  );

  switch (robotDirection) {
    case RobotDirection.N:
    case "NorthEast":
    case "NorthWest":
      return (
        robotPosition.x <= cell_x &&
        cell_x <= robotPosition.x + (ROBOT_GRID_WIDTH - 1) &&
        robotPosition.y <= cell_y &&
        cell_y <= robotPosition.y + (ROBOT_GRID_HEIGHT - 1)
      );
    case RobotDirection.S:
    case "SouthEast":
    case "SouthWest":
      return (
        robotPosition.x - (ROBOT_GRID_WIDTH - 1) <= cell_x &&
        cell_x <= robotPosition.x &&
        robotPosition.y - (ROBOT_GRID_HEIGHT - 1) <= cell_y &&
        cell_y <= robotPosition.y
      );
    case RobotDirection.E:
      return (
        robotPosition.x <= cell_x &&
        cell_x <= robotPosition.x + (ROBOT_GRID_WIDTH - 1) &&
        robotPosition.y - (ROBOT_GRID_HEIGHT - 1) <= cell_y &&
        cell_y <= robotPosition.y
      );
    case RobotDirection.W:
      return (
        robotPosition.x - (ROBOT_GRID_WIDTH - 1) <= cell_x &&
        cell_x <= robotPosition.x &&
        robotPosition.y <= cell_y &&
        cell_y <= robotPosition.y + (ROBOT_GRID_HEIGHT - 1)
      );
    default:
      return false;
  }
};
