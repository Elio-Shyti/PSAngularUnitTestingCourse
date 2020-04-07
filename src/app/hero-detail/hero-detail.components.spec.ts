import { ComponentFixture, TestBed, fakeAsync, flush, tick, async } from "@angular/core/testing";
import { HeroDetailComponent } from "./hero-detail.component";
import { ActivatedRoute } from "@angular/router";
import { HeroService } from "../hero.service";
import { FormsModule } from "@angular/forms";
import { Location } from '@angular/common';
import { of } from "rxjs";

describe('HeroDetailComponent', () => {
    let fixture: ComponentFixture<HeroDetailComponent>;
    let mockActivatedRoute, mockHeroService, mockLocation;

    beforeEach(() => {
        mockActivatedRoute = {
            snapshot: { paramMap: { get: () => {return '3';}}}
        }
        mockHeroService = jasmine.createSpyObj(['getHero', 'updateHero']);
        mockLocation = jasmine.createSpyObj(['back']);

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [HeroDetailComponent],
            providers: [
                { provide : ActivatedRoute, useValue: mockActivatedRoute },
                { provide: HeroService, useValue: mockHeroService },
                { provide: Location, useValue: mockLocation }
            ]
        });
        fixture = TestBed.createComponent(HeroDetailComponent);

        mockHeroService.getHero.and.returnValue(of({id: 3, name: 'SuperDude', strength: 100}));
    });

    it('should render hero name in a h2 tag', () => {
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('h2').textContent).toContain('SUPERDUDE');
    });
    
    // fakeAsync: With this wrapping funciton we can treat all async code as sync
    // and esentially controlle the clock when our test is running
    it('1st: should call updateHero when save is called', fakeAsync(() => {
        mockHeroService.updateHero.and.returnValue(of({}));
        fixture.detectChanges();

        fixture.componentInstance.save();
        // 1st way: It ticks forward 250 miliseconds and call any code that should be called inside this time frame
        tick(250);
        // OR -> 2nd way: It basicly looks in the zone (ngZone) for tasks that are waiting,
        // if there are tasks waiting, go ahead and fastforward the clock until this task have been executed
        // flush(); 

        expect(mockHeroService.updateHero).toHaveBeenCalled();
    }))

    // 2nd fakeAsync for Promises
    it('2nd: should call updateHero when save is called', fakeAsync(() => {
        mockHeroService.updateHero.and.returnValue(of({}));
        fixture.detectChanges();

        fixture.componentInstance.saveWithPromise();
        // 1st way: It ticks forward 250 miliseconds and call any code that should be called inside this time frame
        tick(250);
        // OR -> 2nd way: It basicly looks in the zone (ngZone) for tasks that are waiting,
        // if there are tasks waiting, go ahead and fastforward the clock until this task have been executed
        // flush(); 

        expect(mockHeroService.updateHero).toHaveBeenCalled();
    }))

    // The async() function works good with Promises, but it doesn't works with setTimeout(),
    // like fakeAsync() does.
    it('3rd: should call updateHero when save i callled', async(() => {
        mockHeroService.updateHero.and.returnValue(of({}));
        fixture.detectChanges();

        fixture.componentInstance.saveWithPromise();

        // The component (fixture) waits until it is stablized. Actually it returns a Promise
        // that is resolved only when all the promises inside this component have been resolved.
        fixture.whenStable().then(
            () => {
                expect(mockHeroService.updateHero).toHaveBeenCalled();
            }
        )
    }));

});