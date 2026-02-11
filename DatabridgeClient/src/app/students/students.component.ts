import { Component, OnInit, inject, signal, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { StudentService } from '../services/student.service';
import { Student } from '../models/student.model';
import { UiModule } from '../app.module';
import { HttpClient } from '@angular/common/http';

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
  private readonly http = inject(HttpClient);


  students = signal<Student[]>([]);
  studentDialog = signal(false);
  student = signal<Student>({ studentName: '', age: 0, deptName: '' });
  submitted = signal(false);
  isEditMode = signal(false);
  selectedStudent = signal<Student | null>(null);

  uploadDialog = signal(false);
  selectedFile = signal<File | null>(null);
  fileError = signal<string | null>(null);


  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

 
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
  openUpload() {
  this.resetUpload();
  this.uploadDialog.set(true);
}

resetUpload() {
  this.selectedFile.set(null);
  this.fileError.set(null);

  // Clear native file input (browser-level)
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }
}


hideUpload() {
  this.uploadDialog.set(false);
  this.resetUpload();
}

onFileSelect(event: any) {
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

uploadExcel() {
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
