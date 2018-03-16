import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController, ToastController, Platform } from 'ionic-angular';
import { Game } from '../../models/game.model';
import { ServerProvider } from '../../providers/server/server';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network';



@IonicPage()
@Component({
  selector: 'page-previous-games',
  templateUrl: 'previous-games.html',
})
export class PreviousGamesPage{

  private alive: boolean = true;

  called: boolean = false; 
  preDefinedDates: boolean = false;
  isOnline: boolean = true;
  maximumDate: any;

  background = { link: 'assets/imgs/golf-home.jpg' };
  private subscription$: Subscription;
  private connected$: Subscription;
  private disconnected$: Subscription;

  fromDate: string;
  toDate: string;

  games:Game[] = [];

  constructor(
    public navCtrl: NavController,
    private serverProvider: ServerProvider,
    private loaderCtrl: LoadingController,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private network: Network,
    private platform: Platform) {}
  
  ionViewDidLoad() {
    let obj =  this.initialiseDates();
    this.fromDate = obj.from;
    this.toDate = obj.to;
    this.maximumDate = new Date().toISOString();
  }

  ionViewDidEnter(){
    this.alive = true;
    this.watchNetwork();
  }

  search(){

    if(!this.isOnline){
      this.toastCtrl.create({
          message: `Unable to fetch results offline, please try again later.`,
          showCloseButton: true,
          closeButtonText: 'Ok',
          cssClass: "toast-container"
      }).present();
      return;
    }

    let loader = this.loaderCtrl.create({
      content: `Loading Data`,
      showBackdrop: true
    });
    loader.present();
    this.clearData();
   
    this.subscription$ = this.serverProvider.getAllGamesWithinPeriod(this.fromDate, this.toDate)
    .takeWhile(() => this.alive)
    .subscribe((data: Game[]) =>{
        this.games = data;
        this.called = true;
        loader.dismiss();
      });

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
    if(this.connected$ !== undefined){
      this.connected$.unsubscribe();
    }
    if(this.disconnected$ !== undefined){
      this.disconnected$.unsubscribe();
    }
    if(this.subscription$ !== undefined){
      this.subscription$.unsubscribe();
    }

    this.alive = false;
  }

  private initialiseDates(){

    let obj = { from: null, to: null  };
    let data = new Date();

    let to = new Date()
    to.setDate(data.getDate());

    let from = new Date();
    from.setDate(data.getDate() - 28 )

    obj.from = from.toISOString();
    obj.to = to.toISOString();

    return obj;

  }

  private clearData(){
    if(this.games.length !== 0){
      while(this.games.length !== 0){
        this.games.pop();
      }
    }
  }

  watchNetwork(){

    if(this.platform.is('android') || this.platform.is('ios')){
      this.platform.ready().then(() => {
        setTimeout(() => {
            this.disconnected$ = this.network.onDisconnect()
            .takeWhile(() => this.alive)
            .subscribe(() =>{
              this.isOnline = false;
              this.toastCtrl.create({
                  message: `Your internet connection appears to be offline`,
                  duration: 2000,
                  cssClass: 'toast-container'
              }).present();
          });
          this.connected$ = this.network.onConnect()
          .takeWhile(() => this.alive)
          .subscribe(data =>{
            this.isOnline = true;
            this.toastCtrl.create({
              message: `You are back online`,
              duration: 2000,
              cssClass: "toast-container"
          }).present();
          })
        }, 2000)
      });
    }
  }

}
