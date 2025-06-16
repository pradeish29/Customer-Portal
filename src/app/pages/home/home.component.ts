import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit  {
   customerData = {
      name: ''
   }

    constructor(
    private http: HttpClient,
  ) {}

    ngOnInit(): void {
    const customerId = localStorage.getItem('customerId');
        this.http
      .post<any>('http://localhost:3000/custprofile', { customerId })
      .subscribe({
        next: data => {
          this.customerData = {
            name: data.Name1  || '',
          };
        },
        error: err => {
          console.error('HTTP error:', err);
        }
      });
     }
}
