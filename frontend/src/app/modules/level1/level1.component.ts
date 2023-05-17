import { Component, OnInit } from '@angular/core';
import { Scouters } from '../../scouters';
import { MatchScoutingL1 } from '../../matchScoutingL1';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder } from '@angular/forms';
import { Action } from 'rxjs/internal/scheduler/Action';



@Component({
  selector: 'app-level1',
  templateUrl: './level1.component.html',
  styleUrls: ['./level1.component.scss']
})
export class Level1Component implements OnInit {



  apiScouters: Scouters[] = [];
  apiMatchL1: MatchScoutingL1[] = [];
  apiMatchL1_filter: MatchScoutingL1[] = [];
  scouter: number = 0;
  orientation: string="show"; //show for norm, hide for invert
  darkmode: boolean=false;
  stage: number=0; //variable to keep track of what is currently being displayed
  numberBox: number=6; //static value for total number of boxes - 1
  nodePositions:number[] = [0, 0, 0, 0]; //array of positions of selected nodes
  nodesSelected: number=0; 

  apiStoreL1: MatchScoutingL1[] = [];
  alliance: number = -1;
  online: number = 1;
  onlineText: string = "OnLine";

  missing: number[] = [];
  missing_return: number = 0;


  constructor(private apiService: ApiService, private formBuilder: FormBuilder) {

    this.apiMatchL1_filter = [];
    this.apiMatchL1 = [];
    
    this.apiService.MatchL1Replay.subscribe(match => {
      this.apiMatchL1 = match;
      this.regenerateFilter();
    });


    this.apiService.ScouterReplay.subscribe(types => {
      this.apiScouters = types;
    });


  }

  nodeSelect(node: number){
    if (this.nodesSelected < 4 || this.nodePositions.includes(node)){ //if the amount of nodes selected is less than max or if the node is already selected
        if (this.nodePositions.includes(node)){ //if the node is already selected
            for (var i = 0; i < this.nodePositions.length; i++){
                if (this.nodePositions[i]==node){
                    this.nodePositions[i]=0;
                    this.nodesSelected--;
                    break;
                }
            } 
        } else { //if the node has not been selected and total ndoes selected is less than max
            for (var i = 0; i < this.nodePositions.length; i++){
                if (this.nodePositions[i]==0){
                    this.nodePositions[i]=node;
                    this.nodesSelected++;
                    break;
                }
            }
        }
    } else { //if max amount is selected
        alert("Please select less than 4 nodes at any one time!");
    }
  }
  getNodeClass(node: number){
    if (this.nodePositions.includes(node)){
        return "nodeSelected";
    } else {
        return "show";
    }
  }

  ngOnInit(): void { 
    this.scouter = Number(localStorage.getItem('scouter')) || -1;
    this.alliance = Number(localStorage.getItem('alliance')) || -1;
    if (localStorage.getItem('orientation')=="L"){
        this.orientation = "hide";
    } else {
        this.orientation = "show";
    }
    console.log("Alliance Station: " + this.alliance);
    // Get Level 1 records specific to alliance station 
    if (this.alliance == 7) {
        this.apiService.getLevel1Review();
    } else {
        this.apiService.getLevel1Records();
    }
    // Get orientation

  }

  setDarkMode(){
    if (this.darkmode) {
        this.darkmode = false;
    } else {
        this.darkmode = true;
    }
  }

  getDarkMode(){
    if (this.darkmode){
        return "darkMode";
    } else {
        return "lightMode";
    }
  }

  ngOnChanges() {
    this.regenerateFilter();
  }

  select(scouterID: number) {
      this.scouter = scouterID;

      localStorage.setItem('scouter', this.scouter.toString());

      this.regenerateFilter();

  }

  regenerateFilter() {
    console.log("regenerateFilter: Start: ");

    if (this.apiMatchL1) {

      this.apiMatchL1_filter = [];

      // Sort Matches by MatchNum
      this.apiMatchL1.sort((a, b) => a.matchNum - b.matchNum);

      // Filter
      for (const m of this.apiMatchL1) {

        if (this.alliance == 7) { // Reviewer
            if (m.scoutingStatus == 2) { 
                //Break out of for loop once the first review record is found
                m.scouterID = this.scouter;
                this.apiMatchL1_filter.push(m);
                break;
              }
        }
        else {
            if (m.scoutingStatus === null ) { 
                //Break out of for loop once the first unscouted record is found
                m.scouterID = this.scouter;
                this.apiMatchL1_filter.push(m);
                break;
              }
        }
        

       } 
    } else {
      this.apiMatchL1_filter = [];
    }
  }

