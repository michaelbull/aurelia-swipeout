import {
    EventAggregator,
    Subscription
} from 'aurelia-event-aggregator';
import {
    autoinject,
    bindable,
    bindingMode,
    ComponentAttached,
    ComponentDetached
} from 'aurelia-framework';
import * as Hammer from 'hammerjs';

type Direction = 'rtl' | 'ltr' | null;

@autoinject()
export class Swipeout implements ComponentAttached, ComponentDetached {

    /**
     * The amount of pixels that must be swiped for the menu to expand once
     * releasing the swipe.
     */
    @bindable({ defaultBindingMode: bindingMode.oneWay })
    threshold: number = 20;

    private left: HTMLDivElement;
    private right: HTMLDivElement;
    private overlay: HTMLDivElement;

    private hammer: HammerManager;
    private startLeft: number = 0;
    private direction: Direction = null;
    private isActive: boolean = false;
    private isTransitioning: boolean = false;

    private subscription: Subscription;

    private readonly element: Element;
    private readonly events: EventAggregator;

    constructor(element: Element, events: EventAggregator) {
        this.element = element;
        this.events = events;
    }

    attached(): void {
        this.subscription = this.events.subscribe('swipeout:close', this.closeListener);
        this.createHammer();
    }

    detached(): void {
        this.subscription.dispose();
        this.hammer.destroy();
    }

    private createHammer(): void {
        this.hammer = new Hammer(this.element as HTMLElement);
        this.hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
        this.hammer.on('panstart', this.startListener);
        this.hammer.on('panleft panright', this.swipeListener);
        this.hammer.on('panend', this.stopListener);
    }

    private calculateRange(): [number, number] {
        let left: Element | null = this.left.firstElementChild;
        let right: Element | null = this.right.firstElementChild;

        let min: number = 0;
        let max: number = 0;

        if (left !== null) {
            max = left.clientWidth;
        }

        if (right !== null) {
            min = -right.clientWidth;
        }

        return [min, max];
    }

    private changeLeft(from: number, to: number) {
        let delta: number = (from - to);

        if (delta !== 0) {
            this.hammer.destroy();
            this.isTransitioning = true;
            this.overlay.addEventListener('transitionend', this.transitionEndListener);

            window.requestAnimationFrame(() => {
                this.overlay.style.left = `${to}px`;
            });
        }
    }

    private startListener: HammerListener = (event: HammerInput) => {
        if (event.deltaY >= -30 && event.deltaY <= 30) {
            this.startLeft = this.overlay.offsetLeft;
            this.isActive = true;
        }

        this.events.publish('swipeout:close');
    };

    private swipeListener: HammerListener = (event: HammerInput) => {
        if (!this.isActive) {
            return;
        }

        let [min, max] = this.calculateRange();
        let newX: number = Math.min(max, Math.max(min, this.startLeft + event.deltaX));
        this.overlay.style.left = `${newX}px`;

        if (newX > 0) {
            this.direction = 'ltr';
        } else if (newX < 0) {
            this.direction = 'rtl';
        } else {
            this.direction = null;
        }
    };

    private stopListener: HammerListener = (event: HammerInput) => {
        if (!this.isActive) {
            return;
        }

        let oldLeft: number = this.overlay.offsetLeft;

        let currentLeft: number = this.startLeft + event.deltaX;
        let [min, max] = this.calculateRange();

        let newLeft: number = this.startLeft;
        if (min !== 0 && this.startLeft === min && event.deltaX >= this.threshold) {
            newLeft = 0;
        } else if (max !== 0 && this.startLeft === max && event.deltaX <= -this.threshold) {
            newLeft = 0;
        } else if (this.startLeft === 0 && currentLeft >= this.threshold) {
            newLeft = max;
        } else if (this.startLeft === 0 && currentLeft <= -this.threshold) {
            newLeft = min;
        }

        this.isActive = false;
        this.changeLeft(oldLeft, newLeft);
    };

    private transitionEndListener: EventListener = (): void => {
        this.overlay.removeEventListener('transitionend', this.transitionEndListener);
        this.isTransitioning = false;

        if (this.overlay.offsetLeft === 0) {
            this.direction = null;
        }

        this.createHammer();
    };

    private closeListener = (): void => {
        if (!this.isActive) {
            this.changeLeft(this.overlay.offsetLeft, 0);
        }
    };
}
