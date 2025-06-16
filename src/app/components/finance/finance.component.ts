// import { NavbarComponent } from '../navbar/navbar.component';
// import { Component, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatCardModule } from '@angular/material/card';
// import { MatTableModule } from '@angular/material/table';
// import { MatSort, MatSortModule } from '@angular/material/sort';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatIconModule } from '@angular/material/icon';
// import { FooterComponent } from '../../components/footer/footer.component';

// @Component({
//   selector: 'app-finance',
//   standalone: true,
//   imports: [
//     CommonModule,
//     NavbarComponent,
//     MatCardModule,
//     MatTableModule,
//     MatSortModule,
//     MatPaginatorModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatIconModule,
//     FooterComponent,
//   ],
//   templateUrl: './finance.component.html',
//   styleUrls: ['./finance.component.css']
// })
// export class FinanceComponent {
//     expandedCard: number | null = null;

//   invoiceColumns: string[] = ['invoiceNo', 'date', 'amount', 'status'];
//   agingColumns: string[] = ['bill', 'dueDate', 'billingDate', 'aging'];
//   memoColumns: string[] = ['type', 'ref', 'amount', 'note'];

//   invoiceDataSource = new MatTableDataSource([
//     { invoiceNo: 'INV-001', date: '2024-05-01', amount: '₹15,000', status: 'Paid' },
//     { invoiceNo: 'INV-002', date: '2024-05-10', amount: '₹25,000', status: 'Unpaid' }
//   ]);

//   agingDataSource = new MatTableDataSource([
//     { bill: 'BILL-101', dueDate: '2024-04-20', billingDate: '2024-04-01', aging: '19 days' }
//   ]);

//   memoDataSource = new MatTableDataSource([
//     { type: 'Credit Memo', ref: 'CM-001', amount: '₹2,000', note: 'Customer refund' },
//     { type: 'Debit Memo', ref: 'DM-001', amount: '₹1,500', note: 'Undercharged previously' }
//   ]);

//   financialData = {
//     sales: {
//       totalSales: '₹1,25,000',
//       lastMonth: '₹20,000',
//       highestInvoice: '₹30,000'
//     }
//   };

//   @ViewChild('invoiceSort') invoiceSort!: MatSort;
//   @ViewChild('invoicePaginator') invoicePaginator!: MatPaginator;

//   @ViewChild('agingSort') agingSort!: MatSort;
//   @ViewChild('agingPaginator') agingPaginator!: MatPaginator;

//   @ViewChild('memoSort') memoSort!: MatSort;
//   @ViewChild('memoPaginator') memoPaginator!: MatPaginator;

//   ngAfterViewInit() {
//     this.invoiceDataSource.sort = this.invoiceSort;
//     this.invoiceDataSource.paginator = this.invoicePaginator;

//     this.agingDataSource.sort = this.agingSort;
//     this.agingDataSource.paginator = this.agingPaginator;

//     this.memoDataSource.sort = this.memoSort;
//     this.memoDataSource.paginator = this.memoPaginator;
//   }

// //   toggleCard(card: string, event: MouseEvent) {
// //   event.stopPropagation(); // prevent card click from triggering toggle
// //   this.expandedCard = this.expandedCard === card ? null : card;
// // }

// toggleCard(index: number) {
//   this.expandedCard = this.expandedCard === index ? null : index;

//   // Delay the DOM access until the view is updated
//   setTimeout(() => {
//     if (index === 0) {
//       this.invoiceDataSource.sort = this.invoiceSort;
//       this.invoiceDataSource.paginator = this.invoicePaginator;
//     } else if (index === 1) {
//       this.agingDataSource.sort = this.agingSort;
//       this.agingDataSource.paginator = this.agingPaginator;
//     } else if (index === 2) {
//       this.memoDataSource.sort = this.memoSort;
//       this.memoDataSource.paginator = this.memoPaginator;
//     }
//   });
// }

//   applyFilter(event: Event, type: string) {
//     const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
//     switch (type) {
//       case 'invoice':
//         this.invoiceDataSource.filter = filterValue;
//         break;
//       case 'aging':
//         this.agingDataSource.filter = filterValue;
//         break;
//       case 'memo':
//         this.memoDataSource.filter = filterValue;
//         break;
//     }
//   }
// }


import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { saveAs } from 'file-saver';

interface SalesEntry {
  documentId: string;
  type: string;
  date: string;
  productId: string;
  description: string;
  unit: string;
  quantity: string;
  amount: string;
  currency: string;
}

interface AgingEntry {
  documentId: string;
  billingDate: string;
  dueDate: string;
  amount: string;
  currency: string;
  agingDays: string;
}

