import { Component, OnInit } from '@angular/core';
import { TestFirebaseService } from './test-firebase.service';
import { FormsModule } from '@angular/forms'; // Ajoutez cette ligne
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TESTComponent implements OnInit {
  items: any[] = [];
  newItemName: string = '';

  constructor(private firebaseService: TestFirebaseService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.firebaseService.getItems().subscribe(
      (data) => {
        this.items = data;
        console.log('Données chargées depuis Firebase:', data);
      },
      (error) => {
        console.error('Erreur lors du chargement des données:', error);
      }
    );
  }

  addItem() {
    if (this.newItemName.trim()) {
      const newItem = {
        name: this.newItemName,
        createdAt: new Date(),
      };

      this.firebaseService
        .addItem(newItem)
        .then(() => {
          console.log('Item ajouté avec succès!');
          this.newItemName = '';
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout:", error);
        });
    }
  }

  deleteItem(itemId: string) {
    this.firebaseService
      .deleteItem(itemId)
      .then(() => {
        console.log('Item supprimé avec succès!');
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression:', error);
      });
  }
}
