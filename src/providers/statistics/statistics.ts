import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Game } from '../../models/game.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { Response } from '@angular/http/src/static_response';
import { URL } from '../../assets/server.link';
import { StatisticsDTO } from '../../models/statisticsDTO.model';


@Injectable()
export class StatisticsProvider {

  private url = URL;

  constructor(public http: Http) {}



  getStatistics(): Observable<any> {
    return this.http.get(`${this.url}/stats/all`).map((response: Response) =>{
        return <StatisticsDTO> response.json();
    })
  }


}
