import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController, ToastController, Platform } from 'ionic-angular';
import { Game } from '../../models/game.model';
import { ServerProvider } from '../../providers/server/server';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { PreviousGamesEnum } from './previous-games.enum';


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

  background = { link: PreviousGamesEnum.LINK };
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
    private platform: Platform,
    private storage: Storage) {}
  
  ionViewDidLoad() {
    let obj =  this.initialiseDates();
    this.fromDate = obj.from;
    this.toDate = obj.to;
    this.maximumDate = new Date().toISOString();

    this.storage.get(PreviousGamesEnum.SHARED_PREFERENCE).then((exists: boolean) => {
        if(exists){
            exists ? (this.preDefinedDates = true) : ( this.preDefinedDates = false);
        } else {
           this.preDefinedDates = false;
        }
    })
  }

  ionViewDidEnter(){
    this.alive = true;
    this.watchNetwork();
  }

  setPreference($event: boolean){
    $event ? this.storage.set(PreviousGamesEnum.SHARED_PREFERENCE, true) : this.storage.set(PreviousGamesEnum.SHARED_PREFERENCE, false);
  }

  search(){

    if(!this.isOnline){
      this.toastCtrl.create({
          message: PreviousGamesEnum.OFFLINE_MESSAGE,
          showCloseButton: true,
          closeButtonText: PreviousGamesEnum.TOAST_OKAY,
          cssClass: PreviousGamesEnum.TOAST_CSS
      }).present();
      return;
    }

    let loader = this.loaderCtrl.create({
      content: PreviousGamesEnum.LOADER_CONTENT,
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
      title: PreviousGamesEnum.ALERT_TITLE,
      message: `
      <p style="text-align:center">
        You have the ability to query any date you like!
      </p>

      <p style="text-align:center">
        If you wish to quickly see <strong>last week\'s data</strong> or the <strong>last two week\'s data.</strong>
        You can toggle to these controls at the top of the page. 
      </p>

       `,
      buttons: [PreviousGamesEnum.ALERT_OKAY]
    });
    alert.present();
  }  


  selectGame(game: Game){
    this.navCtrl.push(PreviousGamesEnum.PREVIOUS_GAME_DETAIL_PAGE, {game: game});
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

    if(this.platform.is(PreviousGamesEnum.PLATFORM_ANDROID) || this.platform.is(PreviousGamesEnum.PLATFORM_IOS) || this.platform.is(PreviousGamesEnum.PLATFORM_WINDOWS)){
      this.platform.ready().then(() => {
        setTimeout(() => {
            this.disconnected$ = this.network.onDisconnect()
            .takeWhile(() => this.alive)
            .subscribe(() =>{
              this.isOnline = false;
              this.toastCtrl.create({
                  message: PreviousGamesEnum.OFFLINE_MESSAGE,
                  duration: 2000,
                  cssClass: PreviousGamesEnum.TOAST_CSS
              }).present();
          });
          this.connected$ = this.network.onConnect()
          .takeWhile(() => this.alive)
          .subscribe(data =>{
            this.isOnline = true;
            this.toastCtrl.create({
              message: PreviousGamesEnum.ONLINE_MESSAGE,
              duration: 2000,
              cssClass: PreviousGamesEnum.TOAST_CSS
          }).present();
          })
        }, 2000)
      });
    }
  }

}
