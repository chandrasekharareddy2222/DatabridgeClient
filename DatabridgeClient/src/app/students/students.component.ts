import { Component } from '@angular/core';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [],
  template: `
    <div class="card">
      <h2>Students Management</h2>
      <p>Students CRUD operations will be implemented here.</p>
    </div>
  `,
  styles: [`
    .card {
      padding: 2rem;
    }
  `]
})
export class StudentsComponent {
}
