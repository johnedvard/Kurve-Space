import { Vector, emit } from 'kontra';
import { GameEvent } from './gameEvent.js';
import { lineIntersection } from './gameUtils.js';
/**
 * Persistent storage of line segments for
 */

/**
 * @type {[id:string]:Player}
 */
const players = {};

/**
 * @type {[id:string]:[[]]}
 */
const playerTrails = {}; // playerIds with a list of line segments.
/**
 * Used to add the player's latest position to the trail before checking intersection
 */
export const addPlayer = (player) => {
  players[player.playerId] = player;
};

/**
 * Check if player hits any trail
 */
export const checkLineIntersection = (goPoint, go) => {
  if (!goPoint || !go) return;
  const lastPoint = goPoint;
  const lastPoint2 = Vector(go.x, go.y);

  for (const [playerId, trails] of Object.entries(playerTrails)) {
    trails.forEach((lineSegment, segmentIndex) => {
      const points = [...lineSegment];
      if (
        players[playerId].sprite !== go &&
        segmentIndex === trails.length - 1
      ) {
        // Add player pos if last line segment
        points.push(
          Vector(players[playerId].sprite.x, players[playerId].sprite.y)
        );
      }
      for (let i = 0; i < points.length - 1; i++) {
        const point = points[i];
        const point2 = points[i + 1];
        if (
          point !== lastPoint &&
          point !== lastPoint2 &&
          point2 !== lastPoint2 &&
          point2 !== lastPoint
        ) {
          const intersection = lineIntersection(
            point,
            point2,
            lastPoint,
            lastPoint2
          );
          if (intersection) {
            emit(GameEvent.hitTrail, {
              point: intersection,
              go,
              playerId,
              trailIndex: i,
              segmentIndex,
            });
          }
        }
      }
    });
  }
};

export const getPlayerTrail = (playerId) => {
  let trails = playerTrails[playerId];
  if (!trails) {
    trails = playerTrails[playerId] = [[]];
  }
  return trails;
};