  getLetterColor(team: string){
    for (let m of this.apiMatchL1_filter){
        if (team==m.red1 || team==m.red2 || team==m.red3){
            return "redLetter";
        } else if (team==m.blue1 || team==m.blue2 || team==m.blue3){
            return "blueLetter";
        }
    }
    return "broken";
  }

  getColor(team: string){
    for (let m of this.apiMatchL1_filter){
        if (team==m.red1 || team==m.red2 || team==m.red3){
            return "red";
        } else if (team==m.blue1 || team==m.blue2 || team==m.blue3){
            return "blue";
        }
    }
    return "broken";
  }

  showPre(type: string){
    for (let m of this.apiMatchL1_filter){
        if (this.getColor(m.team)=="red" && type=="RNorm" && this.orientation=="show"){
            return "show";
        } else if (this.getColor(m.team)=="red" && type=="RInv" && this.orientation=="hide"){
            return "show";
        } else if (this.getColor(m.team)=="blue" && type=="BNorm" && this.orientation=="show"){
            return "show";
        } else if (this.getColor(m.team)=="blue" && type=="BInv" && this.orientation=="hide"){
            return "show";
        } else {
            return "hide";
        }
    }
    return "hide";
  }

  getYesNoClass(value: number, actual: number){
    if(value == actual && value == 1) {
        return 'button_green';
      } else if (value == actual && value == 0) {
        return 'button_red';
      } else {
        return 'button_rank';
      }
  }

  getYesNoClassOpp(value: number, actual: number){
    if(value == actual && value == 1) {
        return 'button_red';
      } else if (value == actual && value == 0) {
        return 'button_green';
      } else {
        return 'button_rank';
      }
  }

  getRankClass(value: number, acutal: number){
    if(value == acutal) {
        return 'button_green';
      } else {
        return 'button_rank';
      }
  }

  numPad(numb: string){
    for(let m of this.apiMatchL1_filter){
        console.log("ramp start" + m.rampStartTime);
        if (m.rampStartTime < 100 || m.rampStartTime==null){
            if(m.rampStartTime==null){
                m.rampStartTime=Number(numb);
            } else {
                m.rampStartTime = Number(m.rampStartTime.toString() + numb);
            }
            this.updateNumPad();
        } else {
            alert("Please do not exceed 999 seconds")
        }
    }
  }

  remNumPad(){
    for(let m of this.apiMatchL1_filter){
        if(m.rampStartTime){
            m.rampStartTime = Number(m.rampStartTime.toString().substring(0, m.rampStartTime.toString().length - 1));
        } 
        this.updateNumPad();
    }
  }

  show(num: string){
    if (num=="normal"){
        if(this.orientation=="show"){
            return "show";
        } else if (this.orientation=="hide") {
            return "hide";
        }
    }
    if (num=="inverted"){
        if(this.orientation=="show"){
            return "hide";
        } else if (this.orientation=="hide") {
            return "show";
        }
    }
    return "show";
  }

  showHide(){
    if(this.orientation=="show"){
        this.orientation="hide";
    } else {
        this.orientation="show";
    }
  }

  updateNumPad(){
    for(let m of this.apiMatchL1_filter){
        const box: HTMLElement = document.getElementById("numPadBox") as HTMLElement;
        box!.innerHTML = m.rampStartTime.toString();
    }
  }

  nextBox(matchID: number){ //increment stage by one till a max and update boxes

    // Check for completed fields if moving to next page
    if (this.checkRequired(this.stage,matchID) > 0) {
        return;
    } 

    this.stage++;
    if (this.stage > this.numberBox){
        this.stage = this.numberBox;
    }
    console.log(this.stage);
    this.updateBox(0);
  }

  lastBox(){ //de increment stage by one till 0 and updates boxes
    this.stage--;
    if (this.stage < 0){
        this.stage = 0;
    }
    this.updateBox(0);
  }

  returnBox(){
    this.stage = 5;
    this.updateBox(0);
  } 

