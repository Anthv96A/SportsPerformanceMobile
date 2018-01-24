import { Injectable } from "@angular/core";
import { MOCK_START_GAME } from '../../mocks/start-game';
import { Hole } from '../../models/hole.model';



@Injectable()
export class GameProvider{

    holes: Hole[] = MOCK_START_GAME;

    constructor(){
    }

    initialiseGame(){
        return this.holes;
    }

}