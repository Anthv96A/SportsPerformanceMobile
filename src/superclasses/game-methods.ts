import { MenuController, ToastController, LoadingController, NavController } from 'ionic-angular';
import { Hole } from '../models/hole.model';
import { Game } from '../models/game.model';
import { ServerProvider } from '../providers/server/server';
import { Subscription } from 'rxjs';

export class GameMethods {

    subscription$: Subscription
    background = { link: 'assets/imgs/ball.jpg' };
    header = { link: 'assets/imgs/course.jpg '}
    lastTotalScore: number = 0;
    totalScore:number;
    holes: Hole[] = [];
    constructor(public menu: MenuController,public serverProvider:ServerProvider, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public navCtrl: NavController){}

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

      checkIfGameIsDone(holes: Hole[]): boolean{

        for(let i =0; i < holes.length; i++){
          if(holes[i].score == 0){
            return false;
          }
        }
        return true;
      }

      sendToServer(game:Game){

            let loader = this.loadingCtrl.create({
              content: `Please wait ...`,
              showBackdrop: true
            })

            loader.present();

            this.serverProvider.finishGame(game).subscribe((data) =>{
              this.toastCtrl.create({
                  message: "Successfully finished your game",
                  duration: 2000
              }).present();

              loader.dismiss();

              this.navCtrl.push("ReviewPage",{game:game}).then(() => {
                const index = this.navCtrl.getActive().index;
                this.navCtrl.remove(0,index);
              })   
          }, error =>{
              this.toastCtrl.create({
                message: `Oops! An error occured:  ${error}`,
                duration: 3000
            }).present();
            loader.dismiss();
          })
      }
   
}