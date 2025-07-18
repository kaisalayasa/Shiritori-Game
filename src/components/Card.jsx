import React from 'react'
import styles from './Card.module.css';

function Card(props) {
  // Get Jisho URL for current word
  const getJishoUrl = () => {
    if (!props.kanji || props.kanji === '言葉') return '#';
    return `https://jisho.org/search/${encodeURIComponent(props.kanji)}`;
  };

  return (
    <div className={styles.CardContainer}>
        <div className={styles.kanji}>
            <p>{props.kanji}</p>
        </div>
        <div className={styles.hiragana}>
            <p>hiragana: {props.reading.slice(0,-1)}<span style={{ color: 'red' }}>{props.reading.slice(-1)}</span></p>
        </div>
        <div className={styles.wordInfo}>
            <div className={styles.infoContainer}>
                <div className={styles.infoItem}>
                    <strong>Meaning:</strong> {props.meaning}
                </div>
                <div className={styles.infoItem}>
                    <strong>JLPT Level:</strong> {props.level}
                </div>
                <div className={styles.infoItem}>
                    <strong>Romaji:</strong> {props.romaji}
                </div>
            </div>
            
            {/* Dictionary link inside card */}
            {props.kanji && props.kanji !== '言葉' && (
              <div className={styles.dictionaryLink}>
                <a 
                  href={getJishoUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.dictionaryButton}
                >
                  📖 Look up in Dictionary
                </a>
              </div>
            )}
        </div>
    </div>
  )
}

export default Card