import { Component } from '@angular/core';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [],
  template: `
    <div class="card">
      <h2>Employees Management</h2>
      <p>Employees CRUD operations will be implemented here.</p>
    </div>
  `,
  styles: [`
    .card {
      padding: 2rem;
    }
  `]
})
export class EmployeesComponent {
}
