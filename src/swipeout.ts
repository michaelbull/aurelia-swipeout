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

function translateX(x: number): string {
    if (x === 0) {
        return '';
    } else {
        return `translate3d(${x}px, 0, 0)`;
    }
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
    private overlay: HTMLDivElement;

    private hammer: HammerManager;
    private startLeft: number = 0;
    private isActive: boolean = false;
    private isTransitioning: boolean = false;

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
            this.overlay.addEventListener('transitionend', this.transitionEndListener);

            window.requestAnimationFrame(() => {
                this.overlay.style.transform = translateX(to);
                this.shiftLeftActions(to, leftActionsWidth);
                this.shiftRightActions(to, rightActionsWidth);
            });
        }
    }

    private shiftLeftActions(newX: number, actionsWidth: number) {
        let actions: Element | null = this.left.firstElementChild;
        if (actions === null) {
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
        let overlayRect: ClientRect = this.overlay.getBoundingClientRect();
        let elementRect: ClientRect = this.element.getBoundingClientRect();
        return overlayRect.left - elementRect.left;
    }

    private startListener: HammerListener = (event: HammerInput) => {
        if (event.deltaY >= -5 && event.deltaY <= 5) {
            this.startLeft = this.distanceSwiped();
            this.isActive = true;
        }

        this.events.publish('swipeout:close');
    };

    private swipeListener: HammerListener = (event: HammerInput) => {
        if (!this.isActive) {
            return;
        }

        let [leftActionsWidth, rightActionsWidth] = this.actionWidths();

        let newX: number = this.startLeft + event.deltaX;
        if (newX < -rightActionsWidth) {
            let extra: number = Math.abs(newX + rightActionsWidth);
            extra = Math.pow(extra, 0.8);
            newX = -(rightActionsWidth + extra);
        } else if (newX > leftActionsWidth) {
            let extra: number = newX - leftActionsWidth;
            extra = Math.pow(extra, 0.8);
            newX = +(leftActionsWidth + extra);
        }

        this.overlay.style.transform = translateX(newX);
        this.shiftLeftActions(newX, leftActionsWidth);
        this.shiftRightActions(newX, rightActionsWidth);
    };

    private stopListener: HammerListener = (event: HammerInput) => {
        if (!this.isActive) {
            return;
        }

        let [leftActionsWidth, rightActionsWidth] = this.actionWidths();
        let oldLeft: number = this.overlay.getBoundingClientRect().left;
        let currentLeft: number = this.startLeft + event.deltaX;
        let newLeft: number = this.startLeft;

        if (leftActionsWidth !== 0 && this.startLeft === leftActionsWidth && event.deltaX <= -this.threshold) {
            if (rightActionsWidth !== 0 && currentLeft <= -this.threshold) {
                newLeft = -rightActionsWidth;
            } else {
                newLeft = 0;
            }
        } else if (rightActionsWidth !== 0 && this.startLeft === -rightActionsWidth && event.deltaX >= this.threshold) {
            if (leftActionsWidth !== 0 && currentLeft >= this.threshold) {
                newLeft = leftActionsWidth;
            } else {
                newLeft = 0;
            }
        } else if (this.startLeft === 0 && currentLeft >= this.threshold) {
            newLeft = leftActionsWidth;
        } else if (this.startLeft === 0 && currentLeft <= -this.threshold) {
            newLeft = -rightActionsWidth;
        }

        this.isActive = false;
        this.changeLeft(oldLeft, newLeft);
    };

    private transitionEndListener: EventListener = (): void => {
        this.overlay.removeEventListener('transitionend', this.transitionEndListener);
        this.isTransitioning = false;
        this.createHammer();
    };

    private closeListener = (): void => {
        if (!this.isActive) {
            this.changeLeft(this.distanceSwiped(), 0);
        }
    };
}
