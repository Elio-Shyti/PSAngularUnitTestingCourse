import { HeroesComponent } from "./heroes.component"
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HeroService } from "../hero.service";
import { of } from "rxjs";
import { NO_ERRORS_SCHEMA, Input, Component, Directive } from "@angular/core";
import { By } from "@angular/platform-browser";
import { HeroComponent } from "../hero/hero.component";

@Directive({
    selector: '[routerLink]',
    host: { '(click)': 'onClick()'}
})
export class RouterLinkDirectiveStub {
    @Input('routerLink') linkParams: any;
    navigateTo: any = null;

    onClick() {
        this.navigateTo = this.linkParams;
    }
}

describe('HeroesComponent', () => {
    let fixture: ComponentFixture<HeroesComponent>;
    let mockHeroService;
    let HEROES;

    beforeEach(() => {
        HEROES = [
            {id: 1, name: 'SpiderDude', strength: 8},
            {id: 2, name: 'Wonderful Woman', strength: 24},
            {id: 3, name: 'SuperDude', strength: 55}
        ];

        mockHeroService = jasmine.createSpyObj(['getHeroes', 'addHero', 'deleteHero']);

        TestBed.configureTestingModule({
            declarations: [HeroesComponent, HeroComponent, RouterLinkDirectiveStub ],
            providers: [
                { provide: HeroService, useValue: mockHeroService}
            ],
            // schemas: [NO_ERRORS_SCHEMA]
        });
        fixture = TestBed.createComponent(HeroesComponent);
    });

    it('should render each hero as a HeroComponent', () => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));

        // run ngOnInit
        fixture.detectChanges();

        const heroComponentDEs = fixture.debugElement.queryAll(By.directive(HeroComponent));
        expect(heroComponentDEs.length).toBe(3);
        for(let i=0; i<heroComponentDEs.length; i++) {
            expect(heroComponentDEs[i].componentInstance.hero).toEqual(HEROES[i]);
        }

    });

    

    it(`should call heroService.deleteHero when the Hero Component's
    delete button is clicked`, () => {
        spyOn(fixture.componentInstance, 'delete');
        mockHeroService.getHeroes.and.returnValue(of(HEROES));

        fixture.detectChanges();

        const heroComponents = fixture.debugElement.queryAll(By.directive(HeroComponent));
        heroComponents[1].query(By.css('button'))
            .triggerEventHandler('click', {stopPropagation: () => {}});

        // 2nd way to emit an event from the component of the debugElement
        // (<HeroComponent>heroComponents[1].componentInstance).delete.emit(undefined);
        heroComponents[0].componentInstance.delete.emit(undefined);

        // 3rd way to trigger the event from the debugElement directly
        // in this way we are testing less that the 2nd way, because we trigger the event on the debugElement
        // directly and we don't care if the underlying component has a delete eventEmitter
        heroComponents[2].triggerEventHandler('delete', null);

        expect(fixture.componentInstance.delete).toHaveBeenCalledWith(HEROES[1]);
        expect(fixture.componentInstance.delete).toHaveBeenCalledWith(HEROES[0]);
        expect(fixture.componentInstance.delete).toHaveBeenCalledWith(HEROES[2]);
    });

    it('should add a new hero to the hero list when the add butoon is clicked', () => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));
        fixture.detectChanges();
        const name = "Mr. Ice";
        mockHeroService.addHero.and.returnValue(of({di: 5, name: name, strength: 4}));
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        const addButton = fixture.debugElement.queryAll(By.css('button'))[0];

        inputElement.value = name;
        addButton.triggerEventHandler('click', null);
        fixture.detectChanges();

        const heroText = fixture.debugElement.query(By.css('ul')).nativeElement.textContent;
        expect(heroText).toContain(name);
    });

    it('should have the correct route for the first hero', () => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));
        fixture.detectChanges();
        // Get the first HeroComponent in the HeroesComponent template
        const heroComponents = fixture.debugElement.queryAll(By.directive(HeroComponent));

        let routerLink = heroComponents[0]
            // Get the HTML-Element that has the RouterLinkDirectiveStub (attribute) applied
            .query(By.directive(RouterLinkDirectiveStub))
            // Get the actual RouterLinkDirectiveStub directive
            .injector.get(RouterLinkDirectiveStub);

        // Trigger the click even on the anchor (<a>) element
        heroComponents[0].query(By.css('a')).triggerEventHandler('click', null);

        expect(routerLink.navigateTo).toBe('/detail/1');
    })
})