  checkRequired(display: number, record: number) {
    this.missing = [];
    this.missing_return = 0;
    for (const x of this.apiMatchL1) {
      if (x.matchScoutingID == record) {
        // Checking values on Page 1
        if (display == 0) {
          if (x.scouterID < 1) {
            this.missing.push(1);
            this.missing_return = 1;
          }
        }
        // Checking values on Page 2 (PreGame)
        else if (display == 1) {
          if (x.preStartPos === null) {
            this.missing.push(11);
            this.missing_return = 1;
          }
          if (x.preLoad === null) {
            this.missing.push(12);
            this.missing_return = 1;
          }
          if (x.preNoShow === null) {
            this.missing.push(13);
            this.missing_return = 1;
          }

          
        }
        // Checking values on Page 3 (Auto)
        else if (display == 2) {
          if (x.autoMB === null) {
            this.missing.push(21);
            this.missing_return = 1;
          }
          if (x.autoRamp === null) {
            this.missing.push(22);
            this.missing_return = 1;
          }
          if (x.autoPen === null) {
            this.missing.push(23);
            this.missing_return = 1;
          }
        }
        // Checking values on Page 5 (Ramp)
        else if (display == 4) {
          if (x.ramp === null) {
            this.missing.push(41);
            this.missing_return = 1;
          }
        }
        // Checking values on Page 6 (Post Game)
        else if (display == 5) {
            if (x.postSubsystemBroke === null) {
                this.missing.push(51);
                this.missing_return = 1;
            }
            if (x.postBrokeDown === null) {
                this.missing.push(52);
                this.missing_return = 1;
            }
            if (x.postTippedOver === null) {
                this.missing.push(53);
                this.missing_return = 1;
            }
            if (x.teleWasObstructed === null) {
                this.missing.push(54);
                this.missing_return = 1;
            }
            if (x.commentGen === "") {
                this.missing.push(55);
                this.missing_return = 1;
            }
            // if (x.postGroundPickup === null) {
            //     this.missing.push(56);
            //     this.missing_return = 1;
            // }
            // if (x.postGoodPartner === null) {
            //     this.missing.push(57);
            //     this.missing_return = 1;
            // }
        }
      }

    }
    return this.missing_return;
  }

getAlertClass(element: number) {
  if (this.missing.includes(element)) {
    return 'td_alert';
  } else {
    return 'td_normal';
  }
}




  save( matchScoutingL1ID: number, status: number) {

    // If Review is selected, have scouter confirm
    if (status == 2) {
        const response = confirm("Are you sure you want to post this match for review? \
(This should only be done if you made major error, like watching the wrong robot.)");
        if (!response) {
          return;
        }
    }


    
    for(let m of this.apiMatchL1_filter){ //set database values
        

        console.log("Got to autoScore assignment");
        console.log("nodes:  [" + this.nodePositions[0] +"," + this.nodePositions[1] +"," + this.nodePositions[2] +"," + this.nodePositions[3] +"]");
        m.autoScore1 = this.nodePositions[0];
        m.autoScore2 = this.nodePositions[1];
        m.autoScore3 = this.nodePositions[2];
        m.autoScore4 = this.nodePositions[3];
        console.log("values: ["+m.autoScore1+","+m.autoScore2+","+m.autoScore3+","+m.autoScore4+"]");
    }

    //reset values
    this.nodePositions=[0, 0, 0, 0];
    this.nodesSelected=0;
  
    // Update status in apiMatch record
    for (const x of this.apiMatchL1) {

        if (x.matchScoutingID == matchScoutingL1ID ) { 
            if (status == 1 && this.alliance == 7) {
                // Set Status to 3 - complete after review
                x.scoutingStatus = 3;
            } else {
                // Set Status to 1: complete or 2: review
                x.scoutingStatus = status;
            }

            // console.log("Got to autoScore assignment");
            // console.log("nodes:  [" + this.nodePositions[0] +"," + this.nodePositions[1] +"," + this.nodePositions[2] +"," + this.nodePositions[3] +"]");
            // x.autoScore1 = this.nodePositions[0];
            // x.autoScore2 = this.nodePositions[1];
            // x.autoScore3 = this.nodePositions[2];
            // x.autoScore4 = this.nodePositions[3];
            // console.log("values: [" + x.autoScore1+"," + x.autoScore2+"," + x.autoScore3+"," + x.autoScore4+"]");
        }


    } 

    if (!localStorage.getItem('StoredL1')) {
    console.log("No Level 1 Records in Local Storage");
    } else {
      // Get responses from memory
      this.apiService.StoredL1Replay.next(JSON.parse(localStorage.getItem('StoredL1')!) as MatchScoutingL1[]);
  
      //######################################################
      // Start - Console Log Dump
      
      // Loop through to print localStorage
      this.apiService.StoredL1Replay.subscribe(match => {
        this.apiStoreL1 = match;
      });
  
      for (const q of this.apiStoreL1) {
        console.log("Match: " + q.matchNum + ", Team: " + q.team + ", Status: " + q.scoutingStatus);
      }
      // End - Console Log Dump
      //######################################################
  
    }
    
      for (const o of this.apiMatchL1_filter) {
        this.apiStoreL1.push(o);
      }
  
      if (this.online == 1) {
        // Write record to output filter  (Will need to move this to the "refresh" funtion later)
        this.apiService.saveLevel1Data(this.apiStoreL1);
      }

  
      // Write record to Local Storage
      this.apiService.StoredL1Replay.next(this.apiStoreL1 as MatchScoutingL1[]);
      localStorage.setItem('StoredL1', JSON.stringify(this.apiStoreL1));
  
      // run regenerate filter
      this.regenerateFilter();
  
      // Set Display back to 1
      this.stage = 0;

      //reset node array
      for (var i = 0; i < this.nodePositions.length; i++){
        this.nodePositions[i]=0;
      }
  }

