export type ElementType =
    | "div"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "p"
    | "span"
    | "a"
    | "b"
    | "ul"
    | "ol"
    | "li"
    | "TEXT_ELEMENT";

export interface PerformeElement {
    type: ElementType;
    props: {
        [key: string]: unknown;
        children?: PerformeNode[];
    };
}

export type PerformeNode = PerformeElement | string;

export interface Fiber {
    type?: ElementType;
    props: {
        [key: string]: unknown;
        children?: PerformeNode[];
    };
    dom: HTMLElement | Text | null;
    parent?: Fiber;
    alternate?: Fiber | null;
    effectTag?: "PLACEMENT" | "DELETION" | "UPDATE" | null;
    child?: Fiber | null;
    sibling?: Fiber | null;
}

export interface HostFiber extends Fiber {
    type: ElementType;
}
