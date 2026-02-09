

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employees.model';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  // ✅ BASE CONTROLLER URL ONLY
  private readonly baseUrl = `${environment.apiUrl}/Employee`;

  /* ================= GET ALL EMPLOYEES ================= */
  getAllEmployees(): Observable<Employee[]> {

    if (!isPlatformBrowser(this.platformId)) {
      return new Observable<Employee[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.http.get<Employee[]>(`${this.baseUrl}/get-all-full`);
  }

  /* ================= ADD EMPLOYEE ================= */
  addEmployee(empName: string, deptName: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add`, {
      empName,
      deptName
    });
  }

  /* ================= DELETE EMPLOYEE ================= */
  deleteEmployee(empId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${empId}`);
  }

  /* ================= UPDATE EMPLOYEE NAME ================= */
//   updateEmployee(employee: Employee): Observable<any> {
//   return this.http.put<any>(`${this.baseUrl}/update-name`, {
//     empId: employee.empId,
//     empName: employee.empName
//   });
// }


updateEmployeeName(empId: number, empName: string) {
  return this.http.put<any>(
    `${this.baseUrl}/update-name/${empId}`,   // ✅ empId in URL
    { empName }                               // ✅ body ONLY empName
  );
}


  
}




