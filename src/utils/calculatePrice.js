import { materials, hardware } from '../data/materials.js';
export function calculatePrice(state){
  const mat=materials.find(m=>m.id===state.material)||materials[0];
  const hw=hardware.find(h=>h.id===state.hardware)||hardware[0];
  const area=(state.width*state.height*2+state.width*state.depth*4+state.height*state.depth*2)/1000000;
  const filling=state.shelves*850+state.drawers*2100+state.bars*650+(state.closers?1800:0)+(state.legs?900:0);
  const base=area*5200*mat.priceFactor+filling*hw.factor+9500;
  const total=Math.round(base/100)*100;
  const parts=8+state.shelves+state.drawers*4+state.bars+(state.legs?4:0);
  return {total,parts,area:area.toFixed(2),formatted:new Intl.NumberFormat('ru-RU').format(total)+' ₽',material:mat,hardware:hw};
}
