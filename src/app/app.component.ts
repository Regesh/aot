import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  constructor(){
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", ()=>{});
    oReq.open("GET", "https://randomuser.me/api/?results=50");
    oReq.send();
  }
}
