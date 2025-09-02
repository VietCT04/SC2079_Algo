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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, totalSteps, startAnimation, isManualAnimation]);

  useEffect(() => {
    generateTurningCells(robotPositions ?? [], setTurningArray);
  }, [robotPositions]);

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

      turningCellsStep.push({ x, y });
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

      turningCellsStep.push({ x, y });
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
        turningCellsStep.push({ x, y });
      }

      while (x !== currentRobotPosition.x || y !== currentRobotPosition.y) {
        if (x !== currentRobotPosition.x) {
          if (x < currentRobotPosition.x) x++;
          else x--;
        } else if (y !== currentRobotPosition.y) {
          if (y < currentRobotPosition.y) y++;
          else y--;
        }
        turningCellsStep.push({ x, y });
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
      {tutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-w-2xl p-10 font-serif text-left text-white bg-gray-900 rounded-lg shadow-lg animate-fadeIn">
            <h2 className="text-xl font-bold">
              Welcome to Group 17's MDP Simulator
            </h2>
            <p className="mt-2">
              Firstly, please make sure that the algorithm server is running.
            </p>
            <p className="mt-2 ">
              Then select a preset obstacle course, or make your own!
              <br />
              You can{" "}
              <span className="text-sky-300">click on an empty plot</span> to
              add obstacles,
              <br />
              or{" "}
              <span className="text-orange-300">
                click on existing obstacles
              </span>{" "}
              to change their direction
            </p>
            {/* prettier-ignore */}
            <p className="mt-2">
              The <span className="font-bold">Reset Grid</span> button will reset
              the grid to the selected preset state, 
              <br/>
              or clear the grid if <span className="font-bold"> Custom preset</span> is selected.
            </p>
            <p className="mt-2">
              Finally, select your desired algorithm type and run the algorithm.
            </p>
            <button
              className="px-4 py-2 mt-4 bg-blue-500 rounded hover:bg-blue-600"
              onClick={() => {
                setTutorial(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center m-4">
        <FaQuestionCircle
          className="cursor-pointer"
          size={32}
          onClick={() => setTutorial(true)}
        />
        {/* <Button onClick={() => setTutorial(true)}>Help</Button> */}
      </div>

      {/* Server Status */}
      <ServerStatus />

      {/* Select Tests */}
      <TestSelector
        selectedTestEnum={selectedTestEnum}
        setSelectedTestEnum={setSelectedTestEnum}
        selectedTest={selectedTest}
        setSelectedTest={setSelectedTest}
        setAlgoRuntime={setAlgoRuntime}
      />

      {/* Run Algo */}
      <div className="flex justify-center m-4">
        <Button onClick={handleRunAlgorithm}>
          <span>Run Algorithm</span>
          {isAlgorithmLoading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaSitemap className="text-[18px]" />
          )}
        </Button>
      </div>

      {/* Algo Runtime */}
      {algoRuntime && (
        <div className="flex justify-center mb-4">
          Algorithm Runtime:&nbsp;
          <span className="font-bold">{algoRuntime}</span>&nbsp;(
          {selectedAlgoTypeEnum})
        </div>
      )}

      {/* Animation */}
      {robotPositions && (
        <div className="flex flex-col items-center justify-center gap-2 mt-2 mb-4">
          {/* Start Animation */}
          <Button
            onClick={() => {
              if (startAnimation) {
                // Stop Animation
                setStartAnimation(false);
              } else {
                // Start Animation
                setIsManualAnimation(false);
                setStartAnimation(true);
                if (currentStep === totalSteps - 1) {
                  setCurrentRobotPosition(robotPositions[0]);
                  setCurrentStep(0);
                }
              }
            }}
          >
            <span>{startAnimation ? "Stop Animation" : "Start Animation"}</span>
            {startAnimation ? <FaPause /> : <FaPlay />}
          </Button>

          {/* Slider */}
          <label
            htmlFor="steps-range"
            className="font-bold text-[14px] flex gap-2 items-center"
          >
            <FaChevronLeft
              className="cursor-pointer"
              onClick={() => {
                if (!startAnimation && currentStep - 1 >= 0) {
                  setIsManualAnimation(true);
                  setCurrentStep((prev) => prev - 1);
                }
              }}
            />
            <span>
              Step: {currentStep + 1} / {totalSteps}
            </span>
            <FaChevronRight
              className="cursor-pointer"
              onClick={() => {
                if (!startAnimation && currentStep + 1 < totalSteps) {
                  setIsManualAnimation(true);
                  setCurrentStep((prev) => prev + 1);
                }
              }}
            />
          </label>
          <input
            id="steps-range"
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStep}
            onChange={(e) => {
              setCurrentStep(Number(e.target.value));
              setIsManualAnimation(true);
            }}
            onPointerUp={() => setIsManualAnimation(false)}
            step={1}
            className="w-1/2 h-2 bg-orange-900 rounded-lg appearance-none cursor-pointer"
            disabled={startAnimation === true}
          />
        </div>
      )}

      {robotPositions && (
        <div className="flex items-center justify-center m-4">
          <div className="flex flex-col items-center justify-center w-64 rounded-lg bg-sky-900">
            <span className="font-bold text-center text-white">
              Robot Position
            </span>
            <div className="flex m-4 gap-x-4">
              <NumberDisplay
                label="x"
                value={currentRobotPosition ? currentRobotPosition.x : 0}
              />
              <NumberDisplay
                label="y"
                value={currentRobotPosition ? currentRobotPosition.y : 0}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Grid */}
      <NavigationGrid
        robotPosition={currentRobotPosition ?? ROBOT_INITIAL_POSITION}
        movementVertical={movementVertical ?? []}
        movementSteer={movementSteer ?? []}
        turningPath={turningPath}
        obstacles={selectedTest.obstacles}
        canAddObstacle={true}
        setSelectedTest={setSelectedTest}
      />
    </CoreContainter>
  );
};
