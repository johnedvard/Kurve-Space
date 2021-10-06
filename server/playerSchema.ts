import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number')
  x: number = 0.11;

  @type('number')
  y: number = 2.22;

  constructor({ x, y }) {
    super();
    this.x = x;
    this.y = y;
  }
}
