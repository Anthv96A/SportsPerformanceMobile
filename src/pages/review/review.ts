import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Hole } from '../../models/hole.model';
import { Game } from '../../models/game.model';



@IonicPage()
@Component({
  selector: 'page-review',
  templateUrl: 'review.html',
})
export class ReviewPage {

  review: { holes:number, gameHoles: number, previousGameHoles: number }[] = [];
  game: Game;

  constructor(
    public navCtrl: NavController,public navParams: NavParams,private db: DatabaseProvider,
     private storage: Storage, private toastCtrl: ToastController, public alertCtrl: AlertController) {
     this.game = this.navParams.get('game');
     this.initialiseData();
  }

  showPreEmotions(){  
     let alert = this.alertCtrl.create({
        title: 'Pre-emotions',
        subTitle: `Your pre-emotions ${this.game.preEmotions}`,
        buttons: ['OK']
      });
     alert.present();
  }

  showPostEmotions(){
    let alert = this.alertCtrl.create({
      title: 'Post-emotions',
      subTitle: `Your post-emotions ${this.game.postEmotions}`,
      buttons: ['OK']
    });
   alert.present();
  }


  async initialiseData(){
    try{
      const previousGameHoles: Hole[] =  await this.db.fetchAllPreviousHoles();
      const gameHoles: Hole[] =  await this.db.getAllHoles();

      for(let i = 0; i < gameHoles.length; i++){
         this.review.push( {holes: i, gameHoles: gameHoles[i].score, previousGameHoles: previousGameHoles[i].score} )
      }
    } catch(error){
      this.toastCtrl.create({
        message: `An error occurred ${error}`,
        duration: 3000
      }).present();
    }

  }


 async finish() {
       try{
            await this.db.dropTables()
            let today = new Date();
            let dd = today.getDate();
            let mm = today.getMonth() + 1;
            let yyyy = today.getFullYear();

            let stored = `${dd}/${mm}/${yyyy}`;

            this.storage.set('played',stored);
            this.storage.remove('exists');

            this.toastCtrl.create({
              message: "Game finished",
              duration: 2000
            }).present();
        

        } catch(e){
            this.toastCtrl.create({
              message: `An error occurred ${e}`,
              duration: 3000
            }).present();
        }
    this.navCtrl.setRoot('TabsPage');
  }

 

}
