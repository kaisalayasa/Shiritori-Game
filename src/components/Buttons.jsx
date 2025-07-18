import React from 'react'
import styles from './Buttons.module.css'
function Buttons(props) {
  return (
    <button className={styles.Jlpt_button}>{props.level}</button>
  )
}

export default Buttons