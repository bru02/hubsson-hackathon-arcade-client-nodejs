import {
	GameState,
	Direction,
	PlayerCoordinates,
	Coordinate,
} from "../libs/model";
import { GameClient } from "../libs/game-client";

import { config, playerId } from "./config";

const gameClient = new GameClient(config);

enum Goal {
	Start,
	Encircle,
	Encircled,
}
let prevDir: Direction;
let goal: Goal;

gameClient.onGameStart((): void => {
	console.log("Game fasfas!");
	prevDir = Direction.DOWN;
	goal = Goal.Start
});

gameClient.onGameUpdate((state: GameState): void => {
	const me = state.players.find((p) => p.playerId === playerId);

	const { x, y } = me.coordinates.at(-1);

	function isObstacle(x, y) {
		if (x < 0 || x === state.width || y < 0 || y === state.height)
			return true;

		for (let player of state.players) {
			for (let i = player.coordinates.length - 1; i > 0; i--) {
				const choords = player.coordinates[i];

				if (
					(choords.x === x && choords.y === y) ||
					(player.playerId !== playerId && i === player.coordinates.length - 1 &&
						isNeighbor({ x, y }, choords))
				) {
					return true;
				}
			}
		}

		return false
	}

	function isNeighbor(
		{ x: x1, y: y1 }: Coordinate,
		{ x: x2, y: y2 }: Coordinate
	) {
		return (
			(x1 === x2 && Math.abs(y1 - y2) === 1) ||
			(y1 === y2 && Math.abs(x1 - x2) === 1)
		);
	}

	function wouldCollide(x: number, y: number, dir: Direction) {
		switch (dir) {
			case "Up":
				return isObstacle(x, y - 1);
			case "Down":
				return isObstacle(x, y + 1);
			case "Left":
				return isObstacle(x - 1, y);
			case "Right":
				return isObstacle(x + 1, y);
		}
	}

	function getMovesForPlayer(player: PlayerCoordinates): Direction[] {
		const { x, y } = player.coordinates.at(-1);
		console.log(x, y);
		const ret = (["Up", "Down", "Left", "Right"] as Direction[]).filter(
			(dir) => !wouldCollide(x, y, dir)
		);
		console.log(ret)
		if (!ret.length) return [Direction.UP];
		return ret;
	}

	function calculateDirectionTerritory(
		dir: Direction,
		player: PlayerCoordinates
	) {}








	console.log("Game State received");
	const possibleMoves = getMovesForPlayer(me);

	if (goal === Goal.Start && !possibleMoves.includes(Direction.DOWN)) {
		goal = Goal.Encircle;
		if (possibleMoves.length > 1) {
			prevDir = x < state.width - x ? Direction.RIGHT : Direction.LEFT;
		} else {
			prevDir = possibleMoves[0];
		}
	} else if(goal === Goal.Encircle) {
		

	} else {
		if (!possibleMoves.includes(prevDir)) {
			prevDir =
				possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
		}
	}


	gameClient.sendAction(prevDir, state.iteration);
});

gameClient.run();
