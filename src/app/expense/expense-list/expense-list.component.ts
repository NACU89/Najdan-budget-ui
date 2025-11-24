import { Component, inject } from '@angular/core';
import { addMonths, format, set } from 'date-fns';
import { ModalController } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
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
import ExpenseModalComponent from '../expense-modal/expense-modal.component';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
  imports: [
    ReactiveFormsModule,
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
    IonFabButton
  ]
})
export default class ExpenseListComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);

  // State
  date = set(new Date(), { date: 1 });

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

  // Actions

  addMonths = (number: number): void => {
    this.date = addMonths(this.date, number);
  };

  formatMonth(date: Date): string {
    return format(date, 'MMMM yyyy');
  }

  async openAddModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ExpenseModalComponent
    });
    await modal.present();
  }
}
