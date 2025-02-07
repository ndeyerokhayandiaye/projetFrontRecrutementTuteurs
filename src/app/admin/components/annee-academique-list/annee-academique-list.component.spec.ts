import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeAcademiqueListComponent } from './annee-academique-list.component';

describe('AnneeAcademiqueListComponent', () => {
  let component: AnneeAcademiqueListComponent;
  let fixture: ComponentFixture<AnneeAcademiqueListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnneeAcademiqueListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnneeAcademiqueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
