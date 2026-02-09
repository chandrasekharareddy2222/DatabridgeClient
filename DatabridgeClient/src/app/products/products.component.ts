import { Component, OnInit, inject, signal } from '@angular/core';
import { UiModule } from '../app.module';

import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [UiModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  private readonly productService = inject(ProductService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  products = signal<Product[]>([]);
  productDialog = signal(false);
  product = signal<Product>({
    name: '',
    description: '',
    price: 0,
    stock: 0
  });

  submitted = signal(false);
  isEditMode = signal(false);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products',
          life: 3000
        });
      }
    });
  }

  openNew() {
    this.product.set({ name: '', description: '', price: 0, stock: 0 });
    this.submitted.set(false);
    this.isEditMode.set(false);
    this.productDialog.set(true);
  }

  editProduct(product: Product) {
    this.product.set({ ...product });
    this.isEditMode.set(true);
    this.productDialog.set(true);
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${product.name}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (product.id) {
          this.productService.deleteProduct(product.id).subscribe({
            next: () => {
              this.loadProducts();
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Product Deleted',
                life: 3000
              });
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete product',
                life: 3000
              });
            }
          });
        }
      }
    });
  }

  hideDialog() {
    this.productDialog.set(false);
    this.submitted.set(false);
  }

  saveProduct() {
    this.submitted.set(true);

    if (this.product().name?.trim()) {
      if (this.isEditMode() && this.product().id) {
        // Update
        this.productService
          .updateProduct(this.product().id!, this.product())
          .subscribe({
            next: () => {
              this.loadProducts();
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Product Updated',
                life: 3000
              });
              this.hideDialog();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update product',
                life: 3000
              });
            }
          });
      } else {
        // Create
        this.productService.createProduct(this.product()).subscribe({
          next: () => {
            this.loadProducts();
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Product Created',
              life: 3000
            });
            this.hideDialog();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create product',
              life: 3000
            });
          }
        });
      }
    }
  }
}
