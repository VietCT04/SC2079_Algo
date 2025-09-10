import React, { useEffect, useState } from "react";
import { NavigationGrid } from "./NavigationGrid";
import { CoreContainter } from "../CoreContainter";
import { Position, RobotDirection } from "../../../schemas/robot";
import {
  ALGO_GRID_BLOCK_SIZE_MULTIPLIER,
  GRID_ANIMATION_SPEED,
  ROBOT_INITIAL_POSITION,
} from "../../../constants";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPause,
  FaPlay,
  FaSitemap,
  FaSpinner,
  FaQuestionCircle,
} from "react-icons/fa";
import { convertAlgoOutputToStepwisePosition } from "./utils/path_animation";
import {
  AlgoTestDataInterface,
  AlgoTestEnum,
  AlgoTestEnumMapper,
} from "../../../tests/algorithm";
import { Button } from "../../common";
import toast from "react-hot-toast";
import { TestSelector } from "./TestSelector";
import { ServerStatus } from "./ServerStatus";
import useFetch from "../../../hooks/useFetch";
import { AlgoInput, AlgoType, AlgoTypeList } from "../../../schemas/algo_input";
import { AlgoOutput } from "../../../schemas/algo_output";
import { DropdownContainer } from "../../common/DropdownContainer";
import { NumberDisplay } from "../../common/NumberDisplay";
import {
  convertThetaToDirection,
  convertThetaToDirectionString,
} from "./utils/conversions";

