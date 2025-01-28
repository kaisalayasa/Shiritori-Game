import React from 'react'
import styles from './Card.module.css';

function Card(props) {
  return (

    <div className={styles.CardContainer}>
        <div className={styles.kanji}>

        <p>{props.kanji}</p>
        </div>
        <div className={styles.hiragana}>
            <p>hiragana:{props.reading.slice(0,-1)}<span style={{ color: 'red' }}>{props.reading.slice(-1)}</span></p>
        </div>

    </div>
  )
}

export default Card