interface MemoEntry {
  documentId: string;
  billingDate: string;
  type: string;
  customerRef: string;
  salesOrg: string;
  amount: string;
  currency: string;
}

interface InvoiceEntry {
  documentId: string;
  billingDate: string;
  amount: string;
  currency: string;
  positionCount: string;
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css']
})
export class FinanceComponent implements OnInit, AfterViewInit {

readonly TABS = {
  INVOICE: 0,
  AGING: 1,
  MEMOS: 2,
  SALES: 3,
};

expandedCard: number | null = null;

overallSalesColumns = ['documentId', 'type', 'date', 'productId', 'description', 'quantity', 'amount'];
agingColumns = ['documentId', 'billingDate', 'dueDate', 'agingDays', 'amount'];
memoColumns = ['documentId', 'billingDate', 'type', 'customerRef', 'salesOrg', 'amount'];
invoiceColumns = ['documentId', 'billingDate', 'amount', 'positionCount','preview', 'download' ];

overallSalesDataSource = new MatTableDataSource<SalesEntry>([]);
agingDataSource = new MatTableDataSource<AgingEntry>([]);
memoDataSource = new MatTableDataSource<MemoEntry>([]);
invoiceDataSource = new MatTableDataSource<InvoiceEntry>([]);

@ViewChild('salesSort') salesSort!: MatSort;
@ViewChild('salesPaginator') salesPaginator!: MatPaginator;

@ViewChild('agingSort') agingSort!: MatSort;
@ViewChild('agingPaginator') agingPaginator!: MatPaginator;

@ViewChild('memoSort') memoSort!: MatSort;
@ViewChild('memoPaginator') memoPaginator!: MatPaginator;

@ViewChild('invoiceSort') invoiceSort!: MatSort;
@ViewChild('invoicePaginator') invoicePaginator!: MatPaginator;

constructor(private http: HttpClient) {}

ngOnInit(): void {
  const customerId = localStorage.getItem('customerId');
  if (!customerId) return;

  this.fetchOverallSales(customerId);
  this.fetchAging(customerId);
  this.fetchMemos(customerId);
  this.fetchInvoices(customerId);
}

ngAfterViewInit(): void {
  this.overallSalesDataSource.sort = this.salesSort;
  this.overallSalesDataSource.paginator = this.salesPaginator;

  this.agingDataSource.sort = this.agingSort;
  this.agingDataSource.paginator = this.agingPaginator;

  this.memoDataSource.sort = this.memoSort;
  this.memoDataSource.paginator = this.memoPaginator;

  this.invoiceDataSource.sort = this.invoiceSort;
  this.invoiceDataSource.paginator = this.invoicePaginator;
}

toggleCard(index: number): void {
  this.expandedCard = this.expandedCard === index ? null : index;

  // Timeout ensures DOM is ready before binding sort/paginator again
  setTimeout(() => {
    this.bindPaginatorAndSort(index);
  });
}

bindPaginatorAndSort(tabIndex: number): void {
  switch (tabIndex) {
    case this.TABS.SALES:
      this.overallSalesDataSource.sort = this.salesSort;
      this.overallSalesDataSource.paginator = this.salesPaginator;
      break;
    case this.TABS.AGING:
      this.agingDataSource.sort = this.agingSort;
      this.agingDataSource.paginator = this.agingPaginator;
      break;
    case this.TABS.MEMOS:
      this.memoDataSource.sort = this.memoSort;
      this.memoDataSource.paginator = this.memoPaginator;
      break;
    case this.TABS.INVOICE:
      this.invoiceDataSource.sort = this.invoiceSort;
      this.invoiceDataSource.paginator = this.invoicePaginator;
      break;
  }
}

applyFilter(event: Event, type: string): void {
  const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

  switch (type) {
    case 'sales':
      this.overallSalesDataSource.filter = filterValue;
      break;
    case 'aging':
      this.agingDataSource.filter = filterValue;
      break;
    case 'memo':
      this.memoDataSource.filter = filterValue;
      break;
    case 'invoice':
      this.invoiceDataSource.filter = filterValue;
      break;
  }
}