  onlineToggle(value: number) {
    if(value == 1) {
        this.online = 0;
        this.onlineText = "Offline";
    } else {
        this.online = 1;
        this.onlineText = "Online";
    }
  }

  getOnlineClass() {
    if(this.online == 0) {
        return 'button_offline';
    } else {
        return 'button_online';
    }
  }

  updateBox(dns: number){

  // Confirm User wants to Select Did Not Show
  if (dns == 1) {
    const response = confirm("Selecting Team Did Not Show will bring you to the save page.");
    if (!response) {
        this.stage = 1;
        return;
    }
  }



  var homeBox = document.getElementById("home"); //get each box object
  var preBox = document.getElementById("pre");
  var autoBox = document.getElementById("auto");
  var teleBox = document.getElementById("tele");
  var endBox = document.getElementById("end");
  var postBox = document.getElementById("post");
  var finalBox = document.getElementById("final");
  var header = document.getElementById("header");
  var headerText = document.getElementById("headerText");
  homeBox!.style.display = "none"; //set each box invisible
  preBox!.style.display = "none";
  autoBox!.style.display = "none";
  teleBox!.style.display = "none"; 
  endBox!.style.display = "none";
  postBox!.style.display = "none";
  finalBox!.style.display = "none";
  if (this.stage == 0){ //make one box visible
      homeBox!.style.display = "block";
      header!.style.display = "none"; //hide header
  } else if(this.stage == 1){
      preBox!.style.display = "block";
      header!.style.display = "block"; //show header
      headerText!.innerHTML = "Pre Game"; //set header text
  } else if(this.stage == 2){
      autoBox!.style.display = "block";
      headerText!.innerHTML = "Auto";
  } else if(this.stage == 3){
      teleBox!.style.display = "block";
      headerText!.innerHTML = "Tele";
  } else if(this.stage == 4){
      endBox!.style.display = "block";
      headerText!.innerHTML = "End Game";
  } else if(this.stage == 5){
      postBox!.style.display = "block";
      header!.style.display = "block"; //show header if returning from last page
      headerText!.innerHTML = "Post Game";
  } else if(this.stage == 6){
      finalBox!.style.display = "block";
      //header!.style.display = "none"; //hide header
      header!.style.display = "block"; 
      headerText!.innerHTML = "Save";
  }
  }

  

  pickupSelection(loc: number){
    for (let m of this.apiMatchL1_filter){
        if (loc==1){
            if(m.autoGamePiece1==1){
                m.autoGamePiece1=0;
            } else {
                m.autoGamePiece1=1;
            }
        }
        if (loc==2){
            if(m.autoGamePiece2==1){
                m.autoGamePiece2=0;
            } else {
                m.autoGamePiece2=1;
            }
        }
        if (loc==3){
            if(m.autoGamePiece3==1){
                m.autoGamePiece3=0;
            } else {
                m.autoGamePiece3=1;
            }
        }
        if (loc==4){
            if(m.autoGamePiece4==1){
                m.autoGamePiece4=0;
            } else {
                m.autoGamePiece4=1;
            }
        }
    }
  }
  pickupClass(loc: number){
    for (let m of this.apiMatchL1_filter){
        if (loc==1){
            if(m.autoGamePiece1==0){
                return "pickup";
            } else {
                return "pickedup";
            }
        }
        else if (loc==2){
            if(m.autoGamePiece2==0){
                return "pickup";
            } else {
                return "pickedup";
            }
        }
        else if (loc==3){
            if(m.autoGamePiece3==0){
                return "pickup";
            } else {
                return "pickedup";
            }
        }
        else if (loc==4){
            if(m.autoGamePiece4==0){
                return "pickup";
            } else {
                return "pickedup";
            }
        }
    }
    return "blue";
  }
}
