import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  menuOpen=false;
  faBars = faBars;

  constructor(public authService:AuthService) {
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
