import { Component, ViewChild } from '@angular/core';
import { IonicPage, LoadingController, Content, AlertController, ToastController } from 'ionic-angular';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { StatisticsDTO } from '../../models/statisticsDTO.model';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs';
import { Platform } from 'ionic-angular/platform/platform';


@IonicPage()
@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.html',
})
export class StatisticsPage {

  connected$: Subscription;
  disconnected$: Subscription;
  timeperiod$: Subscription;
  all$: Subscription;

  @ViewChild(Content) content: Content;

   isOnline: boolean = true;

   ready = false;
   statistics: {  statistic: string, goal: string, value: number }[] = [];
   doughnutChartLabels:string[] = [];
   doughnutChartData:number[] = [];
   doughnutChartType:string = 'doughnut';

   fetchType = 'all'

   allSelected: boolean = true;
   weekSelected: boolean = false;
   twoWeekSelected: boolean = false;

  constructor(private statisticsProvider: StatisticsProvider, private loaderCtrl:LoadingController, private alertCtrl: AlertController, private network: Network, private toastCtrl: ToastController, private platform: Platform) {
  }

  ionViewDidEnter(){
    this.watchNetwork();
  }

  ionViewDidLoad(){
    this.fetchData();
  }

  private fetchData(){
    if(this.isOnline){
      this.clearData();
      this.ready = false;
      if(this.fetchType ==='all'){
        this.getAllData(); 
      } else{
        this.getTimePeriodData();
      } 
    } else{
      this.toastCtrl.create({
          message: `You are currently offline, unable to retrieve results`,
          duration: 2000
      }).present();
    }
   
   
  }

  private getTimePeriodData(){

    let data = new Date();
    let fromDate = new Date()
    let toDate = new Date()

    if(this.fetchType ==='last week'){
        fromDate.setDate(data.getDate() - 7);
    } else if(this.fetchType ==='two weeks'){
        fromDate.setDate(data.getDate() - 14);
    }

    toDate.setDate(data.getDate());

    let from: string  = fromDate.toISOString();
    let to: string = toDate.toISOString();

    let loader = this.loaderCtrl.create({
      content: `Loading Statistics`,
      showBackdrop: true
    })
    loader.present();
    
   this.timeperiod$ = this.statisticsProvider.getStatisticsPeriod(from,to).subscribe((data: StatisticsDTO) => {
      console.log(data);

      if(data.hasOwnProperty('totalGames')){
        this.statistics.push({statistic: 'Total Games Played', goal:'Number Of Games', value: data.totalGames})
      }
      for(let key in data){
        for(let prop in data[key]){
          if(key !== 'goalsAndGameCount'){
            this.statistics.push({statistic: key, goal:prop, value: data[key][prop]});
          } else{
             // 'prop' is the goal from the server
              this.doughnutChartLabels.push(prop);
              this.doughnutChartData.push(data[key][prop])
          } 
        }
      }
      this.ready = true;

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
      content: `Loading Statistics`,
      showBackdrop: true
    })
    loader.present();
   this.all$ = this.statisticsProvider.getStatistics().subscribe((data: StatisticsDTO) => {
      console.log(data);

      if(data.hasOwnProperty('totalGames')){
        this.statistics.push({statistic: 'Total Games Played', goal:'Number Of Games', value: data.totalGames})
      }
      for(let key in data){
        for(let prop in data[key]){
          if(key !== 'goalsAndGameCount'){
            this.statistics.push({statistic: key, goal:prop, value: data[key][prop]});
          } else{
             // 'prop' is the goal from the server
              this.doughnutChartLabels.push(prop);
              this.doughnutChartData.push(data[key][prop])
          } 
        }
      }
      this.ready = true;

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

  options(){
    let alert = this.alertCtrl.create();
    alert.setTitle('Date Range');

    alert.addInput({
      type: 'radio',
      label: 'Show All',
      checked: this.allSelected,
      value: 'all'
    });

    alert.addInput({
      type: 'radio',
      label: 'Last Week',
      checked: this.weekSelected,
      value: 'last week'
    });

    alert.addInput({
      type: 'radio',
      label: 'Last Two Weeks',
      checked: this.twoWeekSelected,
      value: 'two weeks'
    });


    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: (data: any) => {
          if(data === 'all'){
              this.fetchType = 'all';
              this.allSelected = true;
              this.weekSelected = false;
              this.twoWeekSelected = false;
          } else if(data === 'last week'){
              this.fetchType = 'last week';
              this.allSelected = false;
              this.weekSelected = true;
              this.twoWeekSelected = false;
          } else{
              this.fetchType = 'two weeks';
              this.allSelected = false;
              this.weekSelected = false;
              this.twoWeekSelected = true;
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
    }
    if(this.disconnected$ !== undefined){
      this.disconnected$.unsubscribe();
    }
    if(this.all$ !== undefined){
      this.all$.unsubscribe();
    }
    if(this.timeperiod$ !== undefined){
      this.timeperiod$.unsubscribe();
    }
  }


  watchNetwork(){
    if(this.platform.is('android') || this.platform.is('ios')){
      this.platform.ready().then(() => {
        setTimeout(() => {
            this.disconnected$ = this.network.onDisconnect().subscribe(() =>{
              this.isOnline = false;
              this.toastCtrl.create({
                  message: `You are offline`,
                  duration: 2000
              }).present();
          });
          this.connected$ = this.network.onConnect().subscribe(data =>{
            this.isOnline = true;
            this.alertCtrl.create({
              title: `Online`,
              message: `You are back online, would like to retrieve results?`,
              buttons: [
                {
                  text: `Yes`,
                  handler: () => {
                    this.fetchData();
                  }
                },
                {
                  text: `No`,
                  handler: () => {
                    this.toastCtrl.create({
                      message: `Action Cancelled`,
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



