// Public/scripts/month-picker.js

class MonthRangePicker {
    constructor() {
      this.minYear = 2000;
      this.maxYear = 2025;
      this.months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      this.monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      this.leftYear = 2024;
      this.rightYear = 2025;
      this.startDate = null;
      this.endDate = null;
      this.input = document.getElementById('monthRange');
      this.dropdown = document.getElementById('pickerDropdown');
      this.overlay = document.getElementById('overlay');
      this.selectedRange = document.getElementById('selectedRange');
      this.confirmBtn = document.getElementById('confirmSelection');
      this.init();
    }
    init(){
      this.input.addEventListener('click',()=>{this.show()});
      this.overlay.addEventListener('click',()=>{this.hide()});
      document.getElementById('prevYear2024').addEventListener('click',()=>this.navYear('left',-1));
      document.getElementById('nextYear2024').addEventListener('click',()=>this.navYear('left',1));
      document.getElementById('prevYear2025').addEventListener('click',()=>this.navYear('right',-1));
      document.getElementById('nextYear2025').addEventListener('click',()=>this.navYear('right',1));
      this.confirmBtn.addEventListener('click',()=>{
        if(this.startDate&&this.endDate){this.updateInput();this.hide();}
      });
      document.querySelectorAll('.preset-btn').forEach(b=>{
        b.addEventListener('click',()=>this.handlePreset(b.dataset.range));
      });
      this.render();
    }
    show(){this.dropdown.classList.add('show');this.overlay.classList.add('show');}
    hide(){this.dropdown.classList.remove('show');this.overlay.classList.remove('show');}
    navYear(side,step){
      if(side==='left'){this.leftYear+=step;if(this.leftYear>=this.rightYear){this.rightYear=this.leftYear+1;}}
      else{this.rightYear+=step;if(this.rightYear<=this.leftYear){this.leftYear=this.rightYear-1;}}
      this.render();
    }
    render(){
      this.renderGrid('left',this.leftYear,'monthGrid2024');
      this.renderGrid('right',this.rightYear,'monthGrid2025');
    }
    renderGrid(side,year,gridId){
      const grid=document.getElementById(gridId);grid.innerHTML='';
      const now=new Date();
      for(let i=0;i<12;i++){
        const b=document.createElement('button');
        b.className='month-btn';b.textContent=this.months[i];
        const d=new Date(year,i,1);
        if(d>now){b.disabled=true;b.style.opacity='0.5';b.style.cursor='not-allowed';}
        this.styleBtn(b,d);
        if(!b.disabled){b.addEventListener('click',()=>this.pick(d));}
        grid.appendChild(b);
      }
    }
    styleBtn(btn,date){
      btn.classList.remove('selected','in-range');
      if(this.startDate&&this.endDate){
        if(this.sameMonth(date,this.startDate)||this.sameMonth(date,this.endDate)){
          btn.classList.add('selected');
        } else if(date>this.startDate&&date<this.endDate){
          btn.classList.add('in-range');
        }
      } else if(this.startDate&&this.sameMonth(date,this.startDate)){
        btn.classList.add('selected');
      }
    }
    pick(date){
      if(!this.startDate||this.endDate||date<this.startDate){
        this.startDate=date;this.endDate=null;
      } else{
        this.endDate=date;
      }
      this.updateSelected();this.render();
    }
    updateSelected(){
      if(this.startDate&&this.endDate){
        const s=this.monthNames[this.startDate.getMonth()]+' '+this.startDate.getFullYear();
        const e=this.monthNames[this.endDate.getMonth()]+' '+this.endDate.getFullYear();
        this.selectedRange.textContent=s+' - '+e;
      } else if(this.startDate){
        const s=this.monthNames[this.startDate.getMonth()]+' '+this.startDate.getFullYear();
        this.selectedRange.textContent=s+' - Select end date';
      } else{
        this.selectedRange.textContent='Select date range';
      }
    }
    updateInput(){
      if(this.startDate&&this.endDate){
        const sm=(this.startDate.getMonth()+1).toString().padStart(2,'0');
        const sy=this.startDate.getFullYear();
        const em=(this.endDate.getMonth()+1).toString().padStart(2,'0');
        const ey=this.endDate.getFullYear();
        this.input.value=`${sm}/${sy} - ${em}/${ey}`;
      }
    }
    handlePreset(r){
      const now=new Date(),y=now.getFullYear(),m=now.getMonth();
      if(r==='this-year'){this.startDate=new Date(y,0,1);this.endDate=new Date(y,m,1);}
      if(r==='last-year'){this.startDate=new Date(y-1,0,1);this.endDate=new Date(y-1,11,1);}
      if(r==='last-6'){this.endDate=new Date(y,m,1);this.startDate=new Date(y,m-5,1);}
      if(r==='last-12'){this.endDate=new Date(y,m,1);this.startDate=new Date(y,m-11,1);}
      this.leftYear=this.startDate.getFullYear();this.rightYear=this.endDate.getFullYear();
      if(this.leftYear===this.rightYear){this.rightYear++;}
      this.updateSelected();this.render();
    }
    sameMonth(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth();}
  }
  document.addEventListener('DOMContentLoaded',()=>new MonthRangePicker());
  