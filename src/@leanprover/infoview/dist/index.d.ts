import { MessageData } from '@leanprover/infoview-api';
export * from '@leanprover/infoview-api';
export { EditorContext, VersionContext } from './infoview/contexts';
export { EditorConnection } from './infoview/editorConnection';
export { GoalLocation, GoalsLocation, LocationsContext } from './infoview/goalLocation';
export { InteractiveCode, InteractiveCodeProps } from './infoview/interactiveCode';
export { renderInfoview } from './infoview/main';
export { RpcContext } from './infoview/rpcSessions';
export { ServerVersion } from './infoview/serverVersion';
export { DynamicComponent, DynamicComponentProps, importWidgetModule, PanelWidgetProps } from './infoview/userWidget';
export { DocumentPosition, mapRpcError, useAsync, useAsyncPersistent, useAsyncWithTrigger, useClientNotificationEffect, useClientNotificationState, useEvent, useEventResult, useServerNotificationEffect, useServerNotificationState, } from './infoview/util';
export { MessageData };
/** Display the given message data as interactive, pretty-printed text. */
export declare function InteractiveMessageData({ msg }: {
    msg: MessageData;
}): import("react/jsx-runtime").JSX.Element;
