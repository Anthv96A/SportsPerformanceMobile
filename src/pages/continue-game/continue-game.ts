import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Platform, ToastController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Game } from '../../models/game.model';
import { Hole } from '../../models/hole.model';
import { GameMethods } from '../../superclasses/game-methods';
import { ServerProvider } from '../../providers/server/server';
import { Goal } from '../../models/goal.model';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-continue-game',
  templateUrl: 'continue-game.html',
})
export class ContinueGamePage extends GameMethods {

  games: Game[];
  holes: Hole[] = [];
  totalScore: number;
  game: Game;
  

  isComplete: boolean = false;


  constructor(public navCtrl: NavController, public menu: MenuController, private db: DatabaseProvider, private platform:Platform, private toastCtrl: ToastController,private alertCtrl :AlertController, private serverProvider: ServerProvider, private loadingCtrl:LoadingController, private storage: Storage) {
    super(menu)
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
      this.games = await this.db.selectFromGame()
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
       // this.finishGameController();

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


  checkIfGameIsDone(holes: Hole[]): boolean{

    for(let i =0; i < holes.length; i++){
      if(holes[i].score == 0){
        return false;
      }
    }
    return true;
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
    }).catch((err) =>{
      this.toastCtrl.create({
        message: `An error occurred creating table ${err}`,
        duration:3000
      }).present();
    })
}


 finishGame(){

  let loader = this.loadingCtrl.create({
    content: `Please wait ...`,
    showBackdrop: true
  })

  loader.present();

  let goal: Goal = new Goal(this.game.name);
  let goals: Goal[] = [goal];
  let game: Game = new Game(
    this.game.name,
    this.game.preEmotions,
    this.game.postEmotions,
    this.totalScore,
    this.holes,
    goals);

    this.serverProvider.finishGame(game).subscribe((data) =>{
        this.toastCtrl.create({
            message: "Successfully finished your game",
            duration: 2000
        }).present();


        try{

         this.db.dropTables().then(res =>{
            let today = new Date();
            let dd = today.getDate();
            let mm = today.getMonth() + 1;
            let yyyy = today.getFullYear();

            let stored = `${dd}/${mm}/${yyyy}`;

            this.storage.set('played',stored);
            this.storage.remove('exists');
         })

        } catch(e){
          this.toastCtrl.create({
            message: `An error occurred ${e}`,
            duration: 3000
          }).present();
        }

        loader.dismiss();
    }, error =>{
        this.toastCtrl.create({
          message: `Oops! An error occured:  ${error}`,
          duration: 3000
      }).present();
      loader.dismiss();
    })
  

  // let goal: Goal = new Goal('Driver: To hit the fairway');

  // let goals: Goal[] = [goal];

  // let game:Game = new Game('Driver: To hit the fairway','some','none',this.totalScore,this.holes,goals);

  //  this.serverProvider.finishGame(game).subscribe((data)=>{
  //        console.dir(data);
  //  })
}




}
