import React from 'react';

const Input = ({ callback, type, value, className, required = true, ...props }) => {
	return <input onInput={callback} className={`px-2 w-full border-2 border-solid rounded-md border-slate-400 bg-slate-200 dark:border-zinc-500 dark:bg-zinc-700 dark:text-orange-400 ${className}`} type={type} value={value} {...props} required={required} />
};

export default Input;