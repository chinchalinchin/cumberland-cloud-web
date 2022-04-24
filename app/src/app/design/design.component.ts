import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnimationControl, AnimationPeriods, Animations, AnimationTriggers, FadeStates, ScaleStates } from 'src/animations';
import { MetaService } from 'src/services/meta.service';
import { ChipConfig, TOOL_CHIPS } from '../app.config';

enum Phases{
  none="none", splash="splash", design="design", develop="develop", deploy="deploy", deliver="deliver", done="done"
}
enum Splash{
  untouched="untouched", touched="touched"
}

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: [
    './css/design.component.css', 
    './css/design.component.desktop.css', 
    './css/design.component.mobile.css'
  ],
  animations: [
    Animations.getScaleTrigger(1),
    Animations.getManualScaleTrigger(1.15),
    Animations.getManualScaleTrigger(1.10, 'slow', AnimationPeriods.medium),
    Animations.getManualFadeTrigger(),
  ]
})
export class DesignComponent implements OnInit{
  public phases: any = Phases;
  public phase: Phases = Phases.none;
  public splashes: any = Splash;
  public splash: Splash = Splash.untouched;
  public oscillating: boolean = false;
  public oscillations: number = 0;
  public lured: boolean = false;
  public screenSize: string = '';
  public tools: ChipConfig[] = TOOL_CHIPS;
  public phaseIcons : any[] = [
    ['xd', 'gimp', 'drawio'],
    ['typescript', 'python', 'angular', 'django'],
    ['docker', 'cloudfront', 's3', 'lambda', 'apigateway']
  ]
  public splashLines1FadeCntl: AnimationControl[] = [
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade)
  ];
  public splashLines2FadeCntl: AnimationControl[] = [
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade)
  ];
  public designLinesFadeCntl: AnimationControl[] = [
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade)
  ];
  public developLinesFadeCntl: AnimationControl[] = [
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade)
  ];
  public deployLinesFadeCntl: AnimationControl[] = [
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade)
  ];
  public deliverLinesFadeCntl: AnimationControl[] = [
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade)
  ];
  public doneLinesFadeCntl: AnimationControl[] = [
    new AnimationControl(AnimationTriggers.cntl_fade),
    new AnimationControl(AnimationTriggers.cntl_fade),
  ];
  public splashSrcFadeCntl: AnimationControl = new AnimationControl(AnimationTriggers.cntl_fade);
  public lureScaleCntl: AnimationControl = new AnimationControl(AnimationTriggers.cntl_scale);

  constructor(private meta: MetaService,
              public dialog: MatDialog) {
    this.meta.mediaBreakpoint.subscribe((size: string)=>{
      this.screenSize = size;
    });
    this.splashLines1FadeCntl
      .concat(this.splashLines2FadeCntl)
      .concat(this.designLinesFadeCntl)
      .concat(this.developLinesFadeCntl)
      .concat(this.deployLinesFadeCntl)
      .concat(this.deliverLinesFadeCntl)
        .forEach((cntl:AnimationControl)=>{
          cntl.animate();
        });
   }

  ngOnInit(){
    this.splashLines1FadeCntl.forEach((cntl: AnimationControl, ind: number)=>{
      setTimeout(()=>{
        cntl.prime();
        if(ind===this.splashLines1FadeCntl.length - 1){
          setTimeout(()=>{
            this.phase = Phases.splash;
            setTimeout(()=>{
              this.oscillateLure();
              this.oscillating = true;
            }, AnimationPeriods.medium*1000);
          }, AnimationPeriods.medium*1000);
        }
      }, AnimationPeriods.medium*1000*ind);
    })
  }

  public mobileMode(): boolean{
    return this.screenSize == 'xs' || this.screenSize == 'sm' || this.screenSize == 'md';
  }

  public isChipDisabled(chipIcon: string): boolean{
    switch(this.phase){
      case Phases.design:
        return !this.phaseIcons[0].includes(chipIcon);
      case Phases.develop:
        return !this.phaseIcons[1].includes(chipIcon);
      case Phases.deploy:
        return !this.phaseIcons[2].includes(chipIcon);
      case Phases.deliver:
        return false;
      case Phases.done:
        return false;
      default:
        return true;
    }
  }

  public lureOscillated(){ return this.lureScaleCntl.state === ScaleStates.scale; }
  
  public oscillateLure(){
    if(this.lureScaleCntl.state === ScaleStates.normal){
      this.oscillations++;
      this.lureScaleCntl.animate();
    }
    else if(this.lureScaleCntl.state === ScaleStates.scale){
      this.lureScaleCntl.prime();
    }
    if(!this.lured){
      setTimeout(()=>{
        this.oscillateLure();
      }, AnimationPeriods.medium*1000)
    }
  }

  public phasedIn(phase: Phases, strict: boolean = false): boolean{
    switch(this.phase){
      case Phases.none:
        return phase === Phases.none;
      case Phases.splash:
        if(strict) return phase === Phases.splash;
        return [Phases.splash, Phases.none].includes(phase);
      case Phases.design:
        return phase === Phases.design;
      case Phases.develop:
        if(strict) return phase === Phases.develop;
        return [Phases.design, Phases.develop].includes(phase);
      case Phases.deploy:
        return phase === Phases.deploy;
      case Phases.deliver:
        if(strict) return phase === Phases.deliver;
        return [Phases.deploy, Phases.deliver].includes(phase);
      case Phases.done:
        return [Phases.design, Phases.develop, Phases.deploy, Phases.deliver].includes(phase);
      default:
        return false
    }
  }

  public incrementPhase(): void{
    switch(this.phase){
      case Phases.none:
        this.phase = Phases.splash;
        break;
      case Phases.splash:
        this.phase = Phases.design;
        setTimeout(()=>{
          this.designLinesFadeCntl.forEach((cntl:AnimationControl, ind: number)=>{
            setTimeout(()=>{
              cntl.prime();
            }, AnimationPeriods.medium*1500*ind)
          });
        }, AnimationPeriods.medium*1000);
        break;
      case Phases.design:
        this.designLinesFadeCntl.forEach((cntl:AnimationControl)=>{
          cntl.animate();
        });
        this.phase = Phases.develop;
        setTimeout(()=>{
          this.developLinesFadeCntl.forEach((cntl:AnimationControl, ind: number)=>{
            setTimeout(()=>{
              cntl.prime();
            }, AnimationPeriods.medium*1500*ind)
          });
        }, AnimationPeriods.medium*1000);
        break;
      case Phases.develop:
        this.developLinesFadeCntl.forEach((cntl:AnimationControl)=>{
          cntl.animate();
        })
        this.phase = Phases.deploy;
        setTimeout(()=>{
          this.deployLinesFadeCntl.forEach((cntl:AnimationControl, ind: number)=>{
            setTimeout(()=>{
                cntl.prime();
            }, AnimationPeriods.medium*1500*ind)
          })
        }, AnimationPeriods.medium*1000);
        break;
      case Phases.deploy:
        this.deployLinesFadeCntl.forEach((cntl:AnimationControl)=>{
          cntl.animate();
        });
        this.phase = Phases.deliver;
        setTimeout(()=>{
          this.deliverLinesFadeCntl.forEach((cntl:AnimationControl, ind:number)=>{
            setTimeout(()=>{
              cntl.prime();
            }, AnimationPeriods.medium*1500*ind);
          })
        }, AnimationPeriods.medium*1000);
        break;
      case Phases.deliver:
        this.deliverLinesFadeCntl.forEach((cntl:AnimationControl)=>{
          cntl.animate();
        });
        this.phase = Phases.done;
    }
  }

  public decrementPhase(): void{
    switch(this.phase){
      case Phases.splash:
        this.phase = Phases.none;
        break;
      case Phases.design:
        this.phase = Phases.splash;
        break;
      case Phases.develop:
        this.developLinesFadeCntl.forEach((cntl:AnimationControl)=>{
          cntl.animate();
        });
        this.phase = Phases.design;
        setTimeout(()=>{
          this.designLinesFadeCntl.forEach((cntl:AnimationControl, ind: number)=>{
            setTimeout(()=>{
              cntl.prime();
            }, AnimationPeriods.medium*1500*ind)
          });
        }, AnimationPeriods.medium*1000);
        break;
      case Phases.deploy:
        this.deployLinesFadeCntl.forEach((cntl:AnimationControl)=>{
          cntl.animate();
        });
        this.phase = Phases.develop;
        setTimeout(()=>{
          this.developLinesFadeCntl.forEach((cntl:AnimationControl, ind: number)=>{
            setTimeout(()=>{
              cntl.prime();
            }, AnimationPeriods.medium*1500*ind)
          });
        }, AnimationPeriods.medium*1000);
        break;
      case Phases.deliver:
        this.deliverLinesFadeCntl.forEach((cntl:AnimationControl)=>{
          cntl.animate();
        })
        this.phase = Phases.deploy;
        setTimeout(()=>{
          this.deployLinesFadeCntl.forEach((cntl:AnimationControl, ind:number)=>{
            setTimeout(()=>{
              cntl.prime();
            }, AnimationPeriods.medium*1500*ind)
          });
        }, AnimationPeriods.medium*1000);
        break;
      case Phases.done:
        this.phase = Phases.deliver;
        break;
    }
  }

  public touchSplash(): void{ 
    if(this.splash === Splash.untouched && this.lured){
      this.splashSrcFadeCntl.animate();
      setTimeout(()=>{
        this.splash = Splash.touched; 
        setTimeout(()=>{
          this.splashSrcFadeCntl.prime();
        }, AnimationPeriods.medium*500)
        setTimeout(()=>{
          this.splashLines2FadeCntl.forEach((cntl: AnimationControl, ind: number)=>{
            let inc: number;
            if(ind===0){ inc= 750; }
            else{ inc = 1250; }
            setTimeout(()=>{
              cntl.prime();
            }, AnimationPeriods.medium*inc*ind);
          })
        }, AnimationPeriods.medium*1000)
      }, AnimationPeriods.medium*1000)
    }
  }

  public splashSrc(): string{
    switch(this.splash){
      case Splash.untouched:
        return "/assets/imgs/separated.jpg";
      case Splash.touched:
        return "/assets/imgs/cloud_tunnel.jpg";
      default:
        return "/assets/imgs/separated.jpg";
    }
  }

  public lure(){ this.lured = true; }
}
