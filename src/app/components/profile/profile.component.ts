// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { NavbarComponent } from '../navbar/navbar.component'
// import { FooterComponent } from '../../components/footer/footer.component';


// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [NavbarComponent, FooterComponent  ],
//   templateUrl: './profile.component.html',
//   styleUrls: ['./profile.component.css']
// })
// export class ProfileComponent {
//   customerData = {
//     name: 'Ravi',
//     customerId: 'CU10239',
//     address: '21, Main Street, Chennai',
//     country: 'India',
//     city: 'Chennai',
//     postalCode: '600001',
//   };

//   constructor(private router: Router) {}

//   signOut() {
//     localStorage.removeItem('loggedIn');
//     this.router.navigate(['/login']);
//   }

// }
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ NavbarComponent, FooterComponent, HttpClientModule ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'] 
})
export class ProfileComponent implements OnInit {
  customerData = {
    name: '',
    customerId: '',
    address: '',
    country: '',
    city: '',
    postalCode: ''
  };

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      alert('Not logged in.');
      this.router.navigate(['/login']);
      return;
    }

    // ⚠️ Use POST and send your customerId in the body
    this.http
      .post<any>('http://localhost:1000/custprofile', { customerId })
      .subscribe({
        next: data => {
          this.customerData = {
            name: data.Name1  || '',
            customerId: data.Kunnr  || '',
            address: data.Stras || '',
            country: data.Land1 || '',
            city: data.Ort01  || '',
            postalCode: data.Pstlz || ''
          };
        },
        error: err => {
          console.error('HTTP error:', err);
          alert('Failed to load profile.');
          this.router.navigate(['/login']);
        }
      });
  }

  signOut() {
    localStorage.removeItem('customerId');  // clear it
    localStorage.removeItem('loggedIn');  // clear it
    this.router.navigate(['/login']);
  }
}
 