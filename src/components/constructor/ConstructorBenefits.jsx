import Icon from '../../icons/Icon'

const benefits = [
  ['package', 'Комплект для сборки', 'детали, кромка, фурнитура'],
  ['truck', 'Доставка по Москве', 'внутри МКАД от 6000 ₽'],
  ['shield', 'Гарантия 18 месяцев', 'на комплект мебели'],
  ['tool', 'Сборка по желанию', '+10% к стоимости заказа'],
]

export default function ConstructorBenefits() {
  return (
    <section className="rp-ctor-benefits">
      {benefits.map(([icon, title, text]) => (
        <div className="rp-ctor-benefit" key={title}>
          <span><Icon name={icon} size={17} /></span>
          <p>{title}<small>{text}</small></p>
        </div>
      ))}
    </section>
  )
}
