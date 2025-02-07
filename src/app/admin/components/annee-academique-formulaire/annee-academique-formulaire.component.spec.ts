import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeAcademiqueFormulaireComponent } from './annee-academique-formulaire.component';

describe('AnneeAcademiqueFormulaireComponent', () => {
  let component: AnneeAcademiqueFormulaireComponent;
  let fixture: ComponentFixture<AnneeAcademiqueFormulaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnneeAcademiqueFormulaireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnneeAcademiqueFormulaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
