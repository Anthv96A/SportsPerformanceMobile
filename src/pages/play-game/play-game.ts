import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ToastController, Platform, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { GameProvider } from '../../providers/game/game';
import { GameMethods } from '../../superclasses/game-methods';
import { ServerProvider } from '../../providers/server/server';
import { Storage } from '@ionic/storage/dist/storage';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Goal } from '../../models/goal.model';
import { Game } from '../../models/game.model';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network';
import { PlayGameEnum } from './play-game.enum';


@IonicPage()
@Component({
  selector: 'page-play-game',
  templateUrl: 'play-game.html',
})
export class PlayGamePage extends GameMethods {

  private static DURATION: number = 2000;

  connected$: Subscription;
  disconnected$: Subscription;
  isOnline: boolean = true;
  lastGameFetched: boolean = false;

  exists: boolean = false;

  goal: string;
  preEmotions: string;
  postEmotions: string;
  isGameDone: boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public menu: MenuController,
    public gameService:GameProvider,
    private db: DatabaseProvider,
    public toastCtrl:ToastController, 
    private platform: Platform, 
    private alertCtrl :AlertController,
    public serverProvider: ServerProvider,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    private network: Network) {

    super(menu,serverProvider,toastCtrl,loadingCtrl,navCtrl,storage)
    this.goal = this.navParams.get('selected');

    let loader = this.loadingCtrl.create({
      content: `Starting game with ${this.goal} as goal`,
      showBackdrop: true
    });

    loader.present();

    if(this.platform.is(PlayGameEnum.ANDROID) || this.platform.is(PlayGameEnum.IOS)){
      this.db.getDatabaseState().subscribe(rdy => {
        if (rdy) {
          this.checkIfGameExists();
          if(this.isOnline){
            this.fetchLastGame(this.goal);
          }
        }
      })
     }
     this.watchNetwork();
     loader.dismiss();
     this.gamePreEmotions();
  }

  ionViewDidLoad(){
    if(this.platform.is(PlayGameEnum.ANDROID) || this.platform.is(PlayGameEnum.IOS)){
       this.checkIfGameExists();
    }
  }


  refreshData(){
    this.db.getAllHoles().then(data =>{
      this.holes = data;
      this.totalScore = this.getTotalScore(this.holes);
      this.isGameDone = this.checkIfGameIsDone(this.holes);

      if(this.isGameDone){
        this.gamePostEmotions();
      }
    })
    
  }


  loadGameData() {
    this.db.getAllHoles().then(data => {
      this.holes = data;
      this.totalScore = this.getTotalScore(this.holes);
  
      if(!this.exists){
        this.db.createGameTable().then(res => {
          this.db.insertGoalName(this.goal).then((data) => {
            this.toastCtrl.create({
              message: `Game Successfully created`,
              duration: 1500
            }).present();
                this.storage.get(PlayGameEnum.EXISTS).then(val => {
                  if(val){
                      this.storage.remove(PlayGameEnum.EXISTS).then(()=>{
                        this.storage.set(PlayGameEnum.EXISTS, PlayGameEnum.EXISTS);
                      })
                  } else{
                    this.storage.set(PlayGameEnum.EXISTS, PlayGameEnum.EXISTS);
                  }
              }).catch((err) => {
                this.toastCtrl.create({
                  message: `An error occurred in local storage ${err}`,
                  duration: PlayGamePage.DURATION
                }).present();
              })
          }).catch((err) => {
            this.toastCtrl.create({
              message: `An error occurred ${err}`,
              duration: PlayGamePage.DURATION
            }).present();
          })

      }).catch((err) => {
        this.toastCtrl.create({
          message: `An error occurred creating table ${err}`,
          duration: PlayGamePage.DURATION
        }).present();
      }) 
      } else{
       // Refresh Sqlite
        this.refreshData();
      }
       
    })
  }

  viewPreEmotions(){
    let emotion = 'None';

    if(this.preEmotions !== undefined){
      emotion = this.preEmotions;
    }

    let alert = this.alertCtrl.create({
      title: 'Pre-emotions',
      message: `
      <p style="text-align:center">
       ${emotion}
      </p>

       `,
      buttons: ['OK']
    });
    alert.present();
  }

  viewPostEmotions(){
    let emotion = 'None';
    if(this.postEmotions !== undefined){
      emotion = this.postEmotions;
    }

    let alert = this.alertCtrl.create({
      title: 'Pre-emotions',
      message: `
      <p style="text-align:center">
       ${emotion}
      </p>
       `,
      buttons: ['OK']
    });
    alert.present();
  }


  gamePreEmotions(){
    this.alertCtrl.create({
      title: 'Pre-emotions',
      subTitle: 'Would you like to add emotions before the game starts?',
      inputs: [
        {
          name: 'preEmotions',
          placeholder:'Add pre-emotions to game',
          value: this.preEmotions
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.preEmotions = 'None'
          }
        }, {
          text: 'Add',
          handler: data => {
            if(data){
              this.preEmotions = data.preEmotions;
            }
            this.updateEmotions();
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
          value: this.postEmotions
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () =>{
            this.postEmotions = 'None'
            this.finishGame();
          }
        }, {
          text: 'Add',
          handler: data =>{
            if(data){
              this.postEmotions = data.postEmotions;
            } 
            this.updateEmotions();
            this.finishGame();
          }
        }
      ]
    }).present();
  }

  selectHole(number: number, score: number){
    this.navCtrl.push('DetailPage', {number: number, goal: this.goal, score: score});
  }

  updateEmotions(){
      this.db.insertEmotions(this.preEmotions,this.postEmotions,this.goal).then((data) => {
          this.toastCtrl.create({
            message:'Emotions added successfully',
            duration: PlayGamePage.DURATION
          }).present();
      }).catch((err) =>{
        this.toastCtrl.create({
          message: `An error occurred creating table ${err}`,
          duration: PlayGamePage.DURATION
        }).present();
      })
  }

  ionViewDidEnter() {
    this.menu.enable(true);

    if(this.platform.is(PlayGameEnum.ANDROID) || this.platform.is(PlayGameEnum.IOS)){
    this.checkIfGameExists();

    if(this.exists){
      // Refresh SQLite
      this.refreshData();

      if(this.isGameDone){
        this.gamePostEmotions();
      }
    }

    else{
      this.db.getDatabaseState().subscribe(rdy => {
        if (rdy) {
          this.loadGameData();
        }
      })
    }
  } else{
    this.holes = this.gameService.initialiseGame();
    this.totalScore = this.getTotalScore(this.holes);
  }
   
  }

  private checkIfGameExists(){
    this.db.checkTableCount().then(isCreated => {
        this.exists = isCreated;
    })
  }

  fetchLastGame(goal:string){
    // Subscribing to HTTP Request
    this.serverProvider.getLastGame(goal).subscribe((data) => {
        // Once data is returned, create previous game table
        this.db.createPreviousGameTable().then(() => {
          // If the data returns an empty DTO, then initialise data by giving 0 values
          if(data.holes.length == 0){
            this.db.fillPreviousDatabase();
            this.lastGameFetched = true;
            return;
          }
          // Else get the values then store them in memory
            this.lastTotalScore = data.totalScore;
            this.db.storagePreviousGame(data.holes);
            this.lastGameFetched = true;
        })
    })
  }


  ionViewWillLeave(){
    if(this.connected$ !== undefined){
      this.connected$.unsubscribe();
    }
    if(this.disconnected$ !== undefined){
      this.disconnected$.unsubscribe();
    }
    if(this.subscription$ !== undefined){
      this.subscription$.unsubscribe();
    }
  }

  finishGame(){
    let goal: Goal = new Goal(this.goal);
    let goals: Goal[] = [goal];
    let game: Game = new Game(
      this.goal,
      this.preEmotions,
      this.postEmotions,
      this.totalScore,
      this.holes,
      goals);
    this.sendToServer(game);
  }

  watchNetwork(){
    if(this.platform.is(PlayGameEnum.ANDROID) || this.platform.is(PlayGameEnum.IOS)){
      this.platform.ready().then(() => {
        setTimeout(() => {
          // Using a observable to stream reactive data, which watches for changes
            this.disconnected$ = this.network.onDisconnect().subscribe(() =>{
              this.isOnline = false;
              this.toastCtrl.create({
                  message: `You are offline`,
                  duration: PlayGamePage.DURATION
              }).present();
          });
           // Using a observable to stream reactive data, which watches for changes
          this.connected$ = this.network.onConnect().subscribe(data =>{
            this.isOnline = true;
            if(!this.lastGameFetched){
              this.alertCtrl.create({
                title: `Online`,
                message: `
                    We could not retrieve the last score due to bad connection, you are now online
                    and able to retrieve. Would you like to get the last score? 
                `,
                buttons: [
                  {
                    text: `Yes`,
                    handler: () => {
                      this.fetchLastGame(this.goal)
                    }
                  },
                  {
                    text: `No`,
                    handler: () => {
                      this.toastCtrl.create({
                        message: `Action Cancelled`,
                        duration: PlayGamePage.DURATION
                      }).present();
                    }
                  }
                ]
              }).present();
            }
          })
        }, PlayGamePage.DURATION
      )
      });
    }
  }



}
