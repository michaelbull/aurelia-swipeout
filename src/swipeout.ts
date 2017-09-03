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

function translateX(x: number): string {
    if (x === 0) {
        return '';
    } else {
        return `translate3d(${x}px, 0, 0)`;
    }
}

function reduceSwipe(x: number): number {
    return Math.pow(x, 0.65);
}

@autoinject()
export class Swipeout implements ComponentAttached, ComponentDetached {

    /**
     * The amount of pixels that must be swiped for the
     * menu to expand once releasing the swipe.
     */
    @bindable({ defaultBindingMode: bindingMode.oneWay })
    threshold: number = 45;

    private left: HTMLDivElement;
    private right: HTMLDivElement;
    private content: HTMLDivElement;

    private hammer: HammerManager;
    private startLeft: number = 0;
    private isActive: boolean = false;
    private isTransitioning: boolean = false;
    private direction: Direction = null;

    private closeSubscription: Subscription;

    private readonly element: Element;
    private readonly events: EventAggregator;

    constructor(element: Element, events: EventAggregator) {
        this.element = element;
        this.events = events;
    }

    attached(): void {
        this.closeSubscription = this.events.subscribe('swipeout:close', this.closeListener);
        this.createHammer();
    }

    detached(): void {
        this.closeSubscription.dispose();
        this.hammer.destroy();
    }

    private createHammer(): void {
        this.hammer = new Hammer(this.element as HTMLElement);
        this.hammer.get('pan').set({ threshold: 0 });
        this.hammer.on('panstart', this.startListener);
        this.hammer.on('panleft panright', this.swipeListener);
        this.hammer.on('panend', this.stopListener);
    }

    private actionWidths(): [number, number] {
        let leftActions: Element | null = this.left.firstElementChild;
        let rightActions: Element | null = this.right.firstElementChild;

        let left: number = 0;
        let right: number = 0;

        if (leftActions !== null) {
            left = leftActions.clientWidth;
        }

        if (rightActions !== null) {
            right = rightActions.clientWidth;
        }

        return [left, right];
    }

    private changeLeft(from: number, to: number) {
        let delta: number = (to - from);

        if (delta !== 0) {
            let [leftActionsWidth, rightActionsWidth] = this.actionWidths();

            this.hammer.destroy();
            this.isTransitioning = true;
            this.content.addEventListener('transitionend', this.transitionEndListener);

            window.requestAnimationFrame(() => {
                this.content.style.transform = translateX(to);
                this.shiftLeftActions(to, leftActionsWidth);
                this.shiftRightActions(to, rightActionsWidth);
            });
        }
    }

    private shiftLeftActions(newX: number, actionsWidth: number) {
        let actions: Element | null = this.left.firstElementChild;
        if (actions === null) {
            return;
        } else if (this.startLeft < 0) {
            return;
        } else if (this.startLeft === 0 && this.direction !== 'ltr') {
            return;
        }

        let progress: number = 1 - Math.min(newX / actionsWidth, 1);
        let deltaX: number = Math.min(newX, actionsWidth);
        let children: HTMLCollection = actions.children;

        for (let i: number = 0; i < children.length; i++) {
            let child: HTMLElement = children[i] as HTMLElement;
            let offsetLeft = actionsWidth - child.offsetLeft - child.offsetWidth;
            child.style.transform = translateX(deltaX + offsetLeft * progress);

            if (children.length > 1) {
                child.style.zIndex = `${children.length - i}`;
            }
        }
    }

    private shiftRightActions(newX: number, actionsWidth: number) {
        let actions: Element | null = this.right.firstElementChild;
        if (actions === null) {
            return;
        } else if (this.startLeft > 0) {
            return;
        } else if (this.startLeft === 0 && this.direction !== 'rtl') {
            return;
        }

        let progress: number = 1 + Math.max(newX / actionsWidth, -1);
        let deltaX: number = Math.max(newX, -actionsWidth);
        let children: HTMLCollection = actions.children;

        for (let i: number = 0; i < children.length; i++) {
            let child: HTMLElement = children[i] as HTMLElement;
            child.style.transform = translateX(deltaX - child.offsetLeft * progress);
        }
    }

