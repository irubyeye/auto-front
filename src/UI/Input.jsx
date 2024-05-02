import React, { forwardRef, memo } from 'react';

const Input = ({ callback, type, value, className, required = true, ...props }) => {
	return <input onInput={callback} className={`px-2 border-2 border-solid border-slate-400 rounded-md w-full ${className}`} type={type} value={value} {...props} required={required} />
};

export default Input;