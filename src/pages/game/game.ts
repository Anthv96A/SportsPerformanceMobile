import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-game',
  templateUrl: 'game.html',
})
export class GamePage {

  isGameAlreadyExist: boolean;
  alreadyPlayed: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,  private loadingCtrl:LoadingController, private storage:Storage) {

    storage.get('exists').then(data =>{
        if(data){
          if(data === 'exists'){
            this.isGameAlreadyExist = true;
          }
        } else{
          this.isGameAlreadyExist = false;
        }
    })
    storage.get('played').then(data =>{
      if(data){
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();

        let stored = `${dd}/${mm}/${yyyy}`;

        if(data === stored){
           this.alreadyPlayed = true;
        } else{ 
            this.storage.remove('played')
        }
        
      } 
    })

  }

  nativateToGoals(){
    this.navCtrl.push('GoalsPage');
  }

  continueGame(){
   let loader =  this.loadingCtrl.create({
      content: `Resuming Game`,
      showBackdrop: true
    })

    loader.present();
    this.navCtrl.push('ContinueGamePage').then(()=>{
      const index = this.navCtrl.getActive().index;
      this.navCtrl.remove(0,index);
      loader.dismiss()
    });
  }




}
