export default function Input({label,type='text',className='',...props}){return <div className="field"><label>{label}</label><input className={`input ${className}`} type={type} {...props}/></div>}
