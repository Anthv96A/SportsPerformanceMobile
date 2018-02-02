import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ToastController, Platform, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Hole } from '../../models/hole.model';
import { GameProvider } from '../../providers/game/game';
import { GameMethods } from '../../superclasses/game-methods';
import { ServerProvider } from '../../providers/server/server';
import { Storage } from '@ionic/storage/dist/storage';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';


@IonicPage()
@Component({
  selector: 'page-play-game',
  templateUrl: 'play-game.html',
})
export class PlayGamePage extends GameMethods {

  exists: boolean = false;

  goal: string;
  preEmotions: string;
  postEmotions: string;

  totalScore:number;
  holes: Hole[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public menu: MenuController,
    public gameService:GameProvider,
    private db: DatabaseProvider,
    private toastCtrl:ToastController, 
    private platform: Platform, 
    private alertCtrl :AlertController,
    private serverProvider: ServerProvider,
    private storage: Storage,
    public loadingCtrl: LoadingController) {

    super(menu)
    this.goal = this.navParams.get('selected');
   // this.fetchLastGame(this.goal);

    let loader = this.loadingCtrl.create({
      content: `Starting game with ${this.goal} as goal`,
      showBackdrop: true
    });

    loader.present();

    if(this.platform.is('android') || this.platform.is('ios')){
      this.db.getDatabaseState().subscribe(rdy => {
        if (rdy) {
          this.checkIfGameExists();
          this.fetchLastGame(this.goal);
        }
      })
     }

     loader.dismiss();
     this.gamePreEmotions();
  }

  ionViewDidLoad(){
    if(this.platform.is('android') || this.platform.is('ios')){
       this.checkIfGameExists();
    }
  }


  refreshData(){
    this.db.getAllHoles().then(data =>{
      this.holes = data;
      this.totalScore = this.getTotalScore(this.holes);
    })
  }



  loadGameData() {
    this.db.getAllHoles().then(data => {
      this.holes = data;
      this.totalScore = this.getTotalScore(this.holes);
  

      if(!this.exists){
        this.db.createGameTable().then(res =>{

          this.db.insertGoalName(this.goal).then((data)=>{
            this.toastCtrl.create({
              message: `Game Successfully created`,
              duration: 1500
            }).present();
                this.storage.get('exists').then(val =>{
                  if(val){
                      this.storage.remove('exists').then(()=>{
                        this.storage.set('exists', 'exists');
                      })
                  } else{
                    this.storage.set('exists', 'exists');
                  }
              }).catch((err) =>{
                this.toastCtrl.create({
                  message: `An error occurred in local storage ${err}`,
                  duration:10000
                }).present();
              })
          

          }).catch((err)=>{
            this.toastCtrl.create({
              message: `An error occurred ${err}`,
              duration:4000
            }).present();
          })

      }).catch((err)=>{
        this.toastCtrl.create({
          message: `An error occurred creating table ${err}`,
          duration:4000
        }).present();
      }) 
      } else{
       // Refresh Sqlite
        this.refreshData();
      }
       
    })
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
          handler: () =>{

          }
        }, {
          text: 'Add',
          handler: data =>{
            this.preEmotions = data.preEmotions;
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

          }
        }, {
          text: 'Add',
          handler: data =>{
            this.postEmotions = data.postEmotions;
            this.updateEmotions();
          }
        }
      ]
    }).present();
  }

  selectHole(number: number, score: number){
    this.navCtrl.push('DetailPage', {number: number, goal: this.goal, score: score});
  }

  updateEmotions(){
      this.db.insertEmotions(this.preEmotions,this.postEmotions,this.goal).then((data) =>{
          this.toastCtrl.create({
            message:'Emotions added successfully',
            duration: 2000
          }).present();
      }).catch((err) =>{
        this.toastCtrl.create({
          message: `An error occurred creating table ${err}`,
          duration:3000
        }).present();
      })
  }

  ionViewDidEnter() {
    this.menu.enable(true);

    if(this.platform.is('android') || this.platform.is('ios')){
    this.checkIfGameExists();

    if(this.exists){
      // Refresh SQLite
      this.refreshData();
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
    this.db.checkTableCount().then(created =>{
        this.exists = created;
    })
  }


  // mock(){

  //   let goal: Goal = new Goal('Driver: To hit the fairway');

  //   let goals: Goal[] = [goal];

  //   let game:Game = new Game('Driver: To hit the fairway','some','none',this.totalScore,this.holes,goals);

  //    this.serverProvider.finishGame(game).subscribe((data)=>{
  //          console.dir(data);
  //    })
  
  // }


  fetchLastGame(goal:string){
    this.serverProvider.getLastGame(goal).subscribe((data) =>{
     
        this.db.createPreviousGameTable().then(() =>{

          if(data.holes.length == 0){
            this.db.fillPreviousDatabase();
            return;
          }

            this.lastTotalScore = data.totalScore;
            let holes = data.holes;
            this.db.storagePreviousGame(holes).then(() =>{ })
        
        })
    
    })


  }


}
