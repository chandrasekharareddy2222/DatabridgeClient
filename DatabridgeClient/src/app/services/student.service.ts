import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Student } from '../models/student.model';
import { DeleteBatchResponse } from '../models/delete-batch-response.model';


@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Student`;

  getAll(): Observable<Student[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(items => (items || []).map(i => ({
        id: i._studentID ?? i.studentID ?? i.StudentID ?? i.id ?? i.studentId ?? undefined,
        studentName: i.studentName,
        age: i.age,
        deptName: i.deptName
      })))
    );
  }

  getById(id: number): Observable<Student> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(i => ({
        id: i?._studentID ?? i?.studentID ?? i?.StudentID ?? i?.id ?? i?.studentId ?? undefined,
        studentName: i?.studentName,
        age: i?.age,
        deptName: i?.deptName
      }))
    );
  }

  create(data: Student): Observable<Student> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(i => ({
        id: i?._studentID ?? i?.studentID ?? i?.StudentID ?? i?.id ?? i?.studentId ?? undefined,
        studentName: i?.studentName,
        age: i?.age,
        deptName: i?.deptName
      }))
    );
  }

  update(id: number, data: Student): Observable<Student> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(i => ({
        id: i?._studentID ?? i?.studentID ?? i?.StudentID ?? i?.id ?? i?.studentId ?? id,
        studentName: i?.studentName ?? data.studentName,
        age: i?.age ?? data.age,
        deptName: i?.deptName ?? data.deptName
      }))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  deleteBulk(ids: number[]): Observable<DeleteBatchResponse> {
  return this.http.post<DeleteBatchResponse>(
    `${this.apiUrl}/delete-batch`,
    ids
  );
}


}

