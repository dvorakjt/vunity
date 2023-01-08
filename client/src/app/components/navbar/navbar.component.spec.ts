import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { User } from 'src/app/models/user.model';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { AuthServiceStub } from 'src/app/tests/mocks/AuthServiceStub';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavbarComponent ],
      imports: [FontAwesomeModule],
      providers: [{provide: AuthService, useClass: AuthServiceStub}, {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the desktop menu when showDesktopMenu returns true.', () => {
    spyOn(component, 'showDesktopMenu').and.returnValue(true);
    fixture.detectChanges();
    const navbar = fixture.nativeElement.getElementsByClassName('navbar')[0];
    const desktopULs = fixture.nativeElement.getElementsByClassName('desktopMenu');
    const tabletUL = fixture.nativeElement.getElementsByClassName('tabletMenu')[0];
    const mobileMenu = fixture.nativeElement.getElementsByClassName('mobileMenu')[0];
    const hamburger = fixture.nativeElement.getElementsByClassName('hamburger')[0];
    expect(component.showDesktopMenu).toHaveBeenCalled();
    expect(navbar.classList).toContain('spaceBetween');
    expect(navbar.classList).not.toContain('flexEnd');
    expect(desktopULs.length).toBe(1);
    expect(tabletUL).toBeFalsy();
    expect(mobileMenu).toBeFalsy();
    expect(hamburger).toBeFalsy();
  });

  it('should render the hamburger button when showDesktopMenu returns false.', () => {
    spyOn(component, 'showDesktopMenu').and.returnValue(false);
    fixture.detectChanges();
    const hamburger = fixture.nativeElement.getElementsByClassName('hamburger')[0];
    expect(hamburger).toBeTruthy();
  });

  it('should render the tablet menu when menuOpen is true and showTabletMenu returns true.', () => {
    spyOn(component, 'showDesktopMenu').and.returnValue(false);
    spyOn(component, 'showTabletMenu').and.returnValue(true);
    component.menuOpen = true;
    fixture.detectChanges();
    const navbar = fixture.nativeElement.getElementsByClassName('navbar')[0];
    const desktopULs = fixture.nativeElement.getElementsByClassName('desktopMenu');
    const tabletUL = fixture.nativeElement.getElementsByClassName('tabletMenu')[0];
    const mobileMenu = fixture.nativeElement.getElementsByClassName('mobileMenu')[0];
    expect(component.showTabletMenu).toHaveBeenCalled();
    expect(navbar.classList).toContain('flexEnd');
    expect(navbar.classList).not.toContain('spaceBetween');
    expect(desktopULs.length).toBe(0);
    expect(tabletUL).toBeTruthy();
    expect(mobileMenu).toBeFalsy();
  });

  it('should not render the tablet menu if menuOpen is false.', () => {
    component.menuOpen = false;
    fixture.detectChanges();
    const tabletUL = fixture.nativeElement.getElementsByClassName('tabletMenu')[0];
    expect(tabletUL).toBeFalsy();
  });

  it('should not render the tablet menu if menuOpen is true but showTabletMenu returns false.', () => {
    spyOn(component, 'showTabletMenu').and.returnValue(false);
    component.menuOpen = false;
    fixture.detectChanges();
    const tabletUL = fixture.nativeElement.getElementsByClassName('tabletMenu')[0];
    expect(tabletUL).toBeFalsy();
  });

  it('should render the mobile menu if menuOpen is true & showMobileMenu returns true.', () => {
    spyOn(component, 'showDesktopMenu').and.returnValue(false);
    spyOn(component, 'showTabletMenu').and.returnValue(false);
    spyOn(component, 'showMobileMenu').and.returnValue(true);
    component.menuOpen = true;
    fixture.detectChanges();
    const navbar = fixture.nativeElement.getElementsByClassName('navbar')[0];
    const desktopULs = fixture.nativeElement.getElementsByClassName('desktopMenu');
    const tabletUL = fixture.nativeElement.getElementsByClassName('tabletMenu')[0];
    const mobileMenu = fixture.nativeElement.getElementsByClassName('mobileMenu')[0];
    expect(component.showMobileMenu).toHaveBeenCalled();
    expect(navbar.classList).toContain('flexEnd');
    expect(navbar.classList).not.toContain('spaceBetween');
    expect(desktopULs.length).toBe(0);
    expect(tabletUL).toBeFalsy();
    expect(mobileMenu).toBeTruthy();
  });

  it('should not render the mobile menu if menuOpen is false.', () => {
    component.menuOpen = false;
    fixture.detectChanges();
    const mobileMenu = fixture.nativeElement.getElementsByClassName('mobileMenu')[0];
    expect(mobileMenu).toBeFalsy();
  });

  it('should not render the tablet menu if menuOpen is true but showTabletMenu returns false.', () => {
    spyOn(component, 'showTabletMenu').and.returnValue(false);
    component.menuOpen = false;
    fixture.detectChanges();
    const mobileMenu = fixture.nativeElement.getElementsByClassName('mobileMenu')[0];
    expect(mobileMenu).toBeFalsy();
  });

  it('should not set menuOpen to false if the navbar is clicked.', () => {
    component.menuOpen = true;
    const navbar = fixture.nativeElement.getElementsByClassName('navbar')[0];
    navbar.click();
    expect(component.menuOpen).toBe(true);
  });

  it('should set menuOpen to false if an element that is not the navbar or a descendant of the navbar is clicked.', () => {
    component.menuOpen = true;
    fixture.nativeElement.querySelector('nav').classList.remove('navbar');
    fixture.nativeElement.querySelector('nav').click();
    expect(component.menuOpen).toBe(false);
  });

  it('should set menuOpen to !menuOpen when the hamburger button is clicked.', () => {
    expect(component.menuOpen).toBe(false);
    spyOn(component, 'showDesktopMenu').and.returnValue(false);
    fixture.detectChanges();
    fixture.nativeElement.getElementsByClassName('hamburger')[0].click();
    expect(component.menuOpen).toBe(true);
  });

  it('should display an additional desktopMenu when there is an activeUser and showDesktopMenu returns true.', () => {
    spyOn(component, 'showDesktopMenu').and.returnValue(true);
    component.authService.activeUser = new User('Test User', 'user@example.com');
    fixture.detectChanges();
    const desktopMenus = fixture.nativeElement.getElementsByClassName('desktopMenu');
    expect(desktopMenus.length).toBe(2);
  });

  it('should display a logout link in the tablet menu when there is an activeUser, menuOpen is true, and showDesktopMenu returns false.', () => {
    spyOn(component, 'showDesktopMenu').and.returnValue(false);
    spyOn(component, 'showTabletMenu').and.returnValue(true);
    spyOn(component, 'showMobileMenu').and.returnValue(false);
    component.authService.activeUser = new User('Test User', 'user@example.com');
    component.menuOpen = true;
    fixture.detectChanges();
    const additionalLinks = fixture.nativeElement.querySelectorAll('span');
    expect(additionalLinks.length).toBe(1);
    expect(additionalLinks[0].textContent).toBe('Logout');
  });

  it('should display a logout link in the mobile menu when there is an activeUser, menuOpen is true, and showDesktopMenu returns false.', () => {
    spyOn(component, 'showDesktopMenu').and.returnValue(false);
    spyOn(component, 'showTabletMenu').and.returnValue(false);
    spyOn(component, 'showMobileMenu').and.returnValue(true);
    component.authService.activeUser = new User('Test User', 'user@example.com');
    component.menuOpen = true;
    fixture.detectChanges();
    const additionalLinks = fixture.nativeElement.querySelectorAll('span');
    expect(additionalLinks.length).toBe(1);
    expect(additionalLinks[0].textContent).toBe('Logout');
  });


  it('should call authService.logout when the logout button is clicked while there is an activeUser.', () => {
    spyOn(component, 'showDesktopMenu').and.returnValue(true);
    spyOn(component.authService, 'logout');
    component.authService.activeUser = new User('Test User', 'user@example.com');
    fixture.detectChanges();
    const spans = fixture.nativeElement.querySelectorAll('span');
    console.log(spans[0]);
    for(let span of spans) {
      console.log(span.textContent);
      if(span.textContent === 'Logout') span.click();
    }
    expect(component.authService.logout).toHaveBeenCalled();
  });
});
