import {
  Component,
  OnInit,
  inject,
  signal,
  PLATFORM_ID,
  ViewChild,
  ElementRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { StudentService } from '../services/student.service';
import { Student } from '../models/student.model';
import { DeleteBatchResponse } from '../models/delete-batch-response.model';
import { UiModule } from '../app.module';

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

  // =========================
  // Dependency Injection
  // =========================
  private readonly studentService = inject(StudentService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  // =========================
  // Signals - Data State
  // =========================
  students = signal<Student[]>([]);
  student = signal<Student>({ studentName: '', age: 0, deptName: '' });

  // =========================
  // Signals - Dialog State
  // =========================
  studentDialog = signal(false);
  uploadDialog = signal(false);

  // =========================
  // Signals - Form State
  // =========================
  submitted = signal(false);
  isEditMode = signal(false);
  selectedStudent = signal<Student | null>(null);

  // =========================
  // Signals - Upload State
  // =========================
  selectedFile = signal<File | null>(null);
  fileError = signal<string | null>(null);

  // =========================
  // Signals - Bulk Selection
  // =========================
  selectedStudents = signal<Student[]>([]);
  // =========================
  // Signals - Department Validation
  // =========================
  departments = signal<string[]>([]);
  nameError = signal<string | null>(null);
  ageError = signal<string | null>(null);
  deptError = signal<string | null>(null);


  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  // =========================
  // Lifecycle
  // =========================
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStudents();
    }
  }

  // =========================
  // Load Students
  // =========================
  loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (data) => this.students.set(data),
      
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load students',
          life: 3000
        });
      }
    });
  }

  // =========================
  // Create / Edit
  // =========================
  openNew(): void {
    this.student.set({ studentName: '', age: 0, deptName: '' });
    this.submitted.set(false);
    this.isEditMode.set(false);
    this.selectedStudent.set(null);
    this.studentDialog.set(true);
  }

  editStudent(student: Student): void {
    this.student.set({ ...student });
    this.selectedStudent.set(student);
    this.isEditMode.set(true);
    this.studentDialog.set(true);
  }
  onNameChange(value: string) {
  this.student.update(s => ({ ...s, studentName: value }));
  this.nameError.set(null);  
}

onAgeChange(value: number) {
  this.student.update(s => ({ ...s, age: value }));
  this.ageError.set(null);  
}

onDeptChange(value: string) {
  this.student.update(s => ({ ...s, deptName: value }));
  this.deptError.set(null);   
}

saveStudent(): void {
  this.submitted.set(true);

  // Reset previous errors
  this.nameError.set(null);
  this.ageError.set(null);
  this.deptError.set(null);

  const student = this.student();

  // Frontend validation
  if (!student.studentName?.trim()) {
    this.nameError.set('Name is required');
    return;
  }

  if (!student.age || student.age <= 0) {
    this.ageError.set('Valid age is required');
    return;
  }

  if (!student.deptName?.trim()) {
    this.deptError.set('Department is required');
    return;
  }

  // Decide create or update
  const request$ =
    this.isEditMode() && this.selectedStudent()?.id
      ? this.studentService.update(this.selectedStudent()!.id!, student)
      : this.studentService.create(student);

  request$.subscribe({
    next: () => {
      this.loadStudents();
      this.hideDialog();

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: this.isEditMode()
          ? 'Student updated successfully'
          : 'Student created successfully',
        life: 3000
      });
    },

    error: (err) => {
      this.handleBackendError(err);
    }
  });
}
private handleBackendError(err: any): void {

  // 409 - Conflict (Department not exists)
  if (err.status === 409 && err.error?.message) {

    if (err.error.message.toLowerCase().includes('department')) {
      this.deptError.set(err.error.message);
      return;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Conflict',
      detail: err.error.message,
      life: 3000
    });
    return;
  }

  // 400 - Model validation errors
  if (err.status === 400) {

    // If ASP.NET ModelState errors
    if (err.error?.errors) {

      if (err.error.errors.StudentName) {
        this.nameError.set(err.error.errors.StudentName[0]);
      }

      if (err.error.errors.Age) {
        this.ageError.set(err.error.errors.Age[0]);
      }

      return;
    }

    // 🔥 If custom validation message
    if (err.error?.message) {

      const message = err.error.message.toLowerCase();

      if (message.includes('name')) {
        this.nameError.set(err.error.message);
        return;
      }

      if (message.includes('age')) {
        this.ageError.set(err.error.message);
        return;
      }

      if (message.includes('department')) {
        this.deptError.set(err.error.message);
        return;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: err.error.message,
        life: 3000
      });

      return;
    }
  }

  // Fallback
  this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Unexpected error occurred.',
    life: 3000
  });
}


updateAgeFromInput(value: number | null) {
  const s = this.student();
  this.student.set({
    studentName: s.studentName,
    deptName: s.deptName,
    age: value ?? 0
  });
}


   isFormInvalid(): boolean {
    const s = this.student();

    return (
      !s.studentName?.trim() ||
      !s.age ||
      s.age <= 0 ||
      !s.deptName?.trim()
    );
  }

  hideDialog(): void {
    this.studentDialog.set(false);
    this.submitted.set(false);
  }

  // =========================
  // Single Delete
  // =========================
  deleteStudent(student: Student): void {
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

  // =========================
  // Bulk Delete
  // =========================
  hasSelection(): boolean {
    return this.selectedStudents().length > 0;
  }

  deleteSelectedStudents(): void {
    const ids = this.selectedStudents()
      .map(s => s.id)
      .filter((id): id is number => id !== undefined);

    if (ids.length === 0) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${ids.length} selected student(s)?`,
      header: 'Confirm Bulk Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.studentService.deleteBulk(ids).subscribe({
          next: (response: DeleteBatchResponse) => {
            const deleted = response.deletedRows;
            const missing = response.missingIds;

            this.loadStudents();
            this.selectedStudents.set([]);

            if (missing.length > 0) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Partial Success',
                detail: `${deleted} deleted. Missing IDs: ${missing.join(', ')}`,
                life: 4000
              });
            } else {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `${deleted} student(s) deleted successfully`,
                life: 3000
              });
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Bulk delete failed',
              life: 3000
            });
          }
        });
      }
    });
  }

  // =========================
  // Upload
  // =========================
  openUpload(): void {
    this.resetUpload();
    this.uploadDialog.set(true);
  }

  hideUpload(): void {
    this.uploadDialog.set(false);
    this.resetUpload();
  }

  resetUpload(): void {
    this.selectedFile.set(null);
    this.fileError.set(null);

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onFileSelect(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ['.xlsx', '.csv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowed.includes(ext)) {
      this.fileError.set('Only Excel (.xlsx) and CSV (.csv) files are supported.');
      return;
    }

    this.selectedFile.set(file);
    this.fileError.set(null);
  }

  uploadExcel(): void {
    if (!this.selectedFile()) {
      this.fileError.set('Please choose a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile()!);

    this.http.post<any>(
      'https://localhost:7162/api/Student/upload-excel',
      formData
    ).subscribe({
      next: (response) => {
        const insertedCount = response.recordsInserted;

        this.messageService.add({
          severity: 'success',
          summary: 'Upload Successful',
          detail: insertedCount === 0
            ? '0 records inserted. All students already exist.'
            : `${insertedCount} record(s) inserted successfully`,
          life: 3000
        });

        this.hideUpload();
        this.loadStudents();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'Unable to upload the selected file',
          life: 3000
        });
      }
    });
  }
}
