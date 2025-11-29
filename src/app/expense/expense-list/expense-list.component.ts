import { Component, inject, OnInit, signal } from '@angular/core';
import { addMonths, format, set } from 'date-fns';
import { ModalController, ToastController, AlertController, PopoverController, NavParams } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  alertCircleOutline,
  arrowBack,
  arrowForward,
  chevronDown,
  chevronForward,
  pricetag,
  search,
  swapVertical
} from 'ionicons/icons';
import { Expense, ExpenseCriteria } from '../../shared/domain';
import { ExpenseService } from '../../shared/service/expense.service';
import { formatPeriod } from '../../shared/period';
import ExpenseModalComponent from '../expense-modal/expense-modal.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
  imports: [
    ReactiveFormsModule,
    KeyValuePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
    IonFooter,
    IonPopover
  ]
})
export default class ExpenseListComponent implements OnInit {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly popoverCtrl = inject(PopoverController);
  private readonly expenseService = inject(ExpenseService);

  // State
  date = set(new Date(), { date: 1 });
  expenses = signal<Expense[]>([]);
  loading = signal(false);
  page = signal(0);
  hasMore = signal(true);
  sortOption = signal('Date (newest first)');
  categoryOption = signal('Category');

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({
      swapVertical,
      pricetag,
      search,
      alertCircleOutline,
      add,
      arrowBack,
      arrowForward,
      chevronDown,
      chevronForward
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  // Actions

  addMonths = (number: number): void => {
    this.date = addMonths(this.date, number);
    this.page.set(0);
    this.expenses.set([]);
    this.hasMore.set(true);
    this.loadExpenses();
  };

  formatMonth(date: Date): string {
    return format(date, 'MMMM yyyy');
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd.MM.yyyy');
  }

  groupExpensesByDate(expenses: Expense[]): Map<string, Expense[]> {
    const grouped = new Map<string, Expense[]>();
    expenses.forEach((expense) => {
      const dateKey = format(new Date(expense.date), 'dd.MM.yyyy');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(expense);
    });
    // Sortiere Expenses innerhalb jeder Gruppe nach ID oder createdAt (neueste zuerst)
    grouped.forEach((expenseList) => {
      expenseList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }
        // Fallback: nach ID sortieren
        return (b.id || '').localeCompare(a.id || '');
      });
    });
    // Sortiere die Map nach Datum (neueste zuerst)
    return new Map(
      Array.from(grouped.entries()).sort((a, b) => {
        const dateA = new Date(a[0].split('.').reverse().join('-'));
        const dateB = new Date(b[0].split('.').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      })
    );
  }

  getGroupedExpenses(): Map<string, Expense[]> {
    const expensesList = this.expenses();
    if (!expensesList || expensesList.length === 0) {
      return new Map();
    }
    return this.groupExpensesByDate(expensesList);
  }

