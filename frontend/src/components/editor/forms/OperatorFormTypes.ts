export type OperatorInputChangeCallback = (field: string, value: string) => void;

export type ReactRefCallback = (el: HTMLElement | null) => void;

export interface SharedOperatorInputProps {
    title: string
    field: string    
    formErrors: any
    commitField: OperatorInputChangeCallback
    refCallback?: ReactRefCallback
    descriptions?: any
}