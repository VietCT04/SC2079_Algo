import { Obstacle } from "../../schemas/obstacle";
import { AlgoTestBasicMock } from "./basic_mock";
import { AlgoTestBasicUTurn } from "./basic_u_turn";
import { AlgoTestCorners } from "./corners";
import { AlgoTestCustom } from "./custom";
import { AlgoTestObstacles_5_Basic } from "./obstacles_5";
import { AlgoTestObstacles_7 } from "./obstacles_7";
import { AlgoTestShapes_V } from "./shapes";
import {
  AlgoTestCollisionCheck_A,
  AlgoTestCollisionCheck_B,
  AlgoTestCollisionCheck_C,
} from "./collision_check";
import { AlgoTestOfficialMockLayout } from "./official_mock_layout";
import { AlgoTestBoundaryTesting } from "./boundary_testing";

/** Interface for Algorithm Test Data
 * @param obstacles An array of Obstacles.
 */
export interface AlgoTestDataInterface {
  obstacles: Obstacle[];
}

export enum AlgoTestEnum {
  Custom = "Custom",
  Obstacles_5_Basic = "5 Obstacles",
}

export const AlgoTestEnumsList = [
  AlgoTestEnum.Custom,
  AlgoTestEnum.Obstacles_5_Basic,
];

export const AlgoTestEnumMapper = {
  [AlgoTestEnum.Custom]: AlgoTestCustom,
  [AlgoTestEnum.Obstacles_5_Basic]: AlgoTestObstacles_5_Basic,
};

// Specific Test Exports
export { AlgoTestCustom } from "./custom";
export { AlgoTestBasicMock } from "./basic_mock";
export { AlgoTestBasicUTurn } from "./basic_u_turn";
export { AlgoTestCorners } from "./corners";
export { AlgoTestObstacles_7 } from "./obstacles_7";
export { AlgoTestShapes_V } from "./shapes";
export { AlgoTestObstacles_5_Basic } from "./obstacles_5";
export {
  AlgoTestCollisionCheck_A,
  AlgoTestCollisionCheck_B,
  AlgoTestCollisionCheck_C,
} from "./collision_check";
export { AlgoTestOfficialMockLayout } from "./official_mock_layout";
export { AlgoTestBoundaryTesting } from "./boundary_testing";
