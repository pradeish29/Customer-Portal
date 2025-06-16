// src/app/services/user.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private customerId: string = '';

  setCustomerId(id: string) {
    this.customerId = id;
  }

  getCustomerId(): string {
    return this.customerId;
  }
}
