import { Component, Renderer2 } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  AnimationControl,
  Animations,
  AnimationTriggers,
} from 'src/animations';
import { MetaService } from 'src/services/meta.service';
import { SeoService } from 'src/services/seo.service';
import { NavConfig, NAV_CONFIG } from './app.config';
import { SheetComponent } from './sheet/sheet.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [Animations.getManualFoldTrigger('4%')],
})
export class AppComponent {
  public underConstruction: boolean = true;
  public title: String = 'cumberland cloud';
  public selectedNav?: NavConfig;
  public menuDisplayed: boolean = false;
  public sheetDisplayed: boolean = false;
  public menuFoldCntl = new AnimationControl(AnimationTriggers.cntl_expand);
  public pageConfig: NavConfig[] = NAV_CONFIG;
  public navConfig: NavConfig[] = NAV_CONFIG.filter((element) => element.menu);

  public constructor(
    private _bottomSheet: MatBottomSheet,
    private router: Router,
    private renderer: Renderer2,
    private seo: SeoService,
    private meta: MetaService
  ) {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this.menuDisplayed) {
          this.toggleMenu();
        }
        if(this.meta.isServer()){
          let conf = this.findConfigByPath(event.url);
          this.seo.setStaticAtrributes();
          this.seo.setJsonLd(this.renderer, conf?.data ? conf.data : {});
          this.seo.updateTitle(
            conf?.page_title ? conf.page_title : 'The Cumberland Cloud'
          );
          this.seo.updateDescription(
            conf?.page_description
              ? conf.page_description
              : 'A site of earthly delectations.'
          );
          this.seo.updateOgAttributes(event.url);
        }
        this.selectedNav = this.navConfig
          .filter((nav: NavConfig) => nav.path === event.url)
          .pop();
      });
  }

  private findConfigByPath(path: string): NavConfig | undefined {
    return this.pageConfig.filter((nav: NavConfig) => nav.path === path).pop();
  }

  public toggleMenu() {
    if (this.menuDisplayed) {
      this.menuFoldCntl.prime();
    } else {
      this.menuFoldCntl.animate();
    }
    this.menuDisplayed = !this.menuDisplayed;
  }

  public openSheet() {
    this._bottomSheet.open(SheetComponent, {
      ariaLabel: 'Contact Information',
      panelClass: 'sheet',
    });
  }
}
