import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileComponent } from '../profile/profile.component'; // adjust path as needed

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule,],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showPopover = false;

  togglePopover() {
    this.showPopover = !this.showPopover;
  }
  constructor(private router: Router) {}
  
  navigateHome() {
  this.router.navigate(['/home']);
}


navigateToProfile() {
  this.router.navigate(['/profile']);
}

}
