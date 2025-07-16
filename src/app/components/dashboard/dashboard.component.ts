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

// Add these helper methods to your class
private formatSAPDate(sapDate: string): string {
  if (!sapDate) return '';
  
  try {
    // Handle /Date(timestamp)/ format from OData
    if (sapDate.includes('/Date(')) {
      const timestamp = sapDate.match(/\d+/)?.[0];
      if (timestamp) {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit' 
        });
      }
    }
    
    // Handle YYYYMMDD format
    if (sapDate.length === 8 && /^\d{8}$/.test(sapDate)) {
      const year = sapDate.substring(0, 4);
      const month = sapDate.substring(4, 6);
      const day = sapDate.substring(6, 8);
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      });
    }
    
    // Handle ISO date format
    if (sapDate.includes('-') || sapDate.includes('/')) {
      const date = new Date(sapDate);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: '2-digit' 
        });
      }
    }
    
    return sapDate;
  } catch (error) {
    console.warn('Error formatting date:', sapDate, error);
    return sapDate;
  }
}

private formatCurrency(amount: string, currency: string): string {
  if (!amount || !currency) return amount || '';
  
  const currencySymbols: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
  };
  
  const symbol = currencySymbols[currency.toUpperCase()] || currency + ' ';
  
  // Parse the amount and format with commas
  const numAmount = parseFloat(amount);
  if (!isNaN(numAmount)) {
    return symbol + numAmount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
  
  return symbol + amount;
}

// Updated methods with formatting
fetchSalesOrders(customerId: string) {
  this.http.post('http://localhost:1000/custsales', { customerId }, { responseType: 'text' }).subscribe({
    next: (xmlString) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      const items = Array.from(xmlDoc.getElementsByTagName('item'));
      const data: SalesOrder[] = items.map((item: any) => ({
        orderId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
        productId: item.getElementsByTagName('Matnr')[0]?.textContent || '',
        name: item.getElementsByTagName('Arktx')[0]?.textContent || '',
        date: this.formatSAPDate(item.getElementsByTagName('Erdat')[0]?.textContent || ''),
        quantity: item.getElementsByTagName('Kwmeng')[0]?.textContent || '',
        unit: item.getElementsByTagName('Vrkme')[0]?.textContent || '',
        price: this.formatCurrency(
          item.getElementsByTagName('Netwr')[0]?.textContent || '',
          item.getElementsByTagName('Waerk')[0]?.textContent || ''
        ),
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
  this.http.post('http://localhost:1000/custinquiry', { customerId }, { responseType: 'text' }).subscribe({
    next: (xmlString) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      const items = Array.from(xmlDoc.getElementsByTagName('item'));
      const data: Invoice[] = items.map((item: any) => ({
        orderId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
        productId: item.getElementsByTagName('Matnr')[0]?.textContent || '',
        name: item.getElementsByTagName('Arktx')[0]?.textContent || '',
        date: this.formatSAPDate(item.getElementsByTagName('Erdat')[0]?.textContent || ''),
        quantity: item.getElementsByTagName('Kwmeng')[0]?.textContent || '',
        unit: item.getElementsByTagName('Vrkme')[0]?.textContent || '',
        price: this.formatCurrency(
          item.getElementsByTagName('Netwr')[0]?.textContent || '',
          item.getElementsByTagName('Waerk')[0]?.textContent || ''
        ),
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
  this.http.post('http://localhost:1000/custdelivery', { customerId }, { responseType: 'text' }).subscribe({
    next: (xmlString) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      const items = Array.from(xmlDoc.getElementsByTagName('item'));
      const data: Delivery[] = items.map((item: any) => ({
        orderId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
        productId: item.getElementsByTagName('Matnr')[0]?.textContent || '',
        name: item.getElementsByTagName('Arktx')[0]?.textContent || '',
        date: this.formatSAPDate(item.getElementsByTagName('Lfdat')[0]?.textContent || ''),
        price: this.formatCurrency(
          item.getElementsByTagName('Netwr')[0]?.textContent || '',
          item.getElementsByTagName('Waerk')[0]?.textContent || ''
        ),
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
