import { Component,OnInit,inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MemberService } from '../services/member.service';
import { Member } from '../models/Member.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import {MessageService, ConfirmationService } from 'primeng/api';
import { UiModule } from '../app.module';
//import { Member } from '../models/Member.model';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [UiModule],
  providers:[MessageService,ConfirmationService],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  private readonly memberService = inject(MemberService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  members = signal<Member[]>([]);
  memberDialog = signal(false);
  member = signal<Member>({
   
    bookname: '',
    memberName: '',
    memberAge: 0
  });

  submitted = signal(false);
  isEditMode = signal(false);

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getAllMembers().subscribe({
      next: (data) => {
        this.members.set(data);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load members',
          life: 3000
        });
      }
    });
  } 

 
  // open new dialog
  openNew() {
    this.member.set({
      memberid: 0,
      bookname: '',
      memberName: '',
      memberAge: 0
    });
    this.submitted.set(false);
    this.isEditMode.set(false);
    this.memberDialog.set(true);
  }

  // edit member
  editMember(member: Member) {
    this.member.set({ ...member });
    this.isEditMode.set(true);
    this.memberDialog.set(true);
  }

  // close dialog
  hideDialog() {
    this.memberDialog.set(false);
    this.submitted.set(false);
  }

  // save member (add or update)
saveMember() {
  const current = this.member();
  
  if (!this.isEditMode()) {
    // CREATE
    this.memberService.createMember(current).subscribe({
      next: () => {
        this.loadMembers(); // Refresh list from DB
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Member Created Successfully' });
        this.hideDialog();
      },
      error: (err) => console.error("Create failed", err)
    });
  } else {
    // UPDATE
    if (current.memberid) {
      this.memberService.updateMember(current.memberid, current).subscribe({
        next: () => {
          this.loadMembers(); // Refresh list from DB
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Member Updated Successfully' });
          this.hideDialog();
        }
      });
    }
  }
}

// delete member
deleteMember(member: Member) {
  this.confirmationService.confirm({
    message: `Are you sure you want to delete ${member.memberName}?`,
    accept: () => {
      if (member.memberid) {
        this.memberService.deleteMember(member.memberid).subscribe({
          next: () => {
            this.loadMembers(); // Refresh list
            this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Member Removed' });
          }
        });
      }
    }
  });
}
  
}
