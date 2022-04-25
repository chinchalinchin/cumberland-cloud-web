import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Animations } from 'src/animations';
import { ADDON_PRICING_CONFIG, ANALYTICS_PRICING_CONFIG, CORE_PRICING_CONFIG, Pricing } from '../app.config';

enum ButtonStyle{
  primary="primary", accent="accent", none=""
}

enum PricingGroups{
  core="core",addon="addon",analytics="analytics"
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
  animations: [
    Animations.getExpandTrigger('100%', 'full'),
    Animations.getExpandTrigger('67.5%', 'popup')
  ]
})
export class PricingComponent{
  public focusing: boolean = false;
  public focus?: PricingGroups;
  public calculated: boolean = false;
  public coreConfig : Pricing[] = CORE_PRICING_CONFIG;
  public addOnConfig: Pricing[] = ADDON_PRICING_CONFIG;
  public analyticsConfig: Pricing[] = ANALYTICS_PRICING_CONFIG;
  public enabledConfig: Pricing[] = [];
  public buttonStyle: ButtonStyle = ButtonStyle.none;
  public pricingGroups: any = PricingGroups; 
  public coreFormGroup : FormGroup;
  public addOnFormGroup: FormGroup;
  public analyticsFormGroup: FormGroup;

  constructor(private forms: FormBuilder) { 
    this.coreFormGroup = this.forms.group({});
    this.addOnFormGroup = this.forms.group({});
    this.analyticsFormGroup = this.forms.group({});
    this.coreConfig.forEach((conf:Pricing)=>{
      this.coreFormGroup.addControl(conf.key, this.forms.control(false));
    });
    this.addOnConfig.forEach((conf:Pricing)=>{
      this.addOnFormGroup.addControl(conf.key, this.forms.control(false));
    });
    this.analyticsConfig.forEach((conf:Pricing)=>{
      this.analyticsFormGroup.addControl(conf.key, this.forms.control(false));
    });
  }

  private parseEnabledCalculations(): void{
    this.coreConfig.forEach((conf:Pricing)=>{
      if(this.coreFormGroup.controls[conf.key]?.value){
        this.enabledConfig.push(conf);
      }
    });
    this.addOnConfig.forEach((conf:Pricing)=>{
      if(this.addOnFormGroup.controls[conf.key]?.value){
        this.enabledConfig.push(conf);
      }
    });
    this.analyticsConfig.forEach((conf:Pricing)=>{
      if(this.analyticsFormGroup.controls[conf.key]?.value){
        this.enabledConfig.push(conf);
      }
    })
  }

  public groupField(group: PricingGroups, field: string): boolean{
    switch(group){
      case this.pricingGroups.core:
        return this.coreFormGroup.controls[field]?.value;
      case this.pricingGroups.addon:
        return this.addOnFormGroup.controls[field]?.value;
      case this.pricingGroups.analytics:
        return this.analyticsFormGroup.controls[field]?.value;
      default:
        return false;
    }
  }

  public toggleButtonStyle(): void{
    if(this.buttonStyle === ButtonStyle.none) { this.buttonStyle = ButtonStyle.accent; }
    else if(this.buttonStyle === ButtonStyle.accent) { this.buttonStyle = ButtonStyle.none; }
  }

  public focused(group: PricingGroups): boolean{ 
    return group === this.focus; 
  }

  public setFocus(group: PricingGroups): void{ 
    this.focusing = true;
    this.focus = group; 
  }

  public removeFocus(): void{ 
    this.focusing = false;  
    this.focus = undefined; 
  }

  public calculate(): void{
    this.calculated = true;
  }

}
