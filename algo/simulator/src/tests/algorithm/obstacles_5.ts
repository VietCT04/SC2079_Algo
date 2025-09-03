import { AlgoTestDataInterface } from ".";
import { ObstacleDirection } from "../../schemas/obstacle";

export const AlgoTestObstacles_5_Basic: AlgoTestDataInterface = {
  obstacles: [
    { id: 1, x: 3, y: 0, d: ObstacleDirection.N },
    { id: 2, x: 0, y: 14, d: ObstacleDirection.E },
    { id: 3, x: 9, y: 15, d: ObstacleDirection.S },
    { id: 4, x: 8, y: 6, d: ObstacleDirection.E },
    { id: 5, x: 16, y: 10, d: ObstacleDirection.W },
  ],
};
