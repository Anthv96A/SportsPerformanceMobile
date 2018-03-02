import { Component } from '@angular/core';
import { IonicPage, NavController, MenuController, Platform, ToastController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Game } from '../../models/game.model';
import { Hole } from '../../models/hole.model';
import { GameMethods } from '../../superclasses/game-methods';
import { ServerProvider } from '../../providers/server/server';
import { Goal } from '../../models/goal.model';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';



@IonicPage()
@Component({
  selector: 'page-continue-game',
  templateUrl: 'continue-game.html',
})
export class ContinueGamePage extends GameMethods {

  games: Game[];
  // holes: Hole[] = [];
  // totalScore: number;
  game: Game;
  

  isComplete: boolean = false;


  constructor(public navCtrl: NavController, public menu: MenuController, public db: DatabaseProvider, private platform:Platform, public toastCtrl: ToastController, public alertCtrl :AlertController, public serverProvider: ServerProvider, public loadingCtrl:LoadingController) {
    super(menu,serverProvider,toastCtrl,loadingCtrl,navCtrl)
    if(this.platform.is('android') || this.platform.is('ios')){
      this.db.getDatabaseState().subscribe(rdy => {
        if (rdy) {
          this.resumeGame();
        }
      })
     }
  }


   ionViewDidEnter() {
     this.refreshData();
   }  


   async resumeGame(){
     try{
      this.games = await this.db.selectFromGame();
      this.refreshData();
     } catch(e){
        this.toastCtrl.create({
          message:`Oops! An error occured! ${e}`,
          duration: 3000
        }).present();
     }
  
   }

   async refreshData(){
     try{
      this.holes = await this.db.getAllHoles();
      this.totalScore = this.getTotalScore(this.holes);
      this.game = this.games[0];
      this.game.totalScore = this.totalScore;

      let previousHoles = await this.db.fetchAllPreviousHoles();

      this.lastTotalScore = this.getTotalScore(previousHoles);


      this.isComplete = this.checkIfGameIsDone(this.holes);

      if(this.isComplete){
       if(this.game.postEmotions === null || undefined){
         this.gamePostEmotions();
       } else{
          this.finishGameController();
       }
      
      }

     } catch(e){
        this.toastCtrl.create({
          message:`Oops! An error occured when refreshing! ${e}`,
          duration: 3000
        }).present();
     }
  }


  selectHole(number: number, score: number){
    this.navCtrl.push('DetailPage', {number: number, goal: this.game.name, score:score});
  }


  gamePreEmotions(){
    this.alertCtrl.create({
      title: 'Pre-emotions',
      subTitle: 'Would you like to add emotions before the game starts?',
      inputs: [
        {
          name: 'preEmotions',
          placeholder:'Add pre-emotions to game',
          value: this.game.preEmotions
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () =>{

          }
        }, {
          text: 'Add',
          handler: data =>{
            this.game.preEmotions = data.preEmotions;
            this.updateEmotions();
          }
        }
      ]
    }).present();
  }


  // checkIfGameIsDone(holes: Hole[]): boolean{

  //   for(let i =0; i < holes.length; i++){
  //     if(holes[i].score == 0){
  //       return false;
  //     }
  //   }
  //   return true;
  // }


  finishGameController(){
    this.alertCtrl.create({
      title: 'Finish game',
      subTitle: 'Would you like to end the game?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () =>{
          }
        }, {
          text: 'Finish',
          handler: () =>{
           this.finishGame();
          }
        }
      ]
    }).present();
  }


  viewPreEmotions(){

    if( this.game.preEmotions === undefined || this.game.preEmotions === null){
      this.game.preEmotions = 'None'
    }

    let alert = this.alertCtrl.create({
      title: 'Pre-emotions',
      message: `
      <p style="text-align:center">
       ${this.game.preEmotions}
      </p>

       `,
      buttons: ['OK']
    });
    alert.present();
  }

  viewPostEmotions(){
    if(this.game.postEmotions === undefined || this.game.preEmotions === null){
      this.game.postEmotions = 'None'
    }

    let alert = this.alertCtrl.create({
      title: 'Pre-emotions',
      message: `
      <p style="text-align:center">
       ${this.game.postEmotions}
      </p>

       `,
      buttons: ['OK']
    });
    alert.present();
  }


  gamePostEmotions(){
    this.alertCtrl.create({
      title: 'Post emotions',
      subTitle: 'Would you like to add emotions after the game finishes?',
      inputs: [
        {
          name: 'postEmotions',
          placeholder:'Add post-emotions to game',
          value: this.game.postEmotions
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () =>{
            this.finishGameController();
          }
        }, {
          text: 'Add',
          handler: data =>{
            this.game.postEmotions = data.postEmotions;
            this.updateEmotions();
            this.finishGameController();
          }
        }
      ]
    }).present();
  }


  updateEmotions(){
    this.db.insertEmotions(this.game.preEmotions,this.game.postEmotions,this.game.name).then((data) =>{
        this.toastCtrl.create({
          message:`Emotions added successfully`,
          duration: 2000
        }).present();
    }).catch((err) => {
      this.toastCtrl.create({
        message: `An error occurred creating table ${err}`,
        duration:3000
      }).present();
    })
}


 finishGame(){

  // let loader = this.loadingCtrl.create({
  //   content: `Please wait ...`,
  //   showBackdrop: true
  // })

  // loader.present();

  let goal: Goal = new Goal(this.game.name);
  let goals: Goal[] = [goal];
  let game: Game = new Game(
    this.game.name,
    this.game.preEmotions,
    this.game.postEmotions,
    this.totalScore,
    this.holes,
    goals);

    this.sendToServer(game);

    // this.serverProvider.finishGame(game).subscribe((data) =>{
    //     this.toastCtrl.create({
    //         message: "Successfully finished your game",
    //         duration: 2000
    //     }).present();

    //     loader.dismiss();

    //     this.navCtrl.push("ReviewPage",{game:game}).then(() => {
    //       const index = this.navCtrl.getActive().index;
    //       this.navCtrl.remove(0,index);
    //     })   
    // }, error =>{
    //     this.toastCtrl.create({
    //       message: `Oops! An error occured:  ${error}`,
    //       duration: 3000
    //   }).present();
    //   loader.dismiss();
    // })
  
}




}
