export const fireDoubleClick = (HTMLelement) => {
  const event = new MouseEvent("dblclick", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  HTMLelement?.dispatchEvent(event);
};
