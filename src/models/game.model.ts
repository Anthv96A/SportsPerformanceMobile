import { Hole } from './hole.model';
import { Goal } from './goal.model';

export class Game{

    constructor(
        public name?:string,
        public preEmotions?:string,
        public postEmotions?:string,
        public totalScore?: number,
        public holes?: Hole[],
        public goals?: Goal[],
        public datePlayed?: string){}

        
}