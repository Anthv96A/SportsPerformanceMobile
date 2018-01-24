import { Game } from './game.model';

export class Hole{
    constructor(
        public holeNumber?: number,
        public score?: number,
        public game?: Game
    ){}

}