import { MenuController } from 'ionic-angular';
import { Hole } from '../models/hole.model';

export class GameMethods {

    background = { link: 'assets/imgs/ball.jpg' };
    lastTotalScore: number = 0;
    
    constructor(public menu: MenuController){}

    public toogleMenu() {
        this.menu.toggle();
     }

     getTotalScore(holes: Hole[]): number{
        let total = 0;
        holes.forEach(hole =>{
          total += hole.score;
        })
        
        return total;
      }
   
}