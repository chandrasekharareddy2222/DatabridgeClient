
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/Employee.model';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  // ✅ BASE CONTROLLER URL ONLY
  private readonly apiUrl = `${environment.apiUrl}/Employees`;

  /* ================= GET ALL EMPLOYEES ================= */
  getAllEmployees(): Observable<Employee[]> {
    
  return this.http.get<Employee[]>(this.apiUrl);
}

/* ================= ADD/CREATE EMPLOYEE ================= */

createEmployee(employee: Employee): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/add-employee`, employee);
}

/* ================= UPDATE EMPLOYEE ================= */
updateEmployeeName(empId: number, employee: Employee): Observable<Employee> {
  // ✅ Added 'update-employee' to match your C# [HttpPut("update-employee/{empId}")]
  return this.http.put<Employee>(`${this.apiUrl}/update-employee/${empId}`, employee);
}

/* ================= DELETE EMPLOYEE ================= */
deleteEmployee(empId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/delete-employee/${empId}`);
}
}