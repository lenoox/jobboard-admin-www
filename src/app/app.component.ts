import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HttpClient} from "@angular/common/http";
import {OAuthService} from "angular-oauth2-oidc";
import * as d3 from 'd3';
import {CountJobOfferByLocation} from "./analysis";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  data:any;
  private svg:any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  constructor(private oauthService: OAuthService, private httpClient: HttpClient) { }

  logout() {
    this.oauthService.logOut();
  }

  getData() {
    this.httpClient.get<CountJobOfferByLocation[]>('http://localhost:8181/api/v1/analysis/location', {
      headers: {
        'Authorization': `Bearer ${this.oauthService.getAccessToken()}`
      }
    }).subscribe((result:any) => {
      this.data=result.data;
      const svg = this.createSvg();
      this.drawBars(result.data, result.max);
    });
  }


  ngOnInit(): void {
    this.getData();
  }

  private createSvg(): void {
    this.svg = d3.select("figure#bar")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[], maxValue: number): void {
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.city))
      .padding(0.5);

    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .range([this.height, 0]);

    this.svg.append("g")
      .call(d3.axisLeft(y));

    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: any) => x(d.city))
      .attr("y", (d: any) => y(d.jobOfferCount))
      .attr("width", x.bandwidth())
      .attr("height", (d: any) => this.height - y(d.jobOfferCount))
      .attr("fill", "#009bf8");
  }
}
