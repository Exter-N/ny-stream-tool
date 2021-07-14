import MulticastCallback from "./multicast-callback";

const classes: { [cls: string]: Set<Element>; } = {
};

const classesOnChange: { [cls: string]: MulticastCallback<[elements: Set<Element>]>; } = {
};

function processClassMutation(changedClasses: Set<string>, mutation: MutationRecord): void {
    if ('attributes' === mutation.type) {
        const target = mutation.target as Element;
        if ('class' === mutation.attributeName) {
            for (const [cls, elements] of Object.entries(classes)) {
                const has = target.classList.contains(cls);
                if (has) {
                    const had = elements.has(target);
                    if (!had) {
                        elements.add(target);
                        changedClasses.add(cls);
                    }
                } else {
                    if (elements.delete(target)) {
                        changedClasses.add(cls);
                    }
                }
            }
        }
    } else if ('childList' === mutation.type) {
        for (const target of mutation.removedNodes) {
            if (target instanceof Element) {
                for (const [cls, elements] of Object.entries(classes)) {
                    if (target.classList.contains(cls)) {
                        if (elements.delete(target)) {
                            changedClasses.add(cls);
                        }
                    }
                    for (const descTarget of target.getElementsByClassName(cls)) {
                        if (elements.delete(descTarget)) {
                            changedClasses.add(cls);
                        }
                    }
                }
            }
        }
        for (const target of mutation.addedNodes) {
            if (target instanceof Element) {
                for (const [cls, elements] of Object.entries(classes)) {
                    if (target.classList.contains(cls)) {
                        const had = elements.has(target);
                        if (!had) {
                            elements.add(target);
                            changedClasses.add(cls);
                        }
                    }
                    for (const descTarget of target.getElementsByClassName(cls)) {
                        const had = elements.has(descTarget);
                        if (!had) {
                            elements.add(descTarget);
                            changedClasses.add(cls);
                        }
                    }
                }
            }
        }
    }
}

const observer = new MutationObserver(mutations => {
    const changedClasses = new Set<string>();
    for (const mutation of mutations) {
        processClassMutation(changedClasses, mutation);
    }
    for (const cls of changedClasses) {
        classesOnChange[cls]?.call(classes[cls]);
    }
});

observer.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
});

export function getElementsByClassName(className: string): Set<Element> {
    if (!classes.hasOwnProperty(className)) {
        classes[className] = new Set(document.getElementsByClassName(className));
    }

    return classes[className];
}

export function classAddOnChange(className: string, fn: (elements: Set<Element>) => void, runImmediately: boolean = false): void {
    const elements = getElementsByClassName(className);
    if (null == classesOnChange[className]) {
        classesOnChange[className] = new MulticastCallback();
    }

    classesOnChange[className].add(fn);
    if (runImmediately) {
        fn(elements);
    }
}

export function classRemoveOnChange(className: string, fn: (elements: Set<Element>) => void): boolean {
    const onChange = classesOnChange[className];
    if (null == onChange) {
        return false;
    }

    return onChange.delete(fn);
}

Object.assign(window as any, {
    getElementsByClassName,
});