import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { isMobile, isTablet } from 'src/app/utils/deviceDetection';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  showDesktopMenu() {
    return !isMobile() && window.innerWidth > 1024;
  }
  showTabletMenu() {
    return !isMobile() && window.innerWidth > 540 && window.innerWidth <= 1024;
  }
  showMobileMenu() {
    return isMobile() || window.innerWidth <= 540;
  }
  

  menuOpen=false;
  faBars = faBars;

  constructor(public authService:AuthService, private changeDetector:ChangeDetectorRef) {
    window.addEventListener('resize', () => {
      this.changeDetector.detectChanges();
    });
    document.addEventListener('click', (event:Event) => {
      let target = event.target as HTMLElement;
      let clickedNavbar = false;
      do {
        if(target.classList.contains('navbar')) {
          clickedNavbar = true;
          break;
        }
        if(target.parentNode) target = target.parentNode as HTMLElement;
      } while(target.parentNode);
      console.log(clickedNavbar);
      if(!clickedNavbar) this.menuOpen = false;
    });
  }
}
