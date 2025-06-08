import type {
    ElementType,
    Fiber,
    FunctionFiber,
    Hook,
    HostFiber,
    PerformeElement,
    PerformeNode,
} from "./types";

export function helloWorld() {
    return "Hello, world!";
}

function commitRoot() {
    deletions!.forEach(commitWork);
    commitWork(wipRoot!.child!);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber: Fiber | null) {
    if (!fiber) {
        return;
    }

    let domParentFiber = fiber.parent;
    while (!domParentFiber!.dom) {
        domParentFiber = domParentFiber!.parent;
    }
    const domParent = domParentFiber!.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
    } else if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber, domParent);
    }

    commitWork(fiber.child!);
    commitWork(fiber.sibling!);
}

function commitDeletion(fiber: Fiber, domParent: HTMLElement | Text) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber!.child!, domParent);
    }
}

function createElement<T extends object>(
    type: ElementType,
    props: T | null = null,
    ...children: PerformeNode[]
) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) =>
                typeof child === "object" ? child : createTextElement(child)
            ),
        },
    };
}

function createTextElement(text: string | unknown): PerformeElement {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
}

function createDom(fiber: HostFiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}

const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children" /* && !isEvent(key) */;
const isNew =
    (prev: { [key: string]: any }, next: { [key: string]: any }) =>
    (key: string) =>
        prev[key] !== next[key];
const isGone =
    (next: { [key: string]: any }) =>
    (key: string) =>
        !(key in next);
function updateDom(
    dom: HTMLElement | Text,
    prevProps: { [key: string]: any },
    nextProps: { [key: string]: any }
) {
    // Remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(nextProps))
        .forEach((name) => {
            (dom as any)[name] = nextProps[name];
        });

    // Set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            if (name === "style") {
                (dom as any)[name] = styleObjectToString(nextProps[name])
            } else {
                (dom as any)[name] = nextProps[name];
            }
        });

    //Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            (key) => !(key in nextProps) || isNew(prevProps, nextProps)(key)
        )
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name]);
        });


    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name]);
        });
}

function render(element: PerformeElement, container: HTMLElement | null) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork: Fiber | null | undefined = null;
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null;
let deletions: Fiber[] | null = null;

function workLoop(deadline: IdleDeadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function performUnitOfWork(fiber: Fiber) {
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(fiber as FunctionFiber);
    } else {
        updateHostComponent(fiber as HostFiber);
    }

    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber: Fiber | null | undefined = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

let wipFiber: Fiber | null = null
let hookIndex: number | null = null

function updateFunctionComponent(fiber: FunctionFiber) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber!.hooks = []
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children as PerformeElement[])
}

function updateHostComponent(fiber: HostFiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    reconcileChildren(fiber, fiber.props.children as PerformeElement[]);
}

function reconcileChildren(wipFiber: Fiber, elements: PerformeElement[]) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling: Fiber | null = null;

    while (index < elements.length || oldFiber != null) {
        const element = elements[index];
        let newFiber: Fiber | null = null;

        const sameType = oldFiber && element && element.type == oldFiber.type;

        if (sameType) {
            newFiber = {
                type: oldFiber!.type,
                props: element.props,
                dom: oldFiber!.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            };
        }
        if (element && !sameType) {
            newFiber = {
                type: element.type as ElementType,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            };
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION";
            deletions!.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0) {
            wipFiber.child = newFiber;
        } else if (element) {
            prevSibling!.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }
}


export function useState<T>(initial: T): [T, (_: ((prevState: T) => T)) => void] {
  const oldHook: Hook<T> | null | undefined =
    wipFiber!.alternate &&
    wipFiber!.alternate.hooks &&
    wipFiber!.alternate.hooks[hookIndex!]
  const hook: Hook<T> = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = (action: ((prevState: T) => T)) => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot!.dom,
      props: currentRoot!.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber!.hooks!.push(hook)
  hookIndex!++
  return [hook.state, setState]
}

export function styleObjectToString(style: any) {
    return Object.keys(style).reduce(
        (acc, key) => 
            `${acc}${key.split(/(?=[A-Z])/).join("-").toLowerCase()}:${style[key]};`,
		"",
    )
}

export const Performe = {
    useState,
    createElement,
    render,
};