  fetchOverallSales(customerId: string) {
    this.http.post('http://localhost:3000/custoverallsales', { customerId }, { responseType: 'text' }).subscribe({
      next: (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        const items = Array.from(xmlDoc.getElementsByTagName('item'));

        const data: SalesEntry[] = items.map((item: any) => ({
          documentId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
          type: item.getElementsByTagName('Auart')[0]?.textContent || '',
          date: item.getElementsByTagName('Erdat')[0]?.textContent || '',
          productId: item.getElementsByTagName('Matnr')[0]?.textContent || '',
          description: item.getElementsByTagName('Arktx')[0]?.textContent || '',
          unit: item.getElementsByTagName('Vrkme')[0]?.textContent || '',
          quantity: item.getElementsByTagName('Kwmweng')[0]?.textContent || '',
          amount: item.getElementsByTagName('Netwr')[0]?.textContent || '',
          currency: item.getElementsByTagName('Waerk')[0]?.textContent || ''
        }));

        this.overallSalesDataSource.data = data;
      },
      error: (err) => console.error('Error fetching overall sales:', err)
    });
  }

  fetchAging(customerId: string) {
    this.http.post('http://localhost:3000/custaging', { customerId }, { responseType: 'text' }).subscribe({
      next: (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        const items = Array.from(xmlDoc.getElementsByTagName('item'));

        const data: AgingEntry[] = items.map((item: any) => ({
          documentId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
          billingDate: item.getElementsByTagName('Fkdat')[0]?.textContent || '',
          dueDate: item.getElementsByTagName('Dats')[0]?.textContent || '',
          amount: item.getElementsByTagName('Netwr')[0]?.textContent || '',
          currency: item.getElementsByTagName('Waerk')[0]?.textContent || '',
          agingDays: item.getElementsByTagName('Aging')[0]?.textContent || ''
        }));

        this.agingDataSource.data = data;
      },
      error: (err) => console.error('Error fetching aging data:', err)
    });
  }

  fetchMemos(customerId: string) {
    this.http.post('http://localhost:3000/custmemos', { customerId }, { responseType: 'text' }).subscribe({
      next: (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        const items = Array.from(xmlDoc.getElementsByTagName('item'));

        const data: MemoEntry[] = items.map((item: any) => ({
          documentId: item.getElementsByTagName('VbelnVf')[0]?.textContent || '',
          billingDate: item.getElementsByTagName('Fkdat')[0]?.textContent || '',
          type: item.getElementsByTagName('Fkart')[0]?.textContent || '',
          customerRef: item.getElementsByTagName('Kunrg')[0]?.textContent || '',
          salesOrg: item.getElementsByTagName('Vkorg')[0]?.textContent || '',
          amount: item.getElementsByTagName('Netwr')[0]?.textContent || '',
          currency: item.getElementsByTagName('Waerk')[0]?.textContent || ''
        }));

        this.memoDataSource.data = data;
      },
      error: (err) => console.error('Error fetching memos:', err)
    });
  }

  fetchInvoices(customerId: string) {
    this.http.post('http://localhost:3000/custinvoicelist', { customerId }, { responseType: 'text' }).subscribe({
      next: (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        const items = Array.from(xmlDoc.getElementsByTagName('item'));

        const data: InvoiceEntry[] = items.map((item: any) => ({
          documentId: item.getElementsByTagName('Vbeln')[0]?.textContent || '',
          billingDate: item.getElementsByTagName('Fkdat')[0]?.textContent || '',
          amount: item.getElementsByTagName('Netwr')[0]?.textContent || '',
          currency: item.getElementsByTagName('Waerk')[0]?.textContent || '',
          positionCount: item.getElementsByTagName('Poscnt')[0]?.textContent || ''
        }));

        this.invoiceDataSource.data = data;
      },
      error: (err) => console.error('Error fetching invoices:', err)
    });
  }

  PreviewInvoicePdf(vbeln: string): void {
    const customerId = localStorage.getItem('customerId');
    const payload = { customerId, vbeln };

    this.http.post<{ pdfBase64: string }>('http://localhost:3000/custinvoicefile', payload)
      .subscribe(response => {
        const base64 = response.pdfBase64;

        // Convert Base64 to binary Blob
        const byteCharacters = atob(base64);
        const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Create URL and open in new tab
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
        // Optional cleanup
        setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
      }, err => {
        console.error('Download failed:', err);
      });
  }

  downloadInvoicePdfFile(vbeln: string): void {
    const customerId = localStorage.getItem('customerId');
    const payload = { customerId, vbeln };

    this.http.post<{ pdfBase64: string }>('http://localhost:3000/custinvoicefile', payload)
      .subscribe(response => {
        const base64 = response.pdfBase64;

        // Convert Base64 to binary Blob
        const byteCharacters = atob(base64);
        const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Trigger download using FileSaver
        saveAs(blob, `Invoice_${vbeln}.pdf`);
      }, err => {
        console.error('Download failed:', err);
      });
  }


}
