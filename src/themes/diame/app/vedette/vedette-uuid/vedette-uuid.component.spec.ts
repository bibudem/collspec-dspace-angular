import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VedetteUUIDComponent } from './vedette-uuid-liste.component';

describe('VedetteUUIDComponent', () => {
  let component: VedetteUUIDComponent;
  let fixture: ComponentFixture<VedetteUUIDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VedetteUUIDComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VedetteUUIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
