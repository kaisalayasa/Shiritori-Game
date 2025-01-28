import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import styles from './HomePage.module.css';

function HomePage() {
  const [kanji, setKanji] = useState('');
  const [reading, setReading] = useState('');
  const [romaji, setRomaji] = useState('');
  const [level, setLevel] = useState(5);
  const [dictionary, setDictionary] = useState([]);
  const [data, setData] = useState(null);
  const [streak, setStreak] = useState(0);

  const [timer, setTimer] = useState(null);
  const [initialTimer, setInitialTimer] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [lose, setLose] = useState(false);

  const [answer, setAnswer] = useState('');
  const [meaning, setMeaning] = useState('');

  const isAllHiragana = (str) => /^[\u3040-\u309F]+$/.test(str);
  const isAllKatakana = (str) => /^[\u30A0-\u30FF]+$/.test(str);

  const handleAnswer = (e) => {
    setAnswer(e.target.value);
  };

  const fetchDictionary = async () => {
    try {
      const response = await fetch('https://jlpt-vocab-api.vercel.app/api/words/all');
      const fetchedData = await response.json();

      const validWords = fetchedData.filter((entry) => {
        if (!entry.word) return false;
        return !isAllHiragana(entry.word) && !isAllKatakana(entry.word);
      });

      if (validWords.length === 0) {
        console.warn('No valid words found (all were purely hiragana/katakana)!');
        return;
      }

      setDictionary(validWords);
      const randomIndex = Math.floor(Math.random() * validWords.length);
      const fetchedkanji = validWords?.[randomIndex].word;
      const fetchedReading = validWords?.[randomIndex].furigana;
      const fetchedRomaji = validWords?.[randomIndex].romaji;
      const fetchedLevel = validWords?.[randomIndex].level;
      const fetchedMeaning = validWords?.[randomIndex].meaning;

      setKanji(fetchedkanji);
      setReading(fetchedReading);
      setLevel(fetchedLevel);
      setRomaji(fetchedRomaji);
      setMeaning(fetchedMeaning);
    } catch (error) {
      console.error('error fetching random word data', error);
    }
  };

  let dictionaryLength = dictionary.length;


  const findword = () => {
    const lastReadingChar = reading.slice(-1);
    const lastRomajiChar = romaji.slice(-1);
    const lastKanjiChar = kanji.slice(-1);

    const firstCharAnswer = answer.slice(0, 1);

 
    if (
      firstCharAnswer === lastReadingChar ||
      firstCharAnswer === lastKanjiChar ||
      firstCharAnswer === lastRomajiChar
    ) {
      for (let i = 0; i < dictionaryLength; i++) {
        if (
          dictionary[i]?.word === answer ||
          dictionary[i]?.romaji === answer ||
          dictionary[i]?.furigana === answer
        ) {
          const randomnum = Math.floor(Math.random() * dictionaryLength);

          const newkanji = dictionary?.[randomnum].word;
          const newReading = dictionary?.[randomnum].furigana;
          const newRomaji = dictionary?.[randomnum].romaji;
          const newLevel = dictionary?.[randomnum].level;
          const newMeaning = dictionary?.[randomnum].meaning;

          setStreak((s) => s + 1);

        
          setAnswer('');

         
          setTimer(initialTimer !== null ? initialTimer : 15);

          setKanji(newkanji);
          setReading(newReading);
          setLevel(newLevel);
          setRomaji(newRomaji);
          setMeaning(newMeaning);
          break; 
        }
      }
    }
  };


  useEffect(() => {
    if (gameStarted) {
      fetchDictionary();
    }
  }, [gameStarted]);

  
  useEffect(() => {
    if (!gameStarted) return;
    if (answer.length > 2) {
      findword();
    }
  }, [answer, gameStarted]);


  function startGame() {
    setGameStarted(true);
    setLose(false);
    if (timer === null) {
      setTimer(15);
      setInitialTimer(15);
    }
  }

  function stopGame() {
    setGameStarted(false);
  }

  function restartGame() {
    setLose(false);
    setStreak(0);
    setAnswer('');
    setTimer(initialTimer !== null ? initialTimer : 15);
    fetchDictionary();
    setGameStarted(true);
  }

 
  function timerchange(e) {
    const value = e.target.id;
    if (value === 'infinite') {
      setInitialTimer(Infinity);
      setTimer(Infinity);
    } else {
      setInitialTimer(Number(value));
      setTimer(Number(value));
    }
  }

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0 && gameStarted && timer !== Infinity) {
        setTimer((t) => t - 1);
      } else {
        if (timer === 0 && gameStarted) {
          setLose(true);
        }
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, gameStarted]);

  return (
    <div className={styles.Main_container}>
      <div>
        <Card
          kanji={kanji || '言葉'}
          reading={reading || 'ふりがな'}
        />
      </div>

      <div className={styles.User_guess}>
        <div className={styles.Game_hud}>
          <div>
            <h3>streak: {streak}</h3>
          </div>
          <div>
            <h3>{timer === Infinity ? 'infinity' : timer}</h3>
          </div>
        </div>

        {lose && (
          <div>
            <h2 style={{ color: 'red' }}>You lose!</h2>
            <button
              onClick={restartGame}
              style={{
                marginTop: '5px',
                marginBottom: '10px',
                width: '100px',
                padding: '20px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                border: 'none',
                backgroundColor: '#7d8288',
                borderRadius: '3px',
                color: '#343a40',
                cursor: 'pointer',
              }}
            >
              Restart
            </button>
          </div>
        )}

        <div>
          <input
            id="answer"
            onChange={handleAnswer}
            value={answer}
            className={styles.User_input}
            type="text"
            placeholder={reading ? reading.slice(-1) : ''}
            disabled={!gameStarted || lose}
          />
        </div>

        <div className={styles.Modes}>
          <h1>Meaning: {meaning || ''}</h1>
          <br />
          <h1>JLPT Level: {level || ''}</h1>
        </div>
      </div>

      <div className={styles.Settings}>
        <div className={styles.main_menu}>
          <button onClick={startGame}>play</button>
          <button onClick={stopGame}>pause</button>
        </div>

        <div className={styles.time}>
          <h1>Time Settings:</h1>
          <div className={styles.time_buttons}>
            <button onClick={timerchange} id="5">
              5s
            </button>
            <button onClick={timerchange} id="10">
              10s
            </button>
            <button onClick={timerchange} id="15">
              15s
            </button>
            <button onClick={timerchange} id="infinite">
              unlimited
            </button>
          </div>
          <div>
            <h2>instructions:</h2>
            <h3>write a word that starts with the last letter of the previous word.</h3>
            <h3>word has to be at least 3 letters</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
