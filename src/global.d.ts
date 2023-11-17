import {Alert, Button, Carousel, Collapse, Dropdown, Modal, Offcanvas, Popover, ScrollSpy, Tab, Toast, Tooltip} from "bootstrap";

declare global {
  let bootstrap: {
    Alert: typeof Alert;
    Button: typeof Button;
    Carousel: typeof Carousel;
    Collapse: typeof Collapse;
    Dropdown: typeof Dropdown;
    Modal: typeof Modal;
    Offcanvas: typeof Offcanvas;
    Popover: typeof Popover;
    ScrollSpy: typeof ScrollSpy;
    Tab: typeof Tab;
    Toast: typeof Toast;
    Tooltip: typeof Tooltip;
  };
}
