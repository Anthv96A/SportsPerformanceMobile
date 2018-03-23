import { Component, ViewChild } from '@angular/core';
import { IonicPage, LoadingController, Content, AlertController, ToastController } from 'ionic-angular';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { StatisticsDTO } from '../../models/statisticsDTO.model';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { Platform } from 'ionic-angular/platform/platform';
import { Storage } from '@ionic/storage';
import { StatisticsEnum } from './statistics.enum';

@IonicPage()
@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.html',
})
export class StatisticsPage {

  private alive: boolean = true;

  private connected$: Subscription = undefined;
  private disconnected$: Subscription = undefined;
  private timeperiod$: Subscription = undefined;
  private all$: Subscription = undefined;

   @ViewChild(Content) 
   content: Content;

   isOnline: boolean = true;

   ready: boolean = false;
   statistics: {  statistic: string, goal: string, value: number }[] = [];
   doughnutChartLabels:string[] = [];
   doughnutChartData:number[] = [];
   doughnutChartType:string = StatisticsEnum.CHART_TYPE;

   fetchType: string = null;

   allSelected: boolean;
   weekSelected: boolean;
   twoWeekSelected: boolean;

  constructor(
    private statisticsProvider: StatisticsProvider,
    private loaderCtrl:LoadingController,
    private alertCtrl: AlertController,
    private network: Network,
    private toastCtrl: ToastController,
    private platform: Platform,
    private storage: Storage){}

  ionViewDidEnter(){
    this.alive = true;
    if(this.connected$ !== undefined){
      this.connected$.unsubscribe();
      this.connected$ = undefined;
    }
    if(this.disconnected$ !== undefined){
      this.disconnected$.unsubscribe();
      this.disconnected$ = undefined;
      }
    
    this.watchNetwork();
  }

  ionViewDidLoad(){
    this.storage.get(StatisticsEnum.RANGE).then((val: string) => {
      if(val){
        this.fetchType = val;

        switch(this.fetchType){
           case StatisticsEnum.FETCH_ALL:
              this.allSelected = true;
            break;
           case StatisticsEnum.FETCH_LAST_WEEK:
              this.weekSelected = true;
            break;
           case StatisticsEnum.FETCH_TWO_WEEKS:
              this.twoWeekSelected = true;
            break;
        }

      } else{
        this.allSelected = true;
        this.fetchType = StatisticsEnum.FETCH_ALL;
      }
      this.fetchData();
    }).catch((err) => console.log(err));
  }

  private fetchData(){
    if(this.isOnline){
      this.clearData();
      this.ready = false;
      if(this.fetchType === StatisticsEnum.FETCH_ALL){
        this.getAllData(); 
      } else{
        this.getTimePeriodData();
      } 
    } else{
      this.toastCtrl.create({
          message: StatisticsEnum.MESSAGE_OFFLINE,
          duration: 2000
      }).present();
    }
  }

  private getTimePeriodData(){

    let data = new Date();
    let fromDate = new Date()
    let toDate = new Date()

    if(this.fetchType === StatisticsEnum.FETCH_LAST_WEEK){
        fromDate.setDate(data.getDate() - 7);
    } else if(this.fetchType === StatisticsEnum.FETCH_TWO_WEEKS){
        fromDate.setDate(data.getDate() - 14);
    }

    toDate.setDate(data.getDate());

    let from: string  = fromDate.toISOString();
    let to: string = toDate.toISOString();

    let loader = this.loaderCtrl.create({
      content: StatisticsEnum.LOADER_CONTENT,
      showBackdrop: true
    })
    loader.present();
    
   this.timeperiod$ = this.statisticsProvider.getStatisticsPeriod(from,to)
   .takeWhile(() => this.alive)
   .subscribe((data: StatisticsDTO) => {
      this.populate(data);
      loader.dismiss();
      setTimeout(() =>{
        this.content.resize()
      },300)
    })
  }

  private clearData(){
    this.statistics = [];
    this.doughnutChartLabels = [];
    this.doughnutChartData = [];
  }

  private getAllData(){
    let loader = this.loaderCtrl.create({
      content:  StatisticsEnum.LOADER_CONTENT,
      showBackdrop: true
    })
    loader.present();
   this.all$ = this.statisticsProvider.getStatistics()
   .takeWhile(() => this.alive)
   .subscribe((data: StatisticsDTO) => {
      this.populate(data);
      loader.dismiss();
      setTimeout(() =>{
        this.content.resize()
      },300)
    
    })
  }

  public chartClicked(e:any):void {
    console.log(e);
  }
  
  public chartHovered(e:any):void {
    console.log(e);
  }


  private populate(data: StatisticsDTO): void{

    if(data.hasOwnProperty(StatisticsEnum.DATA_TOTAL_GAMES)){
      this.statistics.push({statistic: StatisticsEnum.DATA_STATISTIC, goal: StatisticsEnum.DATA_GOAL, value: data.totalGames})
    }
    for(let key in data){
      for(let prop in data[key]){
        if(key !== StatisticsEnum.DATA_GOALS_AND_GAMES_COUNT){
          this.statistics.push({statistic: key, goal:prop, value: data[key][prop]});
        } else{
           // 'prop' is the goal from the server
            this.doughnutChartLabels.push(prop);
            this.doughnutChartData.push(data[key][prop])
        } 
      }
    }
    this.ready = true;

  }

  options(): void{
    let alert = this.alertCtrl.create();
    alert.setTitle(StatisticsEnum.ALERT_TITLE);

    alert.addInput({
      type: StatisticsEnum.ALERT_TYPE,
      label: StatisticsEnum.LABEL_ALL,
      checked: this.allSelected,
      value: StatisticsEnum.FETCH_ALL
    });

    alert.addInput({
      type: StatisticsEnum.ALERT_TYPE,
      label: StatisticsEnum.LABEL_LAST_WEEK,
      checked: this.weekSelected,
      value: StatisticsEnum.FETCH_LAST_WEEK
    });

    alert.addInput({
      type: StatisticsEnum.ALERT_TYPE,
      label: StatisticsEnum.LABEL_TWO_WEEKS,
      checked: this.twoWeekSelected,
      value: StatisticsEnum.FETCH_TWO_WEEKS
    });


    alert.addButton(StatisticsEnum.ALERT_CANCEL);
    alert.addButton({
      text: StatisticsEnum.ALERT_OK,
      handler: (data: any) => {
          if(data === StatisticsEnum.FETCH_ALL){
              this.fetchType = StatisticsEnum.FETCH_ALL;
              this.allSelected = true;
              this.weekSelected = false;
              this.twoWeekSelected = false;
              this.storage.set(StatisticsEnum.RANGE,StatisticsEnum.FETCH_ALL);

          } else if(data === StatisticsEnum.FETCH_LAST_WEEK){
              this.fetchType = StatisticsEnum.FETCH_LAST_WEEK;
              this.allSelected = false;
              this.weekSelected = true;
              this.twoWeekSelected = false;
              this.storage.set(StatisticsEnum.RANGE, StatisticsEnum.FETCH_LAST_WEEK);
          } else{
              this.fetchType = StatisticsEnum.FETCH_TWO_WEEKS;
              this.allSelected = false;
              this.weekSelected = false;
              this.twoWeekSelected = true;
              this.storage.set(StatisticsEnum.RANGE, StatisticsEnum.FETCH_TWO_WEEKS);
          }

          this.fetchData();

      }
    });

    alert.present();
  }



  ionViewWillLeave(){
    // Important to handle observables correctly when done with them
    // Otherwise the application will get memory leaks.
    if(this.connected$ !== undefined){
        this.connected$.unsubscribe();
        this.connected$ = undefined;
    }
    if(this.disconnected$ !== undefined){
      this.disconnected$.unsubscribe();
      this.disconnected$ = undefined;
    }
    if(this.all$ !== undefined){
      this.all$.unsubscribe();
      this.all$ = undefined;
    }
    if(this.timeperiod$ !== undefined){
      this.timeperiod$.unsubscribe();
      this.timeperiod$ = undefined;
    }
    this.alive = false;
  }


  watchNetwork(){
    if(this.platform.is(StatisticsEnum.PLATFORM_ANDROID) || this.platform.is(StatisticsEnum.PLATFORM_IOS) || this.platform.is(StatisticsEnum.PLATFORM_WINDOWS)){
      this.platform.ready().then(() => {
        setTimeout(() => {
            this.disconnected$ = this.network.onDisconnect()
            .takeWhile(() => this.alive)
            .subscribe(() =>{
              this.isOnline = false;
              this.toastCtrl.create({
                  message: StatisticsEnum.MESSAGE_OFFLINE,
                  duration: 2000
              }).present();
          });
          this.connected$ = this.network.onConnect()
           .takeWhile(() => this.alive)
          .subscribe(data =>{
            this.isOnline = true;
            this.alertCtrl.create({
              title: StatisticsEnum.ALERT_ONLINE,
              message: StatisticsEnum.MESSAGE_ONLINE,
              buttons: [
                {
                  text: StatisticsEnum.ALERT_YES,
                  handler: () => {
                    this.fetchData();
                  }
                },
                {
                  text:  StatisticsEnum.ALERT_NO,
                  handler: () => {
                    this.toastCtrl.create({
                      message: StatisticsEnum.ALERT_ACTION_CANCELLED,
                      duration: 2000
                    }).present();
                  }
                }
              ]
            }).present();
          })
        }, 2000)
      });
    }
  }


 }



