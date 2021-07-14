function getTransformMatrix(style: CSSStyleDeclaration): DOMMatrix {
    const matrix = new DOMMatrix();
    const [originX, originY] = style.transformOrigin.replace(/px/g, '').split(/\s+/g).map(n => Number(n));
    matrix.translateSelf(originX, originY);
    matrix.multiplySelf(new DOMMatrix(style.transform));
    matrix.translateSelf(-originX, -originY);

    return matrix;
}

export function getElementMatrix(element: Element | null): DOMMatrix {
    if (null == element) {
        return new DOMMatrix();
    }
    if (!(element instanceof HTMLElement)) {
        throw new Error('getElementMatrix is not implemented for non-HTML elements');
    }

    const parent = getElementMatrix(element.offsetParent);
    const matrix = new DOMMatrix();
    matrix.translateSelf(element.offsetLeft, element.offsetTop);
    matrix.multiplySelf(getTransformMatrix(getComputedStyle(element)));
    matrix.preMultiplySelf(parent);

    return matrix;
}