    private distanceSwiped() {
        let contentRect: ClientRect = this.content.getBoundingClientRect();
        let elementRect: ClientRect = this.element.getBoundingClientRect();
        return contentRect.left - elementRect.left;
    }

    private startListener: HammerListener = (event: HammerInput) => {
        if (event.deltaY >= -5 && event.deltaY <= 5) {
            this.startLeft = this.distanceSwiped();
            this.isActive = true;

            if (event.deltaX > 0) {
                this.direction = 'ltr';
            } else if (event.deltaX < 0) {
                this.direction = 'rtl';
            }
        }

        this.events.publish('swipeout:close');
    };

    private swipeListener: HammerListener = (event: HammerInput) => {
        if (!this.isActive) {
            return;
        }

        let [leftActionsWidth, rightActionsWidth] = this.actionWidths();
        let newX: number = this.startLeft + event.deltaX;

        if (this.startLeft === 0 && this.direction === 'ltr' && newX < 0) {
            // attempting to reveal the right actions after revealing the left actions
            newX = -reduceSwipe(-newX);
        } else if (this.startLeft === 0 && this.direction === 'rtl' && newX > 0) {
            // attempting to reveal the left actions after revealing the right actions
            newX = reduceSwipe(newX);
        } else if (this.startLeft < 0 && newX > 0) {
            // attempting to reveal the right actions after starting with the left actions revealed
            newX = reduceSwipe(newX);
        } else if (this.startLeft > 0 && newX < 0) {
            // attempting to reveal the left actions after starting with the right actions revealed
            newX = -reduceSwipe(-newX);
        } else if (newX < -rightActionsWidth) {
            // overswiping right-to-left
            let extra: number = Math.abs(newX + rightActionsWidth);
            extra = reduceSwipe(extra);
            newX = -(rightActionsWidth + extra);
        } else if (newX > leftActionsWidth) {
            // overswiping left-to-right
            let extra: number = newX - leftActionsWidth;
            extra = reduceSwipe(extra);
            newX = +(leftActionsWidth + extra);
        }

        this.content.style.transform = translateX(newX);
        this.shiftLeftActions(newX, leftActionsWidth);
        this.shiftRightActions(newX, rightActionsWidth);
    };

    private stopListener: HammerListener = (event: HammerInput) => {
        if (!this.isActive) {
            return;
        }

        let [leftActionsWidth, rightActionsWidth] = this.actionWidths();
        let oldLeft: number = this.content.getBoundingClientRect().left;
        let currentLeft: number = this.startLeft + event.deltaX;
        let newLeft: number = this.startLeft;

        if (this.startLeft > 0 && event.deltaX <= -this.threshold) {
            // close left actions
            newLeft = 0;
        } else if (this.startLeft < 0 && event.deltaX >= this.threshold) {
            // close right actions
            newLeft = 0;
        } else if (this.startLeft === 0 && this.direction === 'ltr' && currentLeft >= this.threshold) {
            // reveal left actions
            newLeft = leftActionsWidth;
        } else if (this.startLeft === 0 && this.direction === 'rtl' && currentLeft <= -this.threshold) {
            // reveal right actions
            newLeft = -rightActionsWidth;
        }

        this.isActive = false;
        this.changeLeft(oldLeft, newLeft);
    };

    private transitionEndListener: EventListener = (): void => {
        this.content.removeEventListener('transitionend', this.transitionEndListener);
        this.isTransitioning = false;
        this.createHammer();
    };

    private closeListener = (): void => {
        if (!this.isActive) {
            this.changeLeft(this.distanceSwiped(), 0);
        }
    };
}
