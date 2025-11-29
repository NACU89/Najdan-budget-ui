import { Component, inject, OnInit, signal } from '@angular/core';
import { ModalController, AlertController, NavParams } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, calendar, cash, close, pricetag, save, text, trash } from 'ionicons/icons';
import { format } from 'date-fns';
import { Expense, Category } from '../../shared/domain';
import { CategoryService } from '../../shared/service/category.service';
import CategoryModalComponent from '../../category/category-modal/category-modal.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-expense-modal',
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonFooter
  ]
})
export default class ExpenseModalComponent implements OnInit {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly navParams = inject(NavParams);

  // Input
  expense: Expense | null = this.navParams.get('expense') || null;

  // State
  isEditMode = signal(false);
  categories = signal<Category[]>([]);
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    categoryId: [null],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    date: [format(new Date(), "yyyy-MM-dd"), Validators.required]
  });

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({ close, save, text, pricetag, add, cash, calendar, trash });
  }

  ngOnInit(): void {
    this.loadCategories();

    if (this.expense) {
      this.isEditMode.set(true);
      this.form.patchValue({
        name: this.expense.name,
        categoryId: this.expense.category?.id || null,
        amount: this.expense.amount,
        date: format(new Date(this.expense.date), "yyyy-MM-dd")
      });
    }
  }

  // Actions

  loadCategories(): void {
    this.categoryService
      .findAll({ sort: 'name,asc' })
      .pipe(
        catchError((error) => {
          console.error('Error loading categories:', error);
          return of([]);
        })
      )
      .subscribe((categories) => {
        this.categories.set(categories);
      });
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      
      // Bereite das DTO vor
      const amount = formValue.amount ? Number(formValue.amount) : null;
      if (!amount || amount < 0.01) {
        this.form.get('amount')?.setErrors({ min: true });
        this.form.get('amount')?.markAsTouched();
        return;
      }
      
      const dto: any = {
        name: formValue.name?.trim() || '',
        amount: amount,
        date: this.formatDateForApi(formValue.date),
      };
      
      // Wenn categoryId vorhanden und nicht leer ist, füge es hinzu
      if (formValue.categoryId && formValue.categoryId !== '' && formValue.categoryId !== null) {
        dto.categoryId = formValue.categoryId;
      }
      
      this.modalCtrl.dismiss(dto, 'save');
    } else {
      // Markiere alle Felder als touched, um Fehler anzuzeigen
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  private formatDateForApi(dateValue: string | Date): string {
    if (!dateValue) {
      return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
    }
    
    let date: Date;
    
    // ion-datetime gibt das Datum als ISO-String zurück (z.B. "2025-11-29T00:00:00")
    if (typeof dateValue === 'string') {
      // Wenn es nur das Datum ist (yyyy-MM-dd), füge Zeit hinzu
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(dateValue + 'T00:00:00');
      } else {
        date = new Date(dateValue);
      }
    } else {
      date = dateValue;
    }
    
    // Stelle sicher, dass das Datum gültig ist
    if (isNaN(date.getTime())) {
      date = new Date();
    }
    
    // Formatiere als ISO 8601 String (yyyy-MM-ddTHH:mm:ss)
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  }

  async delete(): Promise<void> {
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
            this.modalCtrl.dismiss(null, 'delete');
          }
        }
      ]
    });

    await alert.present();
  }

  async showCategoryModal(): Promise<void> {
    const categoryModal = await this.modalCtrl.create({ component: CategoryModalComponent });
    await categoryModal.present();
    const { data, role } = await categoryModal.onWillDismiss();

    if (role === 'save' && data) {
      // Kategorie wurde erstellt, neu laden
      this.loadCategories();
    }
  }
}
