import { Component, inject } from '@angular/core';
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
  IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, chevronDown, chevronForward, search, swapVertical } from 'ionicons/icons';
import CategoryModalComponent from '../category-modal/category-modal.component';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
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
    IonFabButton,
    IonToggle
  ]
})
export default class CategoryListComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({ swapVertical, search, add, chevronDown, chevronForward });
  }

  // Actions

  async openModal(): Promise<void> {
    const modal = await this.modalCtrl.create({ component: CategoryModalComponent });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    console.log('role', role);
  }
}
