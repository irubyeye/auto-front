import React from 'react';

const Input = ({ callback, type, value, className, required = true, ...props }) => {
	return <input onInput={callback} className={`px-2 border-2 border-solid border-slate-400 dark:border-zinc-500 rounded-md w-full dark:bg-zinc-700 dark:text-orange-400 ${className}`} type={type} value={value} {...props} required={required} />
};

export default Input;