import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, LoadingController, Content, AlertController } from 'ionic-angular';
import { Chart } from 'chart.js';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { StatisticsDTO } from '../../models/statisticsDTO.model';


@IonicPage()
@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.html',
})
export class StatisticsPage {


  @ViewChild(Content) content: Content;

   ready = false;
   statistics: {  statistic: string, goal: string, value: number }[] = [];
   doughnutChartLabels:string[] = [];
   doughnutChartData:number[] = [];
   doughnutChartType:string = 'doughnut';

   fetchType = 'all'

   allSelected: boolean = true;
   weekSelected: boolean = false;
   twoWeekSelected: boolean = false;

  constructor(public navCtrl: NavController, private statisticsProvider: StatisticsProvider, private loaderCtrl:LoadingController, private alertCtrl: AlertController) {
  }

  ionViewDidLoad(){
    this.fetchData();
  }

  private fetchData(){
    this.clearData();
    this.ready = false;
    if(this.fetchType ==='all'){
      this.getAllData(); 
    } else{
      this.getTimePeriodData();
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
    
   this.statisticsProvider.getStatisticsPeriod(from,to).subscribe((data: StatisticsDTO) => {
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
   this.statisticsProvider.getStatistics().subscribe((data: StatisticsDTO) => {
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


 }



