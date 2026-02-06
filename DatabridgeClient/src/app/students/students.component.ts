import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { StudentService, Student } from '../services/student.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule
  ],
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
        console.log('Students loaded:', data);
        if (data && data.length > 0) {
          console.log('First student object:', data[0]);
          console.log('First student keys:', Object.keys(data[0]));
          console.log('First student entries:', Object.entries(data[0]));
        }
        this.students.set(data);
      },
      error: (error) => {
        console.error('Failed to load students:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load students: ' + (error.message || error.statusText || 'Unknown error'),
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
          console.log('Deleting student with ID:', student.id);
          this.studentService.delete(student.id).subscribe({
            next: () => {
              console.log('Student deleted successfully');
              this.loadStudents();
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Student Deleted',
                life: 3000
              });
            },
            error: (error) => {
              console.error('Failed to delete student:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete student: ' + (error.message || error.statusText || 'Unknown error'),
                life: 3000
              });
            }
          });
        } else {
          console.error('Student ID is missing');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Student ID is missing',
            life: 3000
          });
        }
      }
    });
  }

  saveStudent() {
    this.submitted.set(true);

    if (!this.student().studentName || !this.student().age || !this.student().deptName) {
      console.warn('Form validation failed');
      return;
    }

    if (this.isEditMode() && this.selectedStudent()?.id) {
      console.log('Updating student with ID:', this.selectedStudent()?.id, 'Data:', this.student());
      this.studentService.update(this.selectedStudent()!.id!, this.student()).subscribe({
        next: () => {
          console.log('Student updated successfully');
          this.loadStudents();
          this.hideDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Student Updated',
            life: 3000
          });
        },
        error: (error) => {
          console.error('Failed to update student:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update student: ' + (error.message || error.statusText || 'Unknown error'),
            life: 3000
          });
        }
      });
    } else {
      console.log('Creating new student with data:', this.student());
      this.studentService.create(this.student()).subscribe({
        next: () => {
          console.log('Student created successfully');
          this.loadStudents();
          this.hideDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Student Created',
            life: 3000
          });
        },
        error: (error) => {
          console.error('Failed to create student:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create student: ' + (error.message || error.statusText || 'Unknown error'),
            life: 3000
          });
        }
      });
    }
  }

  hideDialog() {
    this.studentDialog.set(false);
    this.submitted.set(false);
  }
}
