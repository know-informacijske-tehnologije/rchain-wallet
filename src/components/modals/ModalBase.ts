export interface ModalBase<T> {
    onFinish: (result: T | null) => void;
    noCloseOnClickOutside?: boolean;
    hostClassName?: string;
};
