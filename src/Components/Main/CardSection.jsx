import React from 'react'
import CardData from "../../Assets/CardData"
import Card from './Card'

const CardSection = () => {
  return (
    <div>
      <div className='flex flex-wrap gap-2  pt-8 mb-10 justify-center'>
        {CardData.map((card) => {
                return <div key={card.id}>
                    <Card id={card.id} name={card.name} image={card.image} status={card.status} />
                </div>
            })}
      </div>
    </div>
  )
}

export default CardSection