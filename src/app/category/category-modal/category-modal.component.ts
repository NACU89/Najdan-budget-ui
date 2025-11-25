import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, text } from 'ionicons/icons';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
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
    IonInput
  ]
})
export default class CategoryModalComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly fb = inject(FormBuilder);

  // State
  form: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({ close, save, text });
  }

  // Actions

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    if (this.form.valid) {
      this.modalCtrl.dismiss(this.form.value, 'save');
    }
  }
}
