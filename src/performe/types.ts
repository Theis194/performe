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
    | "TEXT_ELEMENT"
    ;

export interface PerformeElement {
    type: ElementType;
    props: {
        [key: string]: unknown;
        children?: PerformeNode[];
    };
}

export type PerformeNode = PerformeElement | string | ((props: {}) => PerformeElement | null);

export type Hook<T> = {
  state: T,
  queue: ((prevState: T) => T)[],
}

export interface Fiber {
    type?: ElementType | ((props: {}) => PerformeElement | null);
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
    hooks?: Hook<any>[],
}

export type HostFiber = Omit<Fiber, 'type'> & {
  type: ElementType | "TEXT_ELEMENT"
}

export type FunctionFiber = Omit<Fiber, 'type'> & {
  type: ((props: {}) => PerformeElement | null)
}
