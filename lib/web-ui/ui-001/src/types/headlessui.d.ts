declare module '@headlessui/react' {
  import { ComponentType, FC, ReactNode } from 'react';

  export const Dialog: FC<{
    as?: React.ElementType;
    open?: boolean;
    onClose?: (value: boolean) => void;
    className?: string;
    children?: ReactNode;
  }> & {
    Overlay: ComponentType<{ className?: string; as?: React.ElementType }>;
    Title: ComponentType<{ className?: string; as?: React.ElementType }>;
    Description: ComponentType<{ className?: string; as?: React.ElementType }>;
  };

  interface TransitionProps {
    show?: boolean;
    as?: React.ElementType;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    children: ReactNode | ((bag: any) => ReactNode);
    appear?: boolean;
  }

  export const Transition: FC<TransitionProps> & {
    Root: FC<TransitionProps>;
    Child: FC<TransitionProps & { as?: React.ElementType }>;
  };

  export const TransitionChild: FC<{
    as?: React.ElementType;
    show?: boolean;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    children: ReactNode | ((bag: any) => ReactNode);
  }>;
}