export const AlgorithmCore = () => {
  const fetch = useFetch();

  // Robot's Positions
  const [robotPositions, setRobotPositions] = useState<Position[]>();
  const [movementVertical, setMovementVertical] = useState<number[]>();
  const [movementSteer, setMovementSteer] = useState<number[]>();
  const totalSteps = robotPositions?.length ?? 0;

  // Select Algorithm
  const [selectedAlgoTypeEnum, setSelectedAlgoTypeEnum] = useState<AlgoType>(
    AlgoType.EXHAUSTIVE_ASTAR
  );

  // Algorithm Runtime
  const [algoRuntime, setAlgoRuntime] = useState<string>("");

  // Select Tests
  const [selectedTestEnum, setSelectedTestEnum] = useState<AlgoTestEnum>(
    AlgoTestEnum.Custom
  );
  const [selectedTest, setSelectedTest] = useState<AlgoTestDataInterface>(
    AlgoTestEnumMapper[AlgoTestEnum.Custom]
  );
  const [dropSelectedTest, setDropSelectedTest] = useState(AlgoTestEnum.Custom);

  useEffect(() => {
    setHighlightCenterCell([]);
  }, [selectedTestEnum]);
  // Select Tests
  useEffect(() => {
    const selectedTest = AlgoTestEnumMapper[selectedTestEnum];
    setSelectedTest(selectedTest);

    setCurrentStep(0);
    setCurrentRobotPosition(ROBOT_INITIAL_POSITION);
    setRobotPositions(undefined);
    setMovementVertical(undefined);
    setMovementSteer(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTestEnum]);

  // Run Algorithm
  const [isAlgorithmLoading, setIsAlgorithmLoading] = useState(false);

  // Run Algorithm
  const handleRunAlgorithm = async () => {
    if (startAnimation === true || isAlgorithmLoading === true) return;
    setIsAlgorithmLoading(true);
    setAlgoRuntime("");

    const algoInput: AlgoInput = {
      cat: "obstacles",
      value: {
        mode: 0,
        obstacles: selectedTest.obstacles.map((o) => {
          return {
            id: o.id,
            x: o.x * ALGO_GRID_BLOCK_SIZE_MULTIPLIER,
            y: o.y * ALGO_GRID_BLOCK_SIZE_MULTIPLIER,
            d: o.d,
          };
        }),
      },
      server_mode: "simulator",
      algo_type: selectedAlgoTypeEnum,
    };
    try {
      const algoOutput: AlgoOutput = await fetch.post(
        "/algo/simulator",
        algoInput
      );
      // console.log(algoOutput);
      // console.log(convertAlgoOutputToStepwisePosition(algoOutput.positions));
      // console.log(turningPath);
      setRobotPositions(
        convertAlgoOutputToStepwisePosition(algoOutput.positions)
      );
      setMovementVertical(algoOutput.vert);
      setMovementSteer(algoOutput.steer);
      setCurrentStep(0);

      setAlgoRuntime(algoOutput.runtime);
      toast.success("Algorithm ran successfully.", { duration: 750 });
    } catch (e) {
      toast.error("Failed to run algorithm. Server Error: " + e, {
        duration: 750,
      });
    }

    setIsAlgorithmLoading(false);
  };

  // Animation
  const [isManualAnimation, setIsManualAnimation] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRobotPosition, setCurrentRobotPosition] = useState<Position>();
  const [previousRobotPositionIndex, setPreviousRobotPositionIndex] =
    useState(0);
  const [nextRobotPositionIndex, setNextRobotPositionIndex] = useState(0);
  const [previousRobotPosition, setPreviousRobotPosition] =
    useState<Position>();
  const [turningArray, setTurningArray] = useState<
    { x: number; y: number }[][]
  >([[]]);
  const [turningPath, setTurningPath] = useState<{ x: number; y: number }[]>(
    []
  );
  const [highlightCenterCell, setHighlightCenterCell] = useState<
    { x: number; y: number }[]
  >([]);

  // Animation
  useEffect(() => {
    if (robotPositions && startAnimation && currentStep + 1 < totalSteps) {
      const timer = setTimeout(
        () => {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);

          // Handle Scan Animation
          if (
            robotPositions[nextStep].x === -1 &&
            robotPositions[nextStep].y === -1
          ) {
            if (robotPositions[nextStep].theta === -1)
              toast.success("Image Scanned!", { duration: 750 });
            else toast("Scanning image...", { duration: 750 });
            setTurningPath(turningArray[nextStep]);
          } else {
            setPreviousRobotPositionIndex(nextRobotPositionIndex);
            setPreviousRobotPosition(
              robotPositions[previousRobotPositionIndex]
            );
            setNextRobotPositionIndex(nextStep);
            setCurrentRobotPosition(robotPositions[nextStep]);
            setTurningPath(turningArray[nextStep]);
          }

          // Stop Animation at the last step
          if (nextStep === totalSteps - 1) {
            setStartAnimation(false);
          }
        },
        turningArray[currentStep + 1].length === 0
          ? GRID_ANIMATION_SPEED
          : GRID_ANIMATION_SPEED + 200
      );
      return () => clearTimeout(timer);
    } else if (
      robotPositions &&
      isManualAnimation &&
      currentStep < totalSteps
    ) {
      // User manually click through the steps
      // Handle Scan Animation
      if (
        robotPositions[currentStep].x === -1 &&
        robotPositions[currentStep].y === -1
      ) {
        if (robotPositions[currentStep].theta === -1)
          toast.success("Image Scanned!", { duration: 750 });
        else toast("Scanning image...", { duration: 750 });
        setTurningPath(turningArray[currentStep]);
      } else {
        setPreviousRobotPositionIndex(nextRobotPositionIndex);
        setPreviousRobotPosition(robotPositions[previousRobotPositionIndex]);
        setNextRobotPositionIndex(currentStep);
        setCurrentRobotPosition(robotPositions[currentStep]);
        setTurningPath(turningArray[currentStep]);
        const c = robotPositions[currentStep];
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, totalSteps, startAnimation, isManualAnimation]);

  useEffect(() => {
    generateTurningCells(robotPositions ?? [], setTurningArray);
  }, [robotPositions]);

  // Timer Limit
  const timerDuration = 5000;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (startAnimation) {
      timer = setTimeout(() => {
        setStartAnimation(false); // Stop animation after x ms
      }, timerDuration);
    }
    return () => {
      clearTimeout(timer); // Cleanup timer on component unmount or when animation stops
    };
  }, [startAnimation]);

  const getRobotDirection = (robotPosition: Position) => {
    return convertThetaToDirectionString(robotPosition.theta);
  };

  const getXYsigns = (
    previousRobotDirection: string,
    robotMotion: number,
    robotTurnDirection: number
  ) => {
    let x = 0;
    let y = 0;
    switch (previousRobotDirection) {
      case "NorthEast": {
        robotMotion === -1 ? (y = -1) : (y = 1);
        x = robotMotion;
        break;
      }
      case "NorthWest": {
        robotMotion === -1 ? (y = -1) : (y = 1);
        x = -robotMotion;
        break;
      }
      case RobotDirection.N: {
        robotMotion === -1 ? (y = -1) : (y = 1);
        if (robotTurnDirection === -1) x = -1;
        else x = 1;
        break;
      }
      case "SouthEast": {
        robotMotion === 1 ? (y = -1) : (y = 1);
        x = robotMotion;
        break;
      }
      case "SouthWest": {
        robotMotion === 1 ? (y = -1) : (y = 1);
        x = -robotMotion;
        break;
      }
      case RobotDirection.S: {
        robotMotion === 1 ? (y = -1) : (y = 1);
        if (robotTurnDirection === -1) x = 1;
        else x = -1;
        break;
      }
      case RobotDirection.E: {
        robotMotion === -1 ? (x = -1) : (x = 1);
        if (robotTurnDirection === -1) y = 1;
        else y = -1;
        break;
      }
      case RobotDirection.W: {
        robotMotion === 1 ? (x = -1) : (x = 1);
        if (robotTurnDirection === -1) y = -1;
        else y = 1;
        break;
      }
    }
    return { x: x, y: y };
  };

  const generateTurningCells = (
    robotPositions: Position[],
    setTurningArray: React.Dispatch<
      React.SetStateAction<{ x: number; y: number }[][]>
    >
  ) => {
    let last = 0;
    let turningCellsArray: { x: number; y: number }[][] = [[]];
    for (let i = 0; i < robotPositions.length - 1; i++) {
      if (
        robotPositions[i + 1].theta === -1 ||
        robotPositions[i + 1].theta === -2
      ) {
        turningCellsArray.push([]);
        // console.log("DEBUG ", i, ": CAMERA");
        continue;
      }

      let previousRobotDirection: string = getRobotDirection(
        robotPositions[last]
      );
      // let robotMotion = getRobotMotion(i + 1);
      // let robotTurnDirection = getRobotTurnDirection(i + 1);
      let robotMotion = movementVertical ? movementVertical[i + 1] : 0;
      let robotTurnDirection = movementSteer ? movementSteer[i + 1] : 0;
      if (robotTurnDirection === 0) {
        turningCellsArray.push([]);
        // console.log("DEBUG ", i, ": NOT TURNING");
        last = i + 1;
        continue;
      }
      let previousRobotPosition = robotPositions[i];
      let currentRobotPosition = robotPositions[i + 1];
      let x = previousRobotPosition.x;
      let y = previousRobotPosition.y;
      let xySigns = getXYsigns(
        previousRobotDirection,
        robotMotion,
        robotTurnDirection
      );
      let turningCellsStep: { x: number; y: number }[] = [];

      if (x === currentRobotPosition.x && y === currentRobotPosition.y) {
        turningCellsArray.push(turningCellsStep);
        last = i + 1;
        continue;
      }

      switch (previousRobotDirection) {
        case "NorthEast":
        case "NorthWest":
        case "SouthEast":
        case "SouthWest": {
          if (x !== currentRobotPosition.x) x += xySigns.x;
          if (y !== currentRobotPosition.y) y += xySigns.y;
          break;
        }
        case RobotDirection.N:
        case RobotDirection.S: {
          if (y !== currentRobotPosition.y) y += xySigns.y;
          break;
        }

        case RobotDirection.E:
        case RobotDirection.W: {
          x += xySigns.x;
          break;
        }
      }

      if (x === currentRobotPosition.x && y === currentRobotPosition.y) {
        turningCellsArray.push(turningCellsStep);
        last = i + 1;
        continue;
      }

      // console.log(
      //   "DEBUG ",
      //   i,
      //   ": ",
      //   previousRobotPosition,
      //   currentRobotPosition,
      //   robotMotion,
      //   robotTurnDirection
      // );

      while (x !== currentRobotPosition.x && y !== currentRobotPosition.y) {
        x += xySigns.x;
        y += xySigns.y;
      }

      while (x !== currentRobotPosition.x || y !== currentRobotPosition.y) {
        if (x !== currentRobotPosition.x) {
          if (x < currentRobotPosition.x) x++;
          else x--;
        } else if (y !== currentRobotPosition.y) {
          if (y < currentRobotPosition.y) y++;
          else y--;
        }
      }
      // console.log("DEBUG ", i, ": ", turningCellsStep);
      turningCellsArray.push(turningCellsStep);
      last = i + 1;
    }
    setTurningArray(turningCellsArray);
  };

  const [tutorial, setTutorial] = useState(true);

  return (
    <CoreContainter title="Algorithm Simulator">
      {/* Main Layout: Grid Left, Controls Right */}
      <div className="flex flex-row justify-center gap-6">
        {/* LEFT: Navigation Grid */}
        <div className="flex-shrink-0">
          <NavigationGrid
            robotPosition={currentRobotPosition ?? ROBOT_INITIAL_POSITION}
            movementVertical={movementVertical ?? []}
            movementSteer={movementSteer ?? []}
            turningPath={turningPath}
            obstacles={selectedTest.obstacles}
            canAddObstacle={true}
            setSelectedTest={setSelectedTest}
            highlightCenterCell={highlightCenterCell}
          />
        </div>

        {/* RIGHT: Controls */}
        <div className="flex flex-col items-center gap-4 w-96 m-20">
          {/* Server Status */}
          <ServerStatus />

          {/* Test Selector */}
          <TestSelector
            selectedTestEnum={selectedTestEnum}
            setSelectedTestEnum={setSelectedTestEnum}
            selectedTest={selectedTest}
            setSelectedTest={setSelectedTest}
            setAlgoRuntime={setAlgoRuntime}
          />

          {/* Run Algorithm */}
          <Button onClick={handleRunAlgorithm}>
            <span>Run Algorithm</span>
            {isAlgorithmLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <></>
            )}
          </Button>

          {/* Runtime */}
          {algoRuntime && (
            <div className="font-bold">
              Algorithm Runtime: {algoRuntime} ({selectedAlgoTypeEnum})
            </div>
          )}

          {/* Animation Controls */}
          {robotPositions && (
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={() => {
                  if (startAnimation) setStartAnimation(false);
                  else {
                    setIsManualAnimation(false);
                    setStartAnimation(true);
                    if (currentStep === totalSteps - 1) {
                      setCurrentRobotPosition(robotPositions[0]);
                      setCurrentStep(0);
                    }
                  }
                }}
              >
                {startAnimation ? "Stop Animation" : "Start Animation"}
                {startAnimation ? <FaPause /> : <FaPlay />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </CoreContainter>
  );
};
