import { Injectable } from "@angular/core";
import { ALL_TECHNICAL_GOALS } from "../../mocks/all-goals";


@Injectable()
export class GoalProvider{

    private allGoals: string[] = ALL_TECHNICAL_GOALS;

    constructor(){}

    getGoals(){
        return this.allGoals;
    }
}