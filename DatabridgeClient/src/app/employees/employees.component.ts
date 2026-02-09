import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employees.model';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  private readonly employeeService: EmployeeService = inject(EmployeeService);
  private readonly messageService: MessageService = inject(MessageService);
  private readonly confirmationService: ConfirmationService = inject(ConfirmationService);

  employees = signal<Employee[]>([]);
  employeeDialog = signal(false);

  employee = signal<Employee>({
    empId: 0,
    empName: '',
    deptName: ''
  });

  submitted = signal(false);
  isEditMode = signal(false);

  ngOnInit() {
    this.loadEmployees();
  }

  /* GET ALL */

  loadEmployees() {
    console.log('Loading Employees from API...');
    this.employeeService.getAllEmployees().subscribe({
      next: (data ) => {
        console.log('employees loaded successfully:', data)
        this.employees.set(data);
      },
      error: (err) => {
          console.error('Error loading employees:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to load employees:${err.status} ${err.statusText || err.message}`,
          life: 4000
        });
    
      }
    });
  }


  /* OPEN NEW */
  openNew() {
    this.employee.set({
      empId: 0,
      empName: '',
      deptName: ''
    });
    this.submitted.set(false);
    this.isEditMode.set(false);
    this.employeeDialog.set(true);
  }

  /* EDIT */
  editEmployee(emp: Employee) {
    this.employee.set({ ...emp });
    this.isEditMode.set(true);
    this.employeeDialog.set(true);
  }
 
  

  /* DELETE */
  deleteEmployee(emp: Employee) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${emp.empName}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (emp.empId) {
          this.employeeService.deleteEmployee(emp.empId).subscribe({
            next: (res: any) => {
              this.loadEmployees();
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: res?.message || 'Employee deleted',
                life: 3000
              });
            },
            error: (err: unknown) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete employee',
                life: 3000
              });
             
            }
          });
        }
      }
    });
  }

  /* CLOSE DIALOG */
  hideDialog() {
    this.employeeDialog.set(false);
    this.submitted.set(false);
  }

  /* SAVE (ADD / UPDATE) */
  saveEmployee() {
    this.submitted.set(true);

    if (!this.employee().empName?.trim()) return;

    // if (this.isEditMode()) {
    //   // UPDATE (SP_UpdateEmployeeName)
    //   this.employeeService
    //     .updateEmployeeName(this.employee().empId!, this.employee().empName)
    //     .subscribe({
    //       next: (res: any) => {
    //         this.loadEmployees();
    //         this.messageService.add({
    //           severity: 'success',
    //           summary: 'Successful',
    //           detail: res?.message || 'Employee updated',
    //           life: 3000
    //         });
    //         this.employeeDialog.set(false);
    //       },
    //       error: (err: unknown) => {
    //         this.messageService.add({
    //           severity: 'error',
    //           summary: 'Error',
    //           detail: 'Failed to update employee',
    //           life: 3000
    //         });
    //         }
    //     });

// if (this.isEditMode()) {
//   // UPDATE (FULL EMPLOYEE)
//   this.employeeService
//     .updateEmployee(this.employee())   // ✅ empId + empName + deptName
//     .subscribe({
//       next: (res: any) => {
//         this.loadEmployees();
//         this.messageService.add({
//           severity: 'success',
//           summary: 'Successful',
//           detail: res?.message || 'Employee updated',
//           life: 3000
//         });
//         this.employeeDialog.set(false);
//       },
//       error: (err: any) => {
//         console.error('Update error:', err);
//         this.messageService.add({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Failed to update employee',
//           life: 3000
//         });
//       }
//     });
// }
if (this.isEditMode()) {

  const empId = this.employee().empId;
  const empName = this.employee().empName;

  this.employeeService
    .updateEmployeeName(empId!, empName)
    .subscribe({
      next: (res: any) => {

        // ✅ backend validation message
        if (res?.message && res.message !== 'Employee updated successfully') {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: res.message,
            life: 3000
          });
          return;
        }

        this.loadEmployees();
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: res.message,
          life: 3000
        });
        this.employeeDialog.set(false);
      },
      error: (err) => {
        console.error('Update error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update employee',
          life: 3000
        });
      }
    });
}


    else {
      // CREATE (SP_AddEmployee)
      this.employeeService.addEmployee(
        this.employee().empName,
        this.employee().deptName
      ).subscribe({
        next: (res: any) => {
          this.loadEmployees();
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: res?.message || 'Employee added',
            life: 3000
          });
          this.employeeDialog.set(false);
          this.employee.set({empName: '', deptName: ''});
        },
        error: (err: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add employee',
            life: 3000
          });
          console.error('addEmployee error', err);
        }
      });
    }
  }

  /* ================= TOAST ================= */
  private toast(severity: 'success' | 'error', detail: string) {
    this.messageService.add({
      severity,
      summary: severity === 'success' ? 'Success' : 'Error',
      detail,
      life: 3000
    });
  }
}
