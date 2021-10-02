import { Component, OnInit } from "@angular/core";
import { first } from "rxjs/operators";

import { Audit } from "@/_models";
import { AuditService, AuthenticationService } from "@/_services";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({ templateUrl: "audit.component.html" })
export class AuditComponent implements OnInit {
  audits = [];
  auditsCopy = [];
  currentUser: any;
  pipePerameter = "dd/MM/yyyy, hh:mm:ss";
  selectedTimeFormat = 12;
  searchValueChanged: Subject<string> = new Subject<string>();
  p = 1;
  loginValue = "asc";
  logoutValue = "asc";
  constructor(
    private authenticationService: AuthenticationService,
    private auditService: AuditService
  ) {}

  ngOnInit() {
    this.loadAllAudits();
    this.authenticationService.currentUser.subscribe((data) => {
      this.currentUser = data;
    });
    this.searchValueChanged
      .pipe(
        debounceTime(400), // wait 400ms after the last event before emitting last event
        distinctUntilChanged() // only emit if value is different from previous value
      )
      .subscribe((value) => this.search(value));
  }

  changeFormat(value) {
    console.log(value);
    this.selectedTimeFormat = value;
    if (value == 12) this.pipePerameter = "dd/MM/yyyy, hh:mm:ss";
    else this.pipePerameter = "dd/MM/yyyy, HH:mm:ss";
  }
  changed(text: string) {
    this.searchValueChanged.next(text);
  }
  search(value) {
    this.auditsCopy = JSON.parse(JSON.stringify(this.audits));
    this.auditsCopy = this.auditsCopy.filter(
      (ele) => ele.id.includes(value) || ele.user.includes(value)
    );
    console.log(this.auditsCopy);
  }
  loginsort() {
    this.auditsCopy.sort((a, b) => {
      if (this.loginValue == "asc") {
        this.loginValue = "dsc";
        return new Date(a.loginTime) > new Date(b.loginTime) ? 1 : -1;
      } else {
        this.loginValue = "asc";
        return new Date(b.loginTime) > new Date(a.loginTime) ? 1 : -1;
      }
    });
  }
  logoutsort() {
    this.auditsCopy.sort((a, b) => {
      if (this.logoutValue == "asc") {
        this.logoutValue = "dsc";
        return new Date(a.logoutTime) > new Date(b.logoutTime) ? 1 : -1;
      } else {
        this.logoutValue = "asc";
        return new Date(b.logoutTime) > new Date(a.logoutTime) ? 1 : -1;
      }
    });
  }
  private loadAllAudits() {
    this.auditService
      .getAll()
      .pipe(first())
      .subscribe((audits) => {
        console.log(audits);
        this.audits = audits;
        this.auditsCopy = JSON.parse(JSON.stringify(audits));
      });
  }
}
