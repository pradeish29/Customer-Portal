import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
  ],
})
export class LoginComponent {
  username = '';
  password = '';
  showError = false;

  // constructor(private router: Router) {}

  // login() {
  //   if (this.username === '1' && this.password === '123456') {
  //     this.router.navigate(['/home']);
  //   } else {
  //     this.showError = true;
  //   }
  // }
  
  // constructor(private http: HttpClient, private router: Router) {}

constructor(private http: HttpClient, private userService: UserService, private router: Router) {}

  login() {
    const payload = {
      username: this.username,
      password: this.password,
    };

    this.http.post<any>('http://localhost:3000/custlogin', payload).subscribe({
      next: (response) => {
        // You can adjust this depending on how you format the response from backend
        const msg = response?.Envelope?.Body?.ZfmLoginPmResponse?.Return;
      if (msg === 'Login successful.') {
        localStorage.setItem('customerId', this.username);
              this.userService.setCustomerId(this.username);  // Save to service instead of localStorage
 
        localStorage.setItem('loggedIn', 'true');  // 👈 Set login flag
        this.router.navigate(['/home']);
        } else {
          this.showError = true;
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.showError = true;
      }
    }); 
  }
}

