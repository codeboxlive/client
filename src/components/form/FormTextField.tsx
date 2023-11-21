import {
  Input,
  InputOnChangeData,
  InputProps,
  Label,
  useId,
} from "@fluentui/react-components";
import { FC, useCallback } from "react";
import { FlexColumn } from "../flex";

interface IFormTextFieldProps extends Partial<Omit<InputProps, "onChange">> {
  id: string;
  label: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

export const FormTextField: FC<IFormTextFieldProps> = ({
  id,
  label,
  value,
  type,
  placeholder,
  required,
  onChange,
  ...props
}) => {
  const inputId = useId(id);
  const onValueChange = useCallback(
    (ev: any, data: InputOnChangeData) => {
      if (!onChange) return;
      onChange(data.value);
    },
    [onChange]
  );
  return (
    <FlexColumn>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <Input
        id={inputId}
        name={id}
        value={value}
        type={type}
        placeholder={placeholder}
        required={required}
        onChange={onValueChange}
        {...props}
      />
    </FlexColumn>
  );
};
