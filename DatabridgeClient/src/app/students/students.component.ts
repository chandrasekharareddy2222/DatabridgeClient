import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { StudentService } from '../services/student.service';
import { Student } from '../models/student.model';
import { UiModule } from '../modules/ui.module';

// PrimeNG Services
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [UiModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly platformId = inject(PLATFORM_ID);

  students = signal<Student[]>([]);
  studentDialog = signal(false);
  student = signal<Student>({ studentName: '', age: 0, deptName: '' });
  submitted = signal(false);
  isEditMode = signal(false);
  selectedStudent = signal<Student | null>(null);

  ngOnInit() {
    // Only load on browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadStudents();
    }
  }

  loadStudents() {
    this.studentService.getAll().subscribe({
      next: (data) => {
        this.students.set(data);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load students',
          life: 3000
        });
      }
    });
  }

  openNew() {
    this.student.set({ studentName: '', age: 0, deptName: '' });
    this.submitted.set(false);
    this.isEditMode.set(false);
    this.selectedStudent.set(null);
    this.studentDialog.set(true);
  }

  editStudent(student: Student) {
    this.student.set({ ...student });
    this.selectedStudent.set(student);
    this.isEditMode.set(true);
    this.studentDialog.set(true);
  }

  deleteStudent(student: Student) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${student.studentName}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (student.id) {
          this.studentService.delete(student.id).subscribe(() => {
            this.loadStudents();
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Student Deleted',
              life: 3000
            });
          });
        }
      }
    });
  }

  saveStudent() {
    this.submitted.set(true);

    if (!this.student().studentName || !this.student().age || !this.student().deptName) {
      return;
    }

    if (this.isEditMode() && this.selectedStudent()?.id) {
      this.studentService.update(this.selectedStudent()!.id!, this.student()).subscribe(() => {
        this.loadStudents();
        this.hideDialog();
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Student Updated',
          life: 3000
        });
      });
    } else {
      this.studentService.create(this.student()).subscribe(() => {
        this.loadStudents();
        this.hideDialog();
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Student Created',
          life: 3000
        });
      });
    }
  }

  hideDialog() {
    this.studentDialog.set(false);
    this.submitted.set(false);
  }
}
