import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Hole } from '../../models/hole.model';



@IonicPage()
@Component({
  selector: 'page-review',
  templateUrl: 'review.html',
})
export class ReviewPage {

 

  review: { holes:number, gameHoles: number, previousGameHoles: number }[] = [];


  // ionViewDidLoad(){

  //   for(let i = 1; i < 19; i++){
  //       this.review.push({holes:i,gameHoles:5,previousGameHoles:i});
  //   }

  // }

  constructor(public navCtrl: NavController, private db: DatabaseProvider, private storage: Storage, private toastCtrl: ToastController) {
    this.initialiseData();
  }


  async initialiseData(){
    try{
      const previousGameHoles: Hole[] =  await this.db.fetchAllPreviousHoles();
      const gameHoles: Hole[] =  await this.db.getAllHoles();

      for(let i = 0; i < gameHoles.length; i++){
         this.review.push( {holes: i, gameHoles: gameHoles[i].score, previousGameHoles: previousGameHoles[i].score} )
      }

    } catch(error){

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
        

        } catch(e){
            this.toastCtrl.create({
              message: `An error occurred ${e}`,
              duration: 3000
            }).present();
        }
    this.navCtrl.setRoot('TabsPage');
  }

 

}
