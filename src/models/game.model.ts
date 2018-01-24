import { Hole } from './hole.model';
import { Goal } from './goal.model';

export class Game{



    constructor(public name?:string, public preEmotions?:string,
        public postEmotions?:string,
        public totalScore?: number,
        public holes?: Hole[],
        public goals?: Goal[]){}


        //  get getName(): string{
        //     return this.name;
        // }

        // set setName(name){
        //     this.name = name;
        // }

        // get getPreEmotions(): string{
        //     return this.preEmotions;
        // }

        // set setPreEmotions(preEmotions){
        //     this.preEmotions = preEmotions;
        // }

        // get getPostEmotions(): string{
        //     return this.postEmotions;
        // }

        // set setPostEmotions(postEmotions){
        //     this.postEmotions = postEmotions;
        // }

        // get getTotalScore(): number{
        //     return this.totalScore;
        // }

        // set setTotalScore(totalScore){
        //     this.totalScore = totalScore;
        // }

        // get getHoleSet(): Hole[]{
        //     return this.holeSet;
        // }

        // set setHoleSet(holeSet){
        //     this.holeSet = holeSet;
        // }

        // get getGoalSet(): Goal[]{
        //     return this.goalSet;
        // }

        // set setGoalSet(goalSet: Goal[]){
        //     this.goalSet = goalSet;
        // }

        
}