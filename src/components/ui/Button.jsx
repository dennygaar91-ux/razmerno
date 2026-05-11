import { Link } from 'react-router-dom';
export default function Button({children,to,variant='primary',className='',...props}){const cls=`btn btn-${variant} ${className}`;return to?<Link className={cls} to={to}>{children}</Link>:<button className={cls} {...props}>{children}</button>}
