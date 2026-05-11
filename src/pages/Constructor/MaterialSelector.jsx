import {materials} from '../../data/materials.js';
export default function MaterialSelector({state,setState}){return <div className="swatch-grid">{materials.map(m=><button key={m.id} title={m.name} className={`swatch ${state.material===m.id?'active':''}`} style={{background:m.color}} onClick={()=>setState({...state,material:m.id})}/>)}</div>}
