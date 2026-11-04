export const createListener = (eventType, selector, callback) => {
    return SalesforceInteractions.listener(eventType, selector, () =>
        callback(),
    );
};

export const EVENTS = {
    click: 'click',
    mouseDown: 'mousedown',
};
