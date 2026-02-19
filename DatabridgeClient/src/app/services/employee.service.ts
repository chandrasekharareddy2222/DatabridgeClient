
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
  
  // BASE CONTROLLER URL ONLY
  private readonly apiUrl = 'https://localhost:7162/api/Employees'; 

   /* ================= GET ALL EMPLOYEES ================= */
  getAllEmployees(): Observable<Employee[]> {

    return this.http.get<Employee[]>(this.apiUrl);
  }

/* ================= ADD/CREATE EMPLOYEE ================= */

  createEmployee(employee: Employee): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-employee`, employee);
  }

/* ================= UPDATE EMPLOYEE ================= */
  updateEmployeeName(id: number, employee: Employee): Observable<any> {
    // UPDATED: Appended /update-employee/{id} to match C# [HttpPut("update-employee/{empId}")]
    return this.http.put<any>(`${this.apiUrl}/update-employee/${id}`, employee);
  }

/* ================= DELETE EMPLOYEE ================= */
  deleteEmployee(id: number): Observable<any> {
    // UPDATED: Appended /delete-employee/{id} to match C# [HttpDelete("delete-employee/{empId}")]
    return this.http.delete<any>(`${this.apiUrl}/delete-employee/${id}`);
  }
}