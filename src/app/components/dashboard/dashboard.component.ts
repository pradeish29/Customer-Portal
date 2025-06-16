import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from '../../components/footer/footer.component';
import { UserService } from '../../services/user.service';

interface SalesOrder {
  orderId: string;
  productId: string;
  name: string;
  date: string;
  quantity: string;
  unit: string;
  price: string;
  currency:string; 
}

interface Invoice {
  orderId: string;
  productId: string;
  name: string;
  date: string;
  quantity: string;
  unit: string;
  price: string;
  currency:string;
}

interface Delivery {
  orderId: string;
  productId: string;
  name: string;
  date: string;
  price: string;
  currency:string;
  type: string;
  status:string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    NavbarComponent,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FooterComponent,
    HttpClientModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  expandedCard: number | null = null;

  salesOrdersColumns = ['orderId', 'productId', 'name', 'date', 'quantity', 'price'];
  invoicesColumns = ['orderId', 'productId', 'name', 'date', 'quantity', 'price'];
  deliveriesColumns = ['orderId','productId', 'name', 'date', 'price', 'status'];

  salesOrdersDataSource = new MatTableDataSource<SalesOrder>([]);
  deliveriesDataSource = new MatTableDataSource<Delivery>([]);
  invoicesDataSource = new MatTableDataSource<Invoice>([]);

  @ViewChild('salesSort') salesSort!: MatSort;
  @ViewChild('salesPaginator') salesPaginator!: MatPaginator;

  @ViewChild('deliveriesSort') deliveriesSort!: MatSort;
  @ViewChild('deliveriesPaginator') deliveriesPaginator!: MatPaginator;

  @ViewChild('invoicesSort') invoicesSort!: MatSort;
  @ViewChild('invoicesPaginator') invoicesPaginator!: MatPaginator;

  constructor(private userService: UserService, private http: HttpClient) {}

ngOnInit() {
  const customerId = localStorage.getItem('customerId');

  if (!customerId) return;

  this.fetchSalesOrders(customerId);
  this.fetchDeliveries(customerId);
  this.fetchInvoices(customerId);
}

ngAfterViewInit() {
  this.salesOrdersDataSource.sort = this.salesSort;
  this.salesOrdersDataSource.paginator = this.salesPaginator;

  this.deliveriesDataSource.sort = this.deliveriesSort;
  this.deliveriesDataSource.paginator = this.deliveriesPaginator;

  this.invoicesDataSource.sort = this.invoicesSort;
  this.invoicesDataSource.paginator = this.invoicesPaginator;
}

toggleCard(index: number) {
  this.expandedCard = this.expandedCard === index ? null : index;

  setTimeout(() => {
    if (index === 0) {
      this.salesOrdersDataSource.sort = this.salesSort;
      this.salesOrdersDataSource.paginator = this.salesPaginator;
    } else if (index === 1) {
      this.deliveriesDataSource.sort = this.deliveriesSort;
      this.deliveriesDataSource.paginator = this.deliveriesPaginator;
    } else if (index === 2) {
      this.invoicesDataSource.sort = this.invoicesSort;
      this.invoicesDataSource.paginator = this.invoicesPaginator;
    }
  });
}

applyFilter(event: Event, type: string) {
  const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  if (type === 'sales') this.salesOrdersDataSource.filter = filterValue;
  else if (type === 'deliveries') this.deliveriesDataSource.filter = filterValue;
  else if (type === 'invoices') this.invoicesDataSource.filter = filterValue;
}

fetchSalesOrders(customerId: string) {
  this.http.post('http://localhost:3000/custsales', { customerId }, { responseType: 'text' }).subscribe({
    next: (xmlString) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      const items = Array.from(xmlDoc.getElementsByTagName('item'));
      const data: SalesOrder[] = items.map((item: any) => ({
        orderId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
        productId: item.getElementsByTagName('Matnr')[0]?.textContent || '',
        name: item.getElementsByTagName('Arktx')[0]?.textContent || '',
        date: item.getElementsByTagName('Erdat')[0]?.textContent || '',
        quantity: item.getElementsByTagName('Kwmeng')[0]?.textContent || '',
        unit: item.getElementsByTagName('Vrkme')[0]?.textContent || '',
        price: item.getElementsByTagName('Netwr')[0]?.textContent || '',
        currency: item.getElementsByTagName('Waerk')[0]?.textContent || '',
      }));

      this.salesOrdersDataSource.data = data;
    },
    error: (err) => {
      console.error('Error fetching sales orders:', err);
    }
  });
}

fetchInvoices(customerId: string) {
  this.http.post('http://localhost:3000/custinquiry', { customerId }, { responseType: 'text' }).subscribe({
    next: (xmlString) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      const items = Array.from(xmlDoc.getElementsByTagName('item'));
      const data: Invoice[] = items.map((item: any) => ({
        orderId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
        productId: item.getElementsByTagName('Matnr')[0]?.textContent || '',
        name: item.getElementsByTagName('Arktx')[0]?.textContent || '',
        date: item.getElementsByTagName('Erdat')[0]?.textContent || '',
        quantity: item.getElementsByTagName('Kwmeng')[0]?.textContent || '',
        unit: item.getElementsByTagName('Vrkme')[0]?.textContent || '',
        price: item.getElementsByTagName('Netwr')[0]?.textContent || '',
        currency: item.getElementsByTagName('Waerk')[0]?.textContent || '',
      }));

      this.invoicesDataSource.data = data;
    },
    error: (err) => {
      console.error('Error fetching invoices:', err);
    }
  });
}

fetchDeliveries(customerId: string) {
  this.http.post('http://localhost:3000/custdelivery', { customerId }, { responseType: 'text' }).subscribe({
    next: (xmlString) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      const items = Array.from(xmlDoc.getElementsByTagName('item'));
      const data: Delivery[] = items.map((item: any) => ({
        orderId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
        productId: item.getElementsByTagName('Matnr')[0]?.textContent || '',
        name: item.getElementsByTagName('Arktx')[0]?.textContent || '',
        date: item.getElementsByTagName('Lfdat')[0]?.textContent || '',
        price: item.getElementsByTagName('Netwr')[0]?.textContent || '',
        currency: item.getElementsByTagName('Waerk')[0]?.textContent || '',
        type: item.getElementsByTagName('Lfart')[0]?.textContent || '',
        status: this.mapDeliveryStatus(item.getElementsByTagName('Gbstk')[0]?.textContent || '')
      }));

      this.deliveriesDataSource.data = data;
    },
    error: (err) => {
      console.error('Error fetching deliveries:', err);
    }
  });
}

  mapSalesStatus(code: string): string {
    switch (code) {
      case 'A': return 'Open';
      case 'B': return 'Partially Delivered';
      case 'C': return 'Completed';
      default: return 'Unknown';
    }
  }

  mapDeliveryStatus(code: string): string {
    switch (code) {
      case 'A': return 'Pending';
      case 'B': return 'Partially Shipped';
      case 'C': return 'Delivered';
      default: return 'Unknown';
    }
  }

  mapInvoiceStatus(code: string): string {
    switch (code) {
      case 'A': return 'Unpaid';
      case 'C': return 'Paid';
      default: return 'Unknown';
    }
  }
}
