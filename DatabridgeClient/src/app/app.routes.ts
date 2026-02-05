import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ProductsComponent } from './products/products.component';
import { StudentsComponent } from './students/students.component';
import { EmployeesComponent } from './employees/employees.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductsComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'employees', component: EmployeesComponent }
    ]
  }
];
