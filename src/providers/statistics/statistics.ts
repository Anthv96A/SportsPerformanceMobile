import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Game } from '../../models/game.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { Response } from '@angular/http/src/static_response';
import { URL } from '../../assets/server.link';
import { URLS } from '../../assets/server.link';
import { StatisticsDTO } from '../../models/statisticsDTO.model';



@Injectable()
export class StatisticsProvider {

  private url;

  constructor(public http: Http, private urls: URLS) {
    this.url = this.urls.determineURL();
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.url}/stats/all`).map((response: Response) =>{
        return <StatisticsDTO> response.json();
    })
  }
  getStatisticsPeriod(from:string, to:string): Observable<any> {
    return this.http.get(`${this.url}/stats/week/${from}/${to}`).map((response: Response) =>{
        return <StatisticsDTO> response.json();
    })
  }
}
