import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TESTComponent } from './test.component';
import { TestFirebaseService } from './test-firebase.service';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

describe('TESTComponent', () => {
  let component: TESTComponent;
  let fixture: ComponentFixture<TESTComponent>;
  let firebaseServiceSpy: jasmine.SpyObj<TestFirebaseService>;

  // Données fictives pour les tests
  const mockItems = [
    { id: '1', name: 'Item 1', createdAt: new Date() },
    { id: '2', name: 'Item 2', createdAt: new Date() },
  ];

  beforeEach(async () => {
    // Création d'un mock pour le service Firebase
    const spy = jasmine.createSpyObj('TestFirebaseService', [
      'getItems',
      'addItem',
      'deleteItem',
    ]);

    await TestBed.configureTestingModule({
      imports: [FormsModule, TESTComponent],
      providers: [{ provide: TestFirebaseService, useValue: spy }],
    }).compileComponents();

    firebaseServiceSpy = TestBed.inject(
      TestFirebaseService
    ) as jasmine.SpyObj<TestFirebaseService>;

    // Configuration du comportement par défaut des méthodes mock
    firebaseServiceSpy.getItems.and.returnValue(of(mockItems));
    firebaseServiceSpy.addItem.and.returnValue(Promise.resolve());
    firebaseServiceSpy.deleteItem.and.returnValue(Promise.resolve());
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TESTComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait charger les items au démarrage', () => {
    fixture.detectChanges(); // Déclenche ngOnInit
    expect(firebaseServiceSpy.getItems).toHaveBeenCalled();
    expect(component.items).toEqual(mockItems);
  });

  it('devrait afficher un message quand la liste est vide', () => {
    // Simuler une liste vide
    firebaseServiceSpy.getItems.and.returnValue(of([]));
    fixture.detectChanges();

    const emptyStateElement = fixture.debugElement.query(
      By.css('.empty-state')
    );
    expect(emptyStateElement).toBeTruthy();
    expect(emptyStateElement.nativeElement.textContent).toContain(
      'Aucun élément trouvé'
    );
  });

  it('devrait afficher la liste des items quand il y en a', () => {
    fixture.detectChanges();

    const listItems = fixture.debugElement.queryAll(By.css('li'));
    expect(listItems.length).toBe(2);
    expect(listItems[0].nativeElement.textContent).toContain('Item 1');
  });

  it('devrait mettre à jour newItemName lors de la saisie', () => {
    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    inputElement.value = 'Nouvel item test';
    inputElement.dispatchEvent(new Event('input'));

    expect(component.newItemName).toBe('Nouvel item test');
  });

  it('devrait appeler addItem lors du clic sur le bouton Ajouter', fakeAsync(() => {
    fixture.detectChanges();

    component.newItemName = 'Item à ajouter';
    spyOn(component, 'addItem').and.callThrough();

    const addButton = fixture.debugElement.query(
      By.css('button')
    ).nativeElement;
    addButton.click();
    tick();

    expect(component.addItem).toHaveBeenCalled();
    expect(firebaseServiceSpy.addItem).toHaveBeenCalled();
  }));

  it("ne devrait pas ajouter d'item si le nom est vide", fakeAsync(() => {
    fixture.detectChanges();

    component.newItemName = '   '; // Espace vide

    component.addItem();
    tick();

    expect(firebaseServiceSpy.addItem).not.toHaveBeenCalled();
  }));

  it('devrait réinitialiser newItemName après un ajout réussi', fakeAsync(() => {
    fixture.detectChanges();

    component.newItemName = 'Item test';
    component.addItem();
    tick();

    expect(component.newItemName).toBe('');
  }));

  it('devrait appeler deleteItem lors du clic sur le bouton Supprimer', fakeAsync(() => {
    fixture.detectChanges();

    spyOn(component, 'deleteItem').and.callThrough();

    const deleteButton = fixture.debugElement.queryAll(By.css('.delete-btn'))[0]
      .nativeElement;
    deleteButton.click();
    tick();

    expect(component.deleteItem).toHaveBeenCalledWith('1');
    expect(firebaseServiceSpy.deleteItem).toHaveBeenCalledWith('1');
  }));

  it('devrait gérer les erreurs lors du chargement des items', () => {
    // Configurer le service mock pour renvoyer une erreur
    firebaseServiceSpy.getItems.and.returnValue(
      throwError(() => new Error('Erreur de chargement'))
    );

    // Espionner la console pour vérifier les erreurs
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalled();
    expect(component.items.length).toBe(0);
  });

  it("devrait gérer les erreurs lors de l'ajout d'un item", fakeAsync(() => {
    // Configurer le service mock pour renvoyer une erreur
    firebaseServiceSpy.addItem.and.returnValue(
      Promise.reject("Erreur d'ajout")
    );

    // Espionner la console pour vérifier les erreurs
    spyOn(console, 'error');

    component.newItemName = 'Item test';
    component.addItem();
    tick();

    expect(console.error).toHaveBeenCalled();
  }));

  it("devrait gérer les erreurs lors de la suppression d'un item", fakeAsync(() => {
    // Configurer le service mock pour renvoyer une erreur
    firebaseServiceSpy.deleteItem.and.returnValue(
      Promise.reject('Erreur de suppression')
    );

    // Espionner la console pour vérifier les erreurs
    spyOn(console, 'error');

    component.deleteItem('1');
    tick();

    expect(console.error).toHaveBeenCalled();
  }));
});
