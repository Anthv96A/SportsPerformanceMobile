import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Response } from '@angular/http/src/static_response';
import { URLS } from '../../assets/server.link';
import { StatisticsDTO } from '../../models/statisticsDTO.model';



@Injectable()
export class StatisticsProvider {

  private url;

  constructor(public http: Http, private urls: URLS) {
    this.url = this.urls.determineURL();
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.url}/stats/all`).map(this.extractData).catch(this.extractError);
  }
  getStatisticsPeriod(from:string, to:string): Observable<any> {
    return this.http.get(`${this.url}/stats/week/${from}/${to}`).map(this.extractData).catch(this.extractError);
  }
  private extractData = (response: Response) => {
      return <StatisticsDTO> response.json();
  }
  private extractError = (error: Response) => {
      return Observable.throw(error.json());
  }
}



