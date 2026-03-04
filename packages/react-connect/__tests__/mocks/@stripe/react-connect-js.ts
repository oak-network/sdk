import React, { type ReactNode } from "react";

export const ConnectComponentsProvider = ({
  children,
}: {
  connectInstance: unknown;
  children: ReactNode;
}): ReactNode => children;

export const ConnectAccountOnboarding = ({
  onExit,
}: {
  onExit: () => void;
}): React.ReactElement => {
  return React.createElement("button", {
    type: "button",
    onClick: onExit,
    children: "Exit",
  });
};
