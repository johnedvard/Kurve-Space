import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number')
  x: number = 0.11;

  @type('number')
  y: number = 2.22;

  @type('number')
  rotation: number = 0;

  @type('string')
  playerId: string = '';

  constructor({ x, y, rotation }) {
    super();
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }
}
