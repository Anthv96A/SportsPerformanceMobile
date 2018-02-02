import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Hole } from '../../models/hole.model';
import { Platform } from 'ionic-angular/platform/platform';



@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {

  selectedHole: Promise<Hole[]>;
  passedScore: number;
  selectedId: number
  hasChanged: boolean = false;
  selectedScore:number = 0;
  selectedGoal:string;
  lastScore: Promise<Hole[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: DatabaseProvider, private toastCtrl: ToastController, private platform: Platform) {
     
   this.passedScore = this.navParams.get('score'); 


   if(this.platform.is('android')) {
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
       this.loadData();
      }
    })
   } else{
    this.selectedId = parseInt(this.navParams.get('number'));
    this.selectedGoal = this.navParams.get('goal');
   }
  
  }


  async loadData(){
    this.selectedId = parseInt(this.navParams.get('number'));
    this.selectedHole = this.db.fetchHole(this.selectedId);
    this.lastScore = this.db.fetchPreviousHole(this.selectedId);
    this.selectedGoal = this.navParams.get('goal');
  }


   updateHole(updatedScore: number){
      this.hasChanged = true;
      this.selectedScore = updatedScore;  
      this.passedScore = updatedScore;
    } 

  ionViewWillLeave(){
   
    if(this.hasChanged){
      let hole = new Hole(this.selectedId, this.selectedScore)
      
      this.db.updateHole(hole).then((data)=>{
          this.toastCtrl.create({
              message: `Updated score of ${hole.score}`,
              duration: 2000
          }).present();
      })
    } else{
      this.toastCtrl.create({
          message: `Dismissed`,
          duration: 2000
      }).present();
      this.navCtrl.pop();
    }

  }

}
