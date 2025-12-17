import React, { useEffect, useState, ChangeEvent } from 'react';
import { FormInput, FormInputProps } from './Form';

interface NumberInputProps extends Omit<FormInputProps, 'value' | 'onChange'> {
    value?: number | null;
    onValueChange: (value: number | undefined) => void;
    allowFloat?: boolean;
    placeholder?: string;
    /**
     * If true, a value of 0 will be rendered as an empty string,
     * and clearing the input will trigger onValueChange(0) instead of undefined.
     */
    treatZeroAsEmpty?: boolean;
}

export function NumberInput({ 
    value, 
    onValueChange, 
    allowFloat = false, 
    treatZeroAsEmpty = false,
    className,
    ...props 
}: NumberInputProps) {
    // Determine initial string representation
    const getDisplayValue = (val?: number | null) => {
        if (val === undefined || val === null) return '';
        if (val === 0 && treatZeroAsEmpty) return '';
        return val.toString();
    };

    const [inputValue, setInputValue] = useState(getDisplayValue(value));

    // Sync local state with prop value when it changes externally
    useEffect(() => {
        const display = getDisplayValue(value);
        // Only update if the semantic meaning is different to avoid cursor jumps
        // For example, if input is "1.0" and value is 1, don't change input to "1"
        const currentParsed = inputValue === '' ? undefined : (allowFloat ? parseFloat(inputValue) : parseInt(inputValue, 10));
        
        // Complex check:
        // 1. If both are effectively "empty" (undefined/null/0-as-empty), sync.
        // 2. If values differ numerically, sync.
        // 3. If values match numerically, but prop updated (maybe from refresh), we usually leave it unless strictly different?
        //    Actually, simple comparison is safest. If we are editing, local state rules. 
        //    But if parent updates (e.g. reset), we need to reflect.
        //    The key is comparing the *prop* to the *current parsed local value*.
        
        let shouldUpdate = false;
        
        if (value === undefined || value === null) {
            if (inputValue !== '') shouldUpdate = true;
        } else if (value === 0 && treatZeroAsEmpty) {
            if (inputValue !== '') shouldUpdate = true;
        } else {
            // value is a number
            if (currentParsed !== value) {
                shouldUpdate = true;
            }
        }

        if (shouldUpdate) {
            setInputValue(display);
        }
    }, [value, treatZeroAsEmpty, allowFloat]); // Removed inputValue from deps to avoid loop, added logic inside

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (newValue === '') {
            onValueChange(treatZeroAsEmpty ? 0 : undefined);
            return;
        }

        const parsed = allowFloat ? parseFloat(newValue) : parseInt(newValue, 10);
        if (!isNaN(parsed)) {
            onValueChange(parsed);
        }
    };

    return (
        <FormInput 
            type="number" 
            value={inputValue} 
            onChange={handleChange} 
            className={className}
            {...props} 
        />
    );
}
