import { Component, inject, signal } from '@angular/core';
import { ModalController, PopoverController, NavParams } from '@ionic/angular/standalone';
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
  IonPopover,
  IonSearchbar,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, chevronDown, chevronForward, search, swapVertical, triangle } from 'ionicons/icons';
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
    IonToggle,
    IonPopover
  ]
})
export default class CategoryListComponent {
  // DI
  private readonly modalCtrl = inject(ModalController);
  private readonly popoverCtrl = inject(PopoverController);

  // State
  sortOption = signal<{ label: string; value: string; icon?: string }>({
    label: 'Name (A-Z)',
    value: 'name,asc',
    icon: 'triangle'
  });

  sortOptions = [
    { label: 'Created at (newest first)', value: 'createdAt,desc' },
    { label: 'Created at (oldest first)', value: 'createdAt,asc' },
    { label: 'Name (A-Z)', value: 'name,asc', icon: 'triangle' },
    { label: 'Name (Z-A)', value: 'name,desc' }
  ];

  // Lifecycle

  constructor() {
    // Add all used Ionic icons
    addIcons({ swapVertical, search, add, chevronDown, chevronForward, triangle });
  }

  // Actions

  async openModal(): Promise<void> {
    const modal = await this.modalCtrl.create({ component: CategoryModalComponent });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    console.log('role', role);
  }

  async openSortPopover(event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: SortPopoverComponent,
      event: event,
      translucent: true,
      componentProps: {
        options: this.sortOptions,
        selectedValue: this.sortOption().value
      }
    });

    await popover.present();
    const { data } = await popover.onWillDismiss();

    if (data) {
      const selected = this.sortOptions.find(opt => opt.value === data);
      if (selected) {
        this.sortOption.set(selected);
      }
    }
  }
}

@Component({
  selector: 'app-sort-popover',
  template: `
    <ion-list>
      @for (option of options; track option.value) {
        <ion-item
          button
          [class.selected]="option.value === selectedValue"
          (click)="select(option.value)"
        >
          <ion-label>{{ option.label }}</ion-label>
          @if (option.icon && option.value === selectedValue) {
            <ion-icon name="triangle" slot="end" />
          }
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
    ion-item.selected ion-icon {
      color: var(--ion-color-primary);
    }
  `],
  imports: [IonList, IonItem, IonLabel, IonIcon],
  standalone: true
})
class SortPopoverComponent {
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
