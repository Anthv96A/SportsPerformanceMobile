import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController } from 'ionic-angular';
import { Chart } from 'chart.js';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { StatisticsDTO } from '../../models/statisticsDTO.model';



@IonicPage()
@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.html',
})
export class StatisticsPage {

  test(){
    this.navCtrl.push('ReviewPage')
  }


   statistics: {  statistic: string, goal: string, value: number }[] = [];



  public doughnutChartLabels:string[] = [
     'Driver:To hit the fairway',
     'Fairway woods: To hit target', 
     'Long Irons: Onto Green',
     'Medium Irons: Onto Green',
     'Short Irons: Onto Green'
    ];
  public doughnutChartData:number[] = [350, 450, 100,30,40];
  public doughnutChartType:string = 'doughnut';

  constructor(public navCtrl: NavController, private statisticsProvider: StatisticsProvider, private loaderCtrl:LoadingController) {
    //   this.statisticsProvider.getStatistics().subscribe((data) =>{
    //     console.log(`Full data object ${data}`);
    //     for(var key in data){
    //       console.log(`Keys for full obj ${key}`);
    //         if(data.hasOwnProperty(key)){
    //           for(let prop in data[key]){
    //               console.log(`${prop}  === ${data[key][prop]} `);
    //               this.statistics.push({statistic: key, goal: prop, value: data[key][prop] })
    //            }
    //         }
    //     }

    //     console.log(this.statistics)
    // })

    // this.statisticsProvider.getStatistics().subscribe((data)=>{
    //     console.log(data);
    //     for(let key in data){
    //         console.log(key);
    //         for(let prop in data[key]){
    //           console.log(data[key][prop])
    //           this.statistics.push({statistic: key, goal: prop, value: data[key][prop] })
    //         }
    //     }
    // })

  
  }

  async ngOnInit(){

    let loader = this.loaderCtrl.create({
      content: `Loading Statistics`,
      showBackdrop: true
    })
    

    loader.present();

    this.statisticsProvider.getStatistics().subscribe((data: StatisticsDTO) => {


      if(data.hasOwnProperty('totalGames')){
        this.statistics.push({statistic: 'Total Games Played', goal:'Number Of Games', value: data.totalGames})
      }
 
      for(let key in data){
        for(let prop in data[key]){
            this.statistics.push({statistic: key, goal:prop, value: data[key][prop]});
        }
      }

      loader.dismiss();
    })

   

   //this.test = this.statisticsProvider.getStatistics();

  //   this.statisticsProvider.getStatistics().subscribe((data)=>{
  //     console.log(data);

  //      for(let key in data){
  //        for(let prop in data[key]){
  //          console.log(data[key][prop])
  //        }
  //      }
       
  // })
  }



  public chartClicked(e:any):void {
    console.log(e);
  }
  
  public chartHovered(e:any):void {
    console.log(e);
  }


 }



