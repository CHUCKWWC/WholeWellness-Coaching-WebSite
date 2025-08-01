"use client";
import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
  WarningProvider,
  createDialogScope
} from "./chunk-PVROWINT.js";
import "./chunk-Y6QQGELO.js";
import "./chunk-MCCVD7RS.js";
import "./chunk-DIP2EG2M.js";
import "./chunk-YSLZIROS.js";
import "./chunk-7VTHXRQX.js";
import "./chunk-MZD7YLWH.js";
import {
  composeEventHandlers
} from "./chunk-L2TZYPHV.js";
import {
  createContextScope
} from "./chunk-CYIZFYSO.js";
import "./chunk-OCTTJDAL.js";
import {
  createSlottable,
  useComposedRefs
} from "./chunk-3HLXJ7VW.js";
import "./chunk-YEEQWJ5N.js";
import {
  require_jsx_runtime
} from "./chunk-57FKUPNS.js";
import {
  require_react
} from "./chunk-7X7SXSYK.js";
import {
  __toESM
} from "./chunk-WOOG5QLI.js";

// node_modules/@radix-ui/react-alert-dialog/dist/index.mjs
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext, createAlertDialogScope] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog = (props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return (0, import_jsx_runtime.jsx)(Root, { ...dialogScope, ...alertDialogProps, modal: true });
};
AlertDialog.displayName = ROOT_NAME;
var TRIGGER_NAME = "AlertDialogTrigger";
var AlertDialogTrigger = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return (0, import_jsx_runtime.jsx)(Trigger, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }
);
AlertDialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "AlertDialogPortal";
var AlertDialogPortal = (props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return (0, import_jsx_runtime.jsx)(Portal, { ...dialogScope, ...portalProps });
};
AlertDialogPortal.displayName = PORTAL_NAME;
var OVERLAY_NAME = "AlertDialogOverlay";
var AlertDialogOverlay = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return (0, import_jsx_runtime.jsx)(Overlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }
);
AlertDialogOverlay.displayName = OVERLAY_NAME;
var CONTENT_NAME = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME);
var Slottable = createSlottable("AlertDialogContent");
var AlertDialogContent = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = React.useRef(null);
    return (0, import_jsx_runtime.jsx)(
      WarningProvider,
      {
        contentName: CONTENT_NAME,
        titleName: TITLE_NAME,
        docsSlug: "alert-dialog",
        children: (0, import_jsx_runtime.jsx)(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: (0, import_jsx_runtime.jsxs)(
          Content,
          {
            role: "alertdialog",
            ...dialogScope,
            ...contentProps,
            ref: composedRefs,
            onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
              var _a;
              event.preventDefault();
              (_a = cancelRef.current) == null ? void 0 : _a.focus({ preventScroll: true });
            }),
            onPointerDownOutside: (event) => event.preventDefault(),
            onInteractOutside: (event) => event.preventDefault(),
            children: [
              (0, import_jsx_runtime.jsx)(Slottable, { children }),
              (0, import_jsx_runtime.jsx)(DescriptionWarning, { contentRef })
            ]
          }
        ) })
      }
    );
  }
);
AlertDialogContent.displayName = CONTENT_NAME;
var TITLE_NAME = "AlertDialogTitle";
var AlertDialogTitle = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return (0, import_jsx_runtime.jsx)(Title, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }
);
AlertDialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "AlertDialogDescription";
var AlertDialogDescription = React.forwardRef((props, forwardedRef) => {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return (0, import_jsx_runtime.jsx)(Description, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
});
AlertDialogDescription.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return (0, import_jsx_runtime.jsx)(Close, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }
);
AlertDialogAction.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return (0, import_jsx_runtime.jsx)(Close, { ...dialogScope, ...cancelProps, ref });
  }
);
AlertDialogCancel.displayName = CANCEL_NAME;
var DescriptionWarning = ({ contentRef }) => {
  const MESSAGE = `\`${CONTENT_NAME}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
  React.useEffect(() => {
    var _a;
    const hasDescription = document.getElementById(
      (_a = contentRef.current) == null ? void 0 : _a.getAttribute("aria-describedby")
    );
    if (!hasDescription) console.warn(MESSAGE);
  }, [MESSAGE, contentRef]);
  return null;
};
var Root2 = AlertDialog;
var Trigger2 = AlertDialogTrigger;
var Portal2 = AlertDialogPortal;
var Overlay2 = AlertDialogOverlay;
var Content2 = AlertDialogContent;
var Action = AlertDialogAction;
var Cancel = AlertDialogCancel;
var Title2 = AlertDialogTitle;
var Description2 = AlertDialogDescription;
export {
  Action,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  Cancel,
  Content2 as Content,
  Description2 as Description,
  Overlay2 as Overlay,
  Portal2 as Portal,
  Root2 as Root,
  Title2 as Title,
  Trigger2 as Trigger,
  createAlertDialogScope
};
//# sourceMappingURL=@radix-ui_react-alert-dialog.js.map
