import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as _moment from 'moment';
const moment = _moment || _moment;
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { DefaultService } from 'src/app/service/default.service';
import { MatDialog } from '@angular/material/dialog';
import { ReportService } from 'src/app/service/report-service/report-service';
import { ModalReportComponent } from '../Modal/modal-report/modal-report.component';
import Swal from 'sweetalert2';
import { ModalReportStockProductComponent } from '../ReportStock/Modal/Product/modal-product/modal-product.component';
import { ModalCustomerComponent } from '../Modal/modal-customer/modal-customer.component';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-report-sale',
  templateUrl: './report-sale.component.html',
  styleUrls: ['./report-sale.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ReportSaleComponent implements OnInit {
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  date = new FormControl(moment());
  myGroup: FormGroup;
  headerCard = "รายงานการขาย";
  isPdf: string = "";
  isExcel: string = "";
  excelUrl: string = "";
  modelDate = '';
  private authPositionRole: any;
  private reportUrl: string = "";
  private reportName: string = "";
  selectedStatus: number ;
  selectedType: number ;
  parameterMonthly: any;
  parameterDaily: any;
  parameterBranchType: any;
  parameterUnit: any;
  parameterReportType: any;
  parameterDocType: any;
  parameterCustomer: any;
  parameterProduct: any;
  hiddenFormControl: boolean = true;

  constructor(
    private sharedService: SharedService,
    private defaultService: DefaultService,
    public dialog: MatDialog,
    private reportService: ReportService,
    private authGuard: AuthGuard,
  ) { }

  isUserAuthenticated = (): boolean => {
    return this.authGuard.canActivate();
  }

  ngOnInit(): void {
    this.authPositionRole = this.defaultService.GetAuthPositionRole();
    if (this.authPositionRole === undefined || this.authPositionRole.isView !== 'Y') {
      window.location.href = "/NoPermission";
      return;
    }

    let dateStart = new Date(new Date(this.sharedService.systemDate).setDate(new Date(this.sharedService.systemDate).getDate() - 1));
    let dateEnd = new Date(this.sharedService.systemDate);
    this.dateRange.get('start').setValue(dateStart);
    this.dateRange.get('end').setValue(dateEnd);
    this.myGroup = new FormGroup({
      reportGroup: new FormControl(),
      statusOption: new FormControl(),
      selectedType: new FormControl(),
      productIdStart: new FormControl(),
      productIdEnd: new FormControl(),
      customerIdStart: new FormControl(),
      customerIdEnd: new FormControl(),
    });
    this.selectedStatus = 0;
    this.selectedType = 0;
  }

  setMonthAndYear(
    normalizedMonthAndYear: _moment.Moment,
    datepicker: MatDatepicker<_moment.Moment>
  ) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

  ShowModalReportGroup() {
    // if(!this.defaultService.ValidatePositionRole(this.PositionRole , "IsPrint")){
    //   this.defaultService.ShowPositionRoleMessage("IsPrint");
    //   return;
    // }
    const dialogRef = this.dialog.open(ModalReportComponent, {
      width: '600px',
      data: { reportGroup: "ReportSales" }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.myGroup.controls['reportGroup'].setValue(result.reportName);
      this.reportUrl = result.reportUrl;
      this.reportName = result.reportName;
      this.isPdf = result.isPdf;
      this.isExcel = result.isExcel;
      this.excelUrl = result.excelUrl;
      this.hiddenFormControl = false;
      let jsonData = JSON.parse(result.parameterType)
      this.parameterMonthly = jsonData.Parameter.find((x: string) => x == 'Monthly');
      this.parameterDaily = jsonData.Parameter.find((x: string) => x == 'Daily');
      this.parameterBranchType = jsonData.Parameter.find((x: string) => x == 'Branch');
      this.parameterUnit = jsonData.Parameter.find((x: string) => x == 'Unit');
      this.parameterReportType = jsonData.Parameter.find((x: string) => x == 'ReportType');
      this.parameterDocType = jsonData.Parameter.find((x: string) => x == 'DocType');
      this.parameterCustomer = jsonData.Parameter.find((x: string) => x == 'Customer');
      this.parameterProduct = jsonData.Parameter.find((x: string) => x == 'Product');
    });
  }

  ShowModalProductStart() {
    const dialogRef = this.dialog.open(ModalReportStockProductComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.myGroup.controls['productIdStart'].setValue(result.productId);
    });
  }

  ShowModalProductEnd() {
    const dialogRef = this.dialog.open(ModalReportStockProductComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.myGroup.controls['productIdEnd'].setValue(result.productId);
    });
  }

  ShowModalCustomerStart() {
    const dialogRef = this.dialog.open(ModalCustomerComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.myGroup.controls['customerIdStart'].setValue(result.custCode);
    });
  }

  ShowModalCustomerEnd() {
    const dialogRef = this.dialog.open(ModalCustomerComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.myGroup.controls['customerIdEnd'].setValue(result.custCode);
    });
  }

  async exportPDF() {
    await this.defaultService.DoActionAsync(async () => await this.ExportPDF(), true);
  }

  private async ExportPDF() {
    if (!this.defaultService.ValidateAuthPositionRole(this.authPositionRole, "isPrint")) {
      this.defaultService.ShowPositionRoleMessage("IsPrint");
      return;
    }
    var dateStart: string = "";
    var dateEnd: string = "";
    var productIdStart = this.myGroup.get('productIdStart').value;
    var productIdEnd = this.myGroup.get('productIdEnd').value;
    var customerIdStart = this.myGroup.get('customerIdStart').value;
    var customerEnd = this.myGroup.get('customerIdEnd').value;

    if (this.parameterMonthly !== undefined && this.parameterMonthly != null) {
      const monthSelect = this.defaultService.GetFormatDate(this.date.value)
      const monthSelectDate = new Date(monthSelect);
      const firstDay = new Date(monthSelectDate.getFullYear(), monthSelectDate.getMonth(), 1);
      const lastDay = new Date(monthSelectDate.getFullYear(), monthSelectDate.getMonth() + 1, 0);
      dateStart = this.defaultService.GetFormatDate(firstDay);
      dateEnd = this.defaultService.GetFormatDate(lastDay);
    }
    else if (this.parameterDaily !== undefined && this.parameterDaily != null) {
      dateStart = this.defaultService.GetFormatDate(this.dateRange?.value?.start);
      dateEnd = this.defaultService.GetFormatDate(this.dateRange?.value?.end);
    }
    Swal.fire({
      title: 'กำลังโหลดข้อมูล กรุณารอสักครู่',
      allowEscapeKey: false,
      allowOutsideClick: false,
    });
    Swal.showLoading();

    await this.reportService.GetReportSalePDF(this.sharedService.compCode, this.sharedService.brnCode, dateStart, dateEnd, this.selectedStatus, this.selectedType, productIdStart, productIdEnd, customerIdStart, customerEnd, this.reportUrl, this.reportName);
  }

  async exportExcel() {
    await this.defaultService.DoActionAsync(async () => await this.ExportExcel(), true);
  }

  private async ExportExcel() {
    if (!this.defaultService.ValidateAuthPositionRole(this.authPositionRole, "isPrint")) {
      this.defaultService.ShowPositionRoleMessage("IsPrint");
      return;
    }
    var dateStart: string = "";
    var dateEnd: string = "";
    var productIdStart = this.myGroup.get('productIdStart').value;
    var productIdEnd = this.myGroup.get('productIdEnd').value;
    var customerIdStart = this.myGroup.get('customerIdStart').value;
    var customerEnd = this.myGroup.get('customerIdEnd').value;

    if (this.parameterMonthly !== undefined && this.parameterMonthly != null) {
      const monthSelect = this.defaultService.GetFormatDate(this.date.value)
      const monthSelectDate = new Date(monthSelect);
      const firstDay = new Date(monthSelectDate.getFullYear(), monthSelectDate.getMonth(), 1);
      const lastDay = new Date(monthSelectDate.getFullYear(), monthSelectDate.getMonth() + 1, 0);
      dateStart = this.defaultService.GetFormatDate(firstDay);
      dateEnd = this.defaultService.GetFormatDate(lastDay);
    }
    else if (this.parameterDaily !== undefined && this.parameterDaily != null) {
      dateStart = this.defaultService.GetFormatDate(this.dateRange?.value?.start);
      dateEnd = this.defaultService.GetFormatDate(this.dateRange?.value?.end);
    }
    Swal.fire({
      title: 'กำลังโหลดข้อมูล กรุณารอสักครู่',
      allowEscapeKey: false,
      allowOutsideClick: false,
    });
    Swal.showLoading();

    await this.reportService.GetReportSaleExcel(this.sharedService.compCode, this.sharedService.brnCode, dateStart, dateEnd, this.selectedStatus, this.selectedType, productIdStart, productIdEnd, customerIdStart, customerEnd, this.excelUrl, this.reportName);
  }
}