  loadExpenses(reset: boolean = false): void {
    if (this.loading()) return;

    const currentPage = reset ? 0 : this.page();

    this.loading.set(true);

    const criteria: ExpenseCriteria = {
      page: currentPage,
      size: 20,
      sort: 'date,desc',
      yearMonth: formatPeriod(this.date)
    };

    this.expenseService
      .findAll(criteria)
      .pipe(
        catchError((error) => {
          console.error('Error loading expenses:', error);
          // Keine Fehlermeldung beim ersten Laden - einfach leere Liste anzeigen
          return of({ content: [], last: true, totalElements: 0 });
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((page) => {
        if (reset) {
          this.expenses.set(page.content);
        } else {
          this.expenses.update((expenses) => [...expenses, ...page.content]);
        }
        this.page.set(currentPage + 1);
        this.hasMore.set(!page.last);
      });
  }

  async openAddModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: {
        expense: null
      }
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      console.log('Creating expense with data:', data);
      this.expenseService
        .create(data)
        .pipe(
          catchError((error) => {
            console.error('Error creating expense:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            const errorMessage = error?.error?.message || error?.message || 'Unbekannter Fehler';
            this.showToast(`Fehler beim Erstellen der Ausgabe: ${errorMessage}`, 'danger');
            return of(null);
          })
        )
        .subscribe({
          next: (expense) => {
            if (expense) {
              console.log('Expense created successfully:', expense);
              this.showToast('Ausgabe erfolgreich erstellt', 'success');
              this.page.set(0);
              this.expenses.set([]);
              this.hasMore.set(true);
              this.loadExpenses();
            }
          },
          error: (error) => {
            console.error('Subscription error:', error);
          }
        });
    }
  }

  async openEditModal(expense: Expense): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent,
      componentProps: {
        expense
      }
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      this.expenseService
        .update({ ...data, id: expense.id })
        .pipe(
          catchError((error) => {
            console.error('Error updating expense:', error);
            this.showToast('Fehler beim Aktualisieren der Ausgabe', 'danger');
            return of(null);
          })
        )
        .subscribe((updatedExpense) => {
          if (updatedExpense) {
            this.showToast('Ausgabe erfolgreich aktualisiert', 'success');
            this.page.set(0);
            this.expenses.set([]);
            this.hasMore.set(true);
            this.loadExpenses();
          }
        });
    } else if (role === 'delete') {
      await this.deleteExpense(expense.id);
    }
  }

  async deleteExpense(id: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Ausgabe löschen',
      message: 'Möchten Sie diese Ausgabe wirklich löschen?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => {
            this.expenseService
              .delete(id)
              .pipe(
                catchError((error) => {
                  console.error('Error deleting expense:', error);
                  this.showToast('Fehler beim Löschen der Ausgabe', 'danger');
                  return of(null);
                })
              )
              .subscribe(() => {
                this.showToast('Ausgabe erfolgreich gelöscht', 'success');
                this.page.set(0);
                this.expenses.set([]);
                this.hasMore.set(true);
                this.loadExpenses();
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  async openSortPopover(event: Event): Promise<void> {
    const sortOptions = [
      { label: 'Date (newest first)', value: 'Date (newest first)' },
      { label: 'Date (oldest first)', value: 'Date (oldest first)' },
      { label: 'Amount (highest first)', value: 'Amount (highest first)' },
      { label: 'Amount (lowest first)', value: 'Amount (lowest first)' }
    ];

    const popover = await this.popoverCtrl.create({
      component: ExpenseSortPopoverComponent,
      event: event,
      translucent: true,
      componentProps: {
        options: sortOptions,
        selectedValue: this.sortOption()
      }
    });

    await popover.present();
    const { data } = await popover.onWillDismiss();

    if (data) {
      this.sortOption.set(data);
    }
  }

  async openCategoryPopover(event: Event): Promise<void> {
    // Placeholder für Category-Popover
    console.log('Category popover');
  }
}

@Component({
  selector: 'app-expense-sort-popover',
  template: `
    <ion-list>
      @for (option of options; track option.value) {
        <ion-item
          button
          [class.selected]="option.value === selectedValue"
          (click)="select(option.value)"
        >
          <ion-label>{{ option.label }}</ion-label>
        </ion-item>
      }
    </ion-list>
  `,
  styles: [`
    ion-list {
      padding: 0;
    }
    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --min-height: 44px;
    }
    ion-item.selected {
      --background: rgba(var(--ion-color-primary-rgb), 0.14);
    }
  `],
  imports: [IonList, IonItem, IonLabel],
  standalone: true
})
class ExpenseSortPopoverComponent {
  options: any[] = [];
  selectedValue: string = '';

  private readonly navParams = inject(NavParams);
  private readonly popoverCtrl = inject(PopoverController);

  ngOnInit(): void {
    this.options = this.navParams.get('options') || [];
    this.selectedValue = this.navParams.get('selectedValue') || '';
  }

  select(value: string): void {
    this.popoverCtrl.dismiss(value, 'selected');
  }
}
