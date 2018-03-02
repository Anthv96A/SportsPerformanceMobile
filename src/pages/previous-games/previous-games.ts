import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController } from 'ionic-angular';
import { Game } from '../../models/game.model';
import { Hole } from '../../models/hole.model';
import { Goal } from '../../models/goal.model';
import { ServerProvider } from '../../providers/server/server';
import { Subscription } from 'rxjs';



@IonicPage()
@Component({
  selector: 'page-previous-games',
  templateUrl: 'previous-games.html',
})
export class PreviousGamesPage{

  called: boolean = false; 
  preDefinedDates: boolean = false;

  background = { link: 'assets/imgs/golf-home.jpg' };
  subscription$: Subscription;

  fromDate: string;
  toDate: string;

  games:Game[] = [];

  constructor(public navCtrl: NavController, private serverProvider: ServerProvider,private loaderCtrl: LoadingController, public alertCtrl: AlertController) {}
  
  ionViewDidLoad() {
     
    let obj =  this.initialiseDates();
    this.fromDate = obj.from;
    this.toDate = obj.to;
  }

  search(){

    let loader = this.loaderCtrl.create({
      content: `Loading Data`,
      showBackdrop: true
    })
    if(this.games.length !== 0){
      while(this.games.length !== 0){
        this.games.pop();
      }
    }
    this.subscription$ = this.serverProvider.getAllGamesWithinPeriod(this.fromDate, this.toDate).subscribe((data: Game[]) =>{
        this.games = data;
        this.called = true;
      });
    loader.dismiss();
  }

  moreInfo(){
    let alert = this.alertCtrl.create({
      title: 'Selecting Date Range',
      message: `
      <p style="text-align:center">
        You have the ability to query any date you like!
      </p>

      <p style="text-align:center">
        If you wish to quickly see <strong>last week\'s data</strong> or the <strong>last two week\'s data.</strong>
        You can toggle to these controls at the top of the page. 
      </p>

       `,
      buttons: ['OK']
    });
    alert.present();
  }  


  selectGame(game: Game){
    this.navCtrl.push('PreviousGameDetailPage', {game: game});
  }

  oneWeekSearch(){

    let data = new Date();
    let fromDate = new Date()
    fromDate.setDate(data.getDate() - 7);

    let toDate = new Date()
    toDate.setDate(data.getDate());

    this.fromDate= fromDate.toISOString();
    this.toDate = toDate.toISOString();

    this.search();

  }


  twoWeekSearch(){

    let data = new Date();

    let fromDate = new Date()
    fromDate.setDate(data.getDate() - 14);

    let toDate = new Date()
    toDate.setDate(data.getDate());

    this.fromDate= fromDate.toISOString();
    this.toDate = toDate.toISOString();

    this.search();

  }


  ionViewWillLeave(){
    this.called ? this.subscription$.unsubscribe() : console.log("Component Destroyed")
  }

  private initialiseDates(){

    let obj = { from: null, to: null  };
    let data = new Date();

    let to = new Date()
    to.setDate(data.getDate());

    let from = new Date();
    from.setDate(data.getDate())

    obj.from = from.toISOString();
    obj.to = to.toISOString();

    return obj;

  }

}
