import { Component } from '@angular/core';
import { IonicPage, NavController, MenuController, Platform, ToastController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Game } from '../../models/game.model';
import { GameMethods } from '../../superclasses/game-methods';
import { ServerProvider } from '../../providers/server/server';
import { Goal } from '../../models/goal.model';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network';



@IonicPage()
@Component({
  selector: 'page-continue-game',
  templateUrl: 'continue-game.html',
})
export class ContinueGamePage extends GameMethods {

  games: Game[];
  connected$: Subscription;
  disconnected$: Subscription;
  isOnline: boolean = true;
  game: Game;
  isComplete: boolean = false;


  constructor(public navCtrl: NavController, public menu: MenuController, public db: DatabaseProvider, private platform:Platform, public toastCtrl: ToastController, public alertCtrl :AlertController, public serverProvider: ServerProvider, public loadingCtrl:LoadingController, private network:Network) {
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
     this.watchNetwork();
     this.refreshData();
   }  

   ionViewWillLeave(){
    (this.connected$ !== undefined) ? this.connected$.unsubscribe() : console.log("Left page");
    (this.disconnected$ !== undefined) ? this.disconnected$.unsubscribe(): console.log("Left page")
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

      this.determine();

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
      subTitle: 'Would you like to add emotions before the game ends?',
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

  determine(){
    if(this.isComplete){
      if(this.game.postEmotions === null || undefined){
        this.gamePostEmotions();
      } else{
         this.finishGameController();
      }
     
     }
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

  if(this.isOnline){
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
  } else{
    this.toastCtrl.create({
      message: `Cannot send data while offline`,
      duration: 3000
    }).present();
  }

  
}

watchNetwork(){

  if(this.platform.is('android') || this.platform.is('ios')){
    this.platform.ready().then(() => {
      setTimeout(() => {
          this.disconnected$ = this.network.onDisconnect().subscribe(() =>{
            this.isOnline = false;
            this.toastCtrl.create({
                message: `You are offline`,
                duration: 2000
            }).present();
        });
        this.connected$ = this.network.onConnect().subscribe(data =>{
          this.isOnline = true;
          this.toastCtrl.create({
            message: `You are online`,
            duration: 2000
        }).present();
        })
      }, 2000)
    });
  }
}




}
