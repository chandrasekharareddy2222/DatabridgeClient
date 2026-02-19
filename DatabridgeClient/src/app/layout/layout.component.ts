import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  menuItems = signal<MenuItem[]>([
    {
      label: 'Products',
      icon: 'pi pi-box',
      routerLink: '/products'
    },
    {
      label: 'Students',
      icon: 'pi pi-users',
      routerLink: '/students'
    },
    {
      label: 'Employees',
      icon: 'pi pi-briefcase',
      routerLink: '/employees'
    },
    {
      label: 'Members',
      icon: 'pi pi-book',
      routerLink: '/members'
    }
  ]);
}
