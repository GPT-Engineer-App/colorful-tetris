import React, { useState, useEffect, useCallback } from "react";
import { Box, VStack, HStack, Text, Button, Heading, useInterval, Flex, keyframes } from "@chakra-ui/react";
import { FaArrowUp, FaArrowLeft, FaArrowRight, FaArrowDown } from "react-icons/fa";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
];

const COLORS = ["cyan.500", "yellow.500", "purple.500", "green.500", "red.500", "blue.500", "orange.500"];

const createEmptyBoard = () => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const isValidPosition = (board, shape, x, y) => {
  return shape.every((row, dy) =>
    row.every((value, dx) => {
      const nx = x + dx;
      const ny = y + dy;
      return value === 0 || (ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH && board[ny][nx] === 0);
    }),
  );
};

const placeShape = (board, shape, x, y, color) => {
  shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value === 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (ny >= 0) board[ny][nx] = color;
      }
    });
  });
};

const clearLines = (board) => {
  let lines = 0;
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every((value) => value > 0)) {
      lines++;
      board.splice(y, 1);
      board.unshift(Array(BOARD_WIDTH).fill(0));
    }
  }
  return lines;
};

const randomShape = () => {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { shape, color };
};

const dropAnimation = keyframes`
  0% { transform: translateY(-${BLOCK_SIZE}px); }
  100% { transform: translateY(0); }
`;

const Block = ({ color }) => <Box w={BLOCK_SIZE + "px"} h={BLOCK_SIZE + "px"} bg={color} border="2px solid" borderColor="gray.700" animation={`${dropAnimation} 0.1s linear`} />;

const Tetris = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [current, setCurrent] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const moveLeft = () => {
    const newX = position.x - 1;
    if (isValidPosition(board, current.shape, newX, position.y)) {
      setPosition({ ...position, x: newX });
    }
  };

  const moveRight = () => {
    const newX = position.x + 1;
    if (isValidPosition(board, current.shape, newX, position.y)) {
      setPosition({ ...position, x: newX });
    }
  };

  const rotateShape = () => {
    const rotated = current.shape[0].map((_, i) => current.shape.map((row) => row[i]));
    rotated.forEach((row) => row.reverse());
    if (isValidPosition(board, rotated, position.x, position.y)) {
      setCurrent({ ...current, shape: rotated });
    }
  };

  const dropShape = () => {
    const newY = position.y + 1;
    if (isValidPosition(board, current.shape, position.x, newY)) {
      setPosition({ ...position, y: newY });
    } else {
      if (position.y === 0) {
        setIsRunning(false);
        return;
      }
      placeShape(board, current.shape, position.x, position.y, current.color);
      setBoard([...board]);
      const clearedLines = clearLines(board);
      setScore(score + clearedLines * 100);
      setCurrent(randomShape());
      setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    }
  };

  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setCurrent(randomShape());
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    setIsRunning(true);
  };

  useInterval(
    () => {
      dropShape();
    },
    isRunning ? 500 : null,
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!isRunning) return;
      switch (e.key) {
        case "ArrowLeft":
          moveLeft();
          break;
        case "ArrowRight":
          moveRight();
          break;
        case "ArrowUp":
          rotateShape();
          break;
        case "ArrowDown":
          dropShape();
          break;
        default:
      }
    },
    [board, current, position, isRunning],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Flex justify="center" align="center" h="100vh" bg="gray.900">
      <VStack spacing={8}>
        <Heading color="white">Tetris</Heading>
        <HStack spacing={8}>
          <Box position="relative">
            <Box w={BLOCK_SIZE * BOARD_WIDTH + "px"} h={BLOCK_SIZE * BOARD_HEIGHT + "px"} bg="gray.800" border="4px solid" borderColor="gray.700">
              {board.map((row, y) =>
                row.map((color, x) => (
                  <Box key={`${x}-${y}`} position="absolute" left={x * BLOCK_SIZE + "px"} top={y * BLOCK_SIZE + "px"}>
                    {color !== 0 && <Block color={color} />}
                  </Box>
                )),
              )}
              {current &&
                current.shape.map((row, y) =>
                  row.map((value, x) => (
                    <Box key={`${x}-${y}`} position="absolute" left={(position.x + x) * BLOCK_SIZE + "px"} top={(position.y + y) * BLOCK_SIZE + "px"}>
                      {value === 1 && <Block color={current.color} />}
                    </Box>
                  )),
                )}
            </Box>
          </Box>
          <VStack spacing={4} align="flex-start">
            <Text fontSize="xl" color="white">
              Score: {score}
            </Text>
            {!isRunning && (
              <Button colorScheme="blue" onClick={startGame}>
                New Game
              </Button>
            )}
            <VStack spacing={2}>
              <Text color="white">Controls:</Text>
              <HStack>
                <FaArrowLeft />
                <Text color="white">Move Left</Text>
              </HStack>
              <HStack>
                <FaArrowRight />
                <Text color="white">Move Right</Text>
              </HStack>
              <HStack>
                <FaArrowUp />
                <Text color="white">Rotate</Text>
              </HStack>
              <HStack>
                <FaArrowDown />
                <Text color="white">Drop</Text>
              </HStack>
            </VStack>
          </VStack>
        </HStack>
      </VStack>
    </Flex>
  );
};

export default Tetris;
