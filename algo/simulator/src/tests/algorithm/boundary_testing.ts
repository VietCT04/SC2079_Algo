import { AlgoTestDataInterface } from ".";
import { ObstacleDirection } from "../../schemas/obstacle";

export const AlgoTestBoundaryTesting: AlgoTestDataInterface = {
  obstacles: [
    { id: 1, x: 0, y: 19, d: ObstacleDirection.E },
    { id: 2, x: 10, y: 19, d: ObstacleDirection.S },
    { id: 3, x: 9, y: 9, d: ObstacleDirection.N },
    { id: 4, x: 9, y: 0, d: ObstacleDirection.N },
    { id: 5, x: 19, y: 9, d: ObstacleDirection.S },
    { id: 6, x: 19, y: 0, d: ObstacleDirection.N },
    { id: 7, x: 15, y: 1, d: ObstacleDirection.N },
  ],
};
