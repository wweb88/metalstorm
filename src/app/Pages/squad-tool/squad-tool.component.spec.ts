import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadToolComponent } from './squad-tool.component';

describe('SquadToolComponent', () => {
  let component: SquadToolComponent;
  let fixture: ComponentFixture<SquadToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SquadToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquadToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
