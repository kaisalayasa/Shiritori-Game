import React from 'react'
import styles from './Navbar.module.css'





function Navbar() {
  return (
    <> 
    <header className={styles.header}>
        <nav className={styles.nav}>
            <div>
            <a href="https://en.wikipedia.org/wiki/Shiritori">SHIRITORI</a>
            </div>
            <div>
            <a href="https://github.com/kaisalayasa/Shiritori-Game">Github</a>
            </div>
            
        </nav>
    </header>
    </>
   
    
  )
}

export default Navbar
