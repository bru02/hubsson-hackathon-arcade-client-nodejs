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
	goal = Goal.Start;
});

gameClient.onGameUpdate((state: GameState): void => {
	const me = state.players.find((p) => p.playerId === playerId);

	const { x, y } = me.coordinates.at(-1);

	function isObstacle(x, y, players) {
		if (x < 0 || x === state.width || y < 0 || y === state.height)
			return true;

		for (let player of players) {
			for (let i = player.coordinates.length - 1; i > 0; i--) {
				const choords = player.coordinates[i];

				if (
					(choords.x === x && choords.y === y) ||
					(player.playerId !== playerId &&
						i === player.coordinates.length - 1 &&
						isNeighbor({ x, y }, choords))
				) {
					return true;
				}
			}
		}

		return false;
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

	function wouldCollide(x: number, y: number, dir: Direction, players) {
		switch (dir) {
			case "Up":
				return isObstacle(x, y - 1, players);
			case "Down":
				return isObstacle(x, y + 1, players);
			case "Left":
				return isObstacle(x - 1, y, players);
			case "Right":
				return isObstacle(x + 1, y, players);
		}
	}

	function getMovesForPlayer(x, y, players): Direction[] {
		const ret = (["Up", "Down", "Left", "Right"] as Direction[]).filter(
			(dir) => !wouldCollide(x, y, dir, players)
		);

		if (!ret.length) return [Direction.UP];
		return ret;
	}

	function calculateDirectionTerritory(
		dir: Direction,
		player: PlayerCoordinates
	) {}

	function step(x, y, dir: Direction) {
		switch (dir) {
			case "Up":
				return { x, y: y - 1}
			case "Down":
				return { x, y: y + 1}
			case "Left":
				return { x: x - 1, y}
			case "Right":
				return { x: x + 1, y}
		}
	}

	function getLineLength(x, y, dir: Direction) {
		let l = 0;
		while (!wouldCollide(x, y, dir, state.players)) {
			const coords = step(x, y, dir);

			x = coords.x;
			y = coords.y;
			console.log(x, y);
			l++
		}
		return l;
	}

	function isZsakutca(dir) {
		const players = JSON.parse(JSON.stringify(state.players));
		const me = players.find((p) => p.playerId === playerId);

		let moves = [dir];
		while (true) {
			let { x, y } = me.coordinates.at(-1);
			moves = getMovesForPlayer(x, y, players);

			if (moves.length === 0) return true;
			if (moves.length > 1) return false;

			me.coordinates.push(step(x, y, moves[0]));
		}
	}
	const possibleMoves = getMovesForPlayer(x, y, state.players);
	console.log(possibleMoves);
	if (!possibleMoves.includes(prevDir)) {
		console.log("Changing direction");
		const moves = possibleMoves
			.map((dir) => ({
				dir,
				l: getLineLength(x, y, dir),
				z: isZsakutca(dir),
			}))
			.sort((a, b) => b.l - a.l)
			.sort((a, b) => (a.z ? 1 : 0) - (b.z ? 1 : 0));

		console.log(moves);

		prevDir = moves[0].dir;
	}

	gameClient.sendAction(prevDir, state.iteration);
});

gameClient.run();
