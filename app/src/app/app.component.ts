import { Component, Renderer2 } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NavigationEnd, Router } from '@angular/router';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { filter } from 'rxjs/operators';
import {
  AnimationControl,
  Animations,
  AnimationTriggers,
} from 'src/animations';
import { ApiResponse, NavConfig } from 'src/models';
import { NAV_CONFIG } from 'src/nav.config';
import { ArticleService } from 'src/services/article.service';
import { MetaService } from 'src/services/meta.service';
import { SeoService } from 'src/services/seo.service';
import { SheetComponent } from './shared/components/sheet/sheet.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [Animations.getManualExpandTrigger('4%')],
})
export class AppComponent {
  public title: String = 'cumberland cloud';
  public selectedNav?: NavConfig;
  public menuDisplayed: boolean = false;
  public sheetDisplayed: boolean = false;
  public overlaid: boolean = false;
  public init: boolean = false;
  public menuExpandCntl = new AnimationControl(AnimationTriggers.cntl_expand);
  public pageConfig!: NavConfig[];
  public navConfig!: NavConfig[];

  public constructor(
    private _bottomSheet: MatBottomSheet,
    private _router: Router,
    private _renderer: Renderer2,
    private _seo: SeoService,
    private _meta: MetaService,
    private _ga: GoogleAnalyticsService,
    private _articles: ArticleService,
  ) {
    this.constructNavigation(()=>{
      this._router.events
        .pipe(filter((event: any) => event instanceof NavigationEnd))
        .subscribe((event) => {
          if (this.menuDisplayed) {
            this.toggleMenu();
          }
          if (this.overlaid) {
            this.overlaid = false;
          }
          if (this._meta.isServer()) {
            let conf = this.findConfigByPath(event.url);
            this._seo.setStaticAtrributes();
            this._seo.setJsonLd(this._renderer, conf?.data ? conf.data : {});
            this._seo.updateTitle(
              conf?.page_title ? conf.page_title : 'The Cumberland Cloud'
            );
            this._seo.updateDescription(
              conf?.page_description
                ? conf.page_description
                : 'A site of earthly delectations.'
            );
            this._seo.updateMetaAttributes(conf ? conf.meta : undefined);
          }
          this.selectedNav = this.navConfig
            .filter((nav: NavConfig) => nav.path === event.url)
            .pop();
        });
    });
    

    // TODO: need to pull navconfig from article service and append to existing static nav.
    // best way to do this? want to put as much logic in th service as possible...
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.init = true;
    }, 250);
  }

  private constructNavigation(callback: Function): void {
    this._articles.getFeed().subscribe((data:ApiResponse[])=>{
      this.pageConfig = NAV_CONFIG.concat(
        data.map((element:ApiResponse)=> element.nav_config)
      );
      this.navConfig = this.pageConfig.filter((element: any) => element.menu);
    })
  }

  private findConfigByPath(path: string): NavConfig | undefined {
    return this.pageConfig.filter((nav: NavConfig) => nav.path === path).pop();
  }

  public toggleMenu() {
    if (this.menuDisplayed) {
      this.menuExpandCntl.prime();
      this._ga.event('app', 'menu', 'display');
    } else {
      this.menuExpandCntl.animate();
      this._ga.event('app', 'menu', 'hide');
    }
    this.menuDisplayed = !this.menuDisplayed;
  }

  public openSheet() {
    this._bottomSheet.open(SheetComponent, {
      ariaLabel: 'Contact Information',
      panelClass: 'sheet',
    });
    this._ga.event('app', 'sheet', 'open');
  }

  public overlay(event: any) {
    this.overlaid = event;
  }
}
