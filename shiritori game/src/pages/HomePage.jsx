import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from '../components/Card';
import { convertRomajiToHiragana, isValidShiritoriCharacter, getLastCharacter, areShiritoriCharactersEquivalent, convertSmallToBigKana } from '../utils/romajiConverter';
import styles from './HomePage.module.css';

// Cache for the dictionary to avoid repeated API calls
let cachedDictionary = null;

// Clear cache to force reload with new filtering
const clearDictionaryCache = () => {
  cachedDictionary = null;
};

function HomePage() {
  const [currentWord, setCurrentWord] = useState({
    kanji: '',
    reading: '',
    romaji: '',
    meaning: '',
    level: 5
  });
  
  const [dictionary, setDictionary] = useState([]);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(null);
  const [initialTimer, setInitialTimer] = useState(15);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lose, setLose] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [answer, setAnswer] = useState('');
  const [convertedAnswer, setConvertedAnswer] = useState('');
  const [lastUsedWords, setLastUsedWords] = useState(new Set());
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'success', 'error', 'warning'
  
  const inputRef = useRef(null);

  // Character type checking functions
  const isAllHiragana = (str) => /^[\u3040-\u309F]+$/.test(str);
  const isAllKatakana = (str) => /^[\u30A0-\u30FF]+$/.test(str);

  // Improved dictionary fetching with caching
  const fetchDictionary = useCallback(async () => {
    if (cachedDictionary) {
      setDictionary(cachedDictionary);
      return cachedDictionary;
    }

    setLoading(true);
    try {
      const response = await fetch('https://jlpt-vocab-api.vercel.app/api/words/all');
      const fetchedData = await response.json();

      // Filter valid words for Shiritori with strict validation
      const validWords = fetchedData.filter((entry) => {
        if (!entry.word || !entry.furigana) return false;
        
        // Remove words with parentheses or other non-Japanese characters
        if (entry.furigana.includes('(') || entry.furigana.includes(')') || 
            entry.furigana.includes('（') || entry.furigana.includes('）')) return false;
        
        // Only allow hiragana and katakana characters in furigana
        if (!/^[\u3040-\u309F\u30A0-\u30FF]+$/.test(entry.furigana)) return false;
        
        // Words must be at least 2 characters long
        if (entry.furigana.length < 2) return false;
        
        // Skip words ending with ん (invalid for Shiritori)
        const lastChar = getLastCharacter(entry.furigana);
        if (lastChar === 'ん') return false;
        
        // Skip words starting with invalid Shiritori characters
        const firstChar = entry.furigana.charAt(0);
        if (!isValidShiritoriCharacter(firstChar)) return false;
        
        return true;
      });

      if (validWords.length === 0) {
        throw new Error('No valid words found in dictionary');
      }

      // Cache the dictionary
      cachedDictionary = validWords;
      setDictionary(validWords);
      return validWords;
    } catch (error) {
      console.error('Error fetching dictionary:', error);
      showFeedback('Failed to load dictionary. Please check your connection.', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a random valid starting word
  const getRandomWord = useCallback((currentDictionary = dictionary) => {
    if (currentDictionary.length === 0) return null;
    
    let attempts = 0;
    let randomWord;
    
    do {
      const randomIndex = Math.floor(Math.random() * currentDictionary.length);
      randomWord = currentDictionary[randomIndex];
      attempts++;
    } while (
      attempts < 50 && 
      (!isValidShiritoriCharacter(randomWord.furigana.charAt(0)) || lastUsedWords.has(randomWord.word))
    );
    
    return randomWord;
  }, [dictionary, lastUsedWords]);

  // Set a new word
  const setNewWord = useCallback((word) => {
    if (!word) return;
    
    setCurrentWord({
      kanji: word.word,
      reading: word.furigana,
      romaji: word.romaji,
      meaning: word.meaning,
      level: word.level
    });
    
    setLastUsedWords(prev => new Set([...prev, word.word]));
  }, []);

  // Show feedback to user
  const showFeedback = useCallback((message, type = 'info') => {
    setFeedback(message);
    setFeedbackType(type);
    setTimeout(() => {
      setFeedback('');
      setFeedbackType('');
    }, 3000);
  }, []);

  // Handle input changes with romaji conversion
  const handleAnswer = useCallback((e) => {
    const value = e.target.value;
    setAnswer(value);
    
    // Convert romaji to hiragana in real-time
    const converted = convertRomajiToHiragana(value);
    setConvertedAnswer(converted);
  }, []);

  // Enhanced word validation logic with better romaji support
  const validateAndProcessAnswer = useCallback(() => {
    if (!currentWord.reading) return;

    const trimmedAnswer = answer.trim();
    const trimmedConverted = convertedAnswer.trim();
    
    if (!trimmedAnswer && !trimmedConverted) return;

    // Check length requirement - must be at least 2 characters in hiragana/katakana
    const finalWord = trimmedConverted || trimmedAnswer;
    if (finalWord.length < 2) {
      showFeedback('Words must be at least 2 characters long', 'error');
      return;
    }

    // Get the last character of current word
    const lastChar = getLastCharacter(currentWord.reading);
    
    // Check if answer starts with the correct character
    const answerFirstChar = trimmedConverted.charAt(0) || trimmedAnswer.charAt(0);
    
    if (!areShiritoriCharactersEquivalent(answerFirstChar, lastChar)) {
      showFeedback(`Word must start with "${lastChar}" (or "${convertSmallToBigKana(lastChar)}" if small kana)`, 'error');
      return;
    }

    // Check if the starting character is valid for Shiritori
    if (!isValidShiritoriCharacter(answerFirstChar)) {
      showFeedback(`Words cannot start with "${answerFirstChar}"`, 'error');
      return;
    }

    const foundWord = dictionary.find(word => {
      if (word.word === trimmedAnswer || word.word === trimmedConverted) {
        return true;
      }
      
      if (word.furigana === trimmedAnswer || word.furigana === trimmedConverted) {
        return true;
      }
      
      if (word.romaji) {
        const wordRomaji = word.romaji.toLowerCase().trim();
        const userRomaji = trimmedAnswer.toLowerCase().trim();
        
        if (wordRomaji === userRomaji) {
          return true;
        }
      }
      
      if (trimmedConverted && trimmedConverted === word.furigana) {
        return true;
      }
      
      return false;
    });

    if (foundWord) {
      // Check if word was already used
      if (lastUsedWords.has(foundWord.word)) {
        showFeedback('Word already used! Try a different word.', 'warning');
        return;
      }

      // Valid word found!
      setNewWord(foundWord);
      setStreak(prev => prev + 1);
      setAnswer('');
      setConvertedAnswer('');
      setTimer(initialTimer);
      showFeedback('Correct! +1 point', 'success');
      
      // Focus back to input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      // Find words that start with the correct character for suggestions
      const validStartWords = dictionary.filter(word => 
        word.furigana.charAt(0) === answerFirstChar
      ).slice(0, 3);
      
      if (validStartWords.length > 0) {
        const suggestions = validStartWords.map(w => w.romaji || w.furigana).join(', ');
        showFeedback(`Word "${trimmedAnswer}" not found in dictionary. Try: ${suggestions}`, 'error');
      } else {
        showFeedback('Word not found in dictionary. Try another word.', 'error');
      }
    }
  }, [answer, convertedAnswer, currentWord.reading, dictionary, lastUsedWords, initialTimer, showFeedback, setNewWord]);

  // Start game
  const startGame = useCallback(async () => {
    setLoading(true);
    setLose(false);
    setIsPaused(false);
    setStreak(0);
    setLastUsedWords(new Set());
    setAnswer('');
    setConvertedAnswer('');
    setFeedback('');
    
    // Clear dictionary cache to ensure new filtering rules are applied
    clearDictionaryCache();
    const dict = await fetchDictionary();
    if (dict.length > 0) {
      const firstWord = getRandomWord(dict);
      if (firstWord) {
        setNewWord(firstWord);
        setGameStarted(true);
        setTimer(initialTimer);
        
        // Focus input after a short delay
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    }
    setLoading(false);
  }, [fetchDictionary, getRandomWord, setNewWord, initialTimer, showFeedback]);

  // Stop game
  const pauseGame = useCallback(() => {
    setIsPaused(true);
    showFeedback('Game paused', 'warning');
  }, [showFeedback]);

  // Resume game
  const resumeGame = useCallback(() => {
    setIsPaused(false);
    showFeedback('Game resumed!', 'success');
    
    // Focus input after resuming
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [showFeedback]);

  // Restart game
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Timer setting change
  const timerChange = useCallback((e) => {
    const value = e.target.id;
    const newTimer = value === 'infinite' ? Infinity : Number(value);
    setInitialTimer(newTimer);
    setTimer(newTimer);
  }, []);

  // Handle form submission (Enter key)
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (gameStarted && !lose && !loading) {
      validateAndProcessAnswer();
    }
  }, [gameStarted, lose, loading, validateAndProcessAnswer]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    
    if (gameStarted && !isPaused && timer > 0 && timer !== Infinity) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setLose(true);
            setGameStarted(false);
            setIsPaused(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, isPaused, timer, showFeedback]);

  // Load dictionary on component mount
  useEffect(() => {
    fetchDictionary();
  }, [fetchDictionary]);

  return (
    <div className={styles.Main_container}>
      {loading && (
        <div className={styles.Loading_overlay}>
          <div className={styles.Loading_spinner}>Loading...</div>
        </div>
      )}
      
      <div className={styles.Game_section}>
        <Card
          kanji={currentWord.kanji || '言葉'}
          reading={currentWord.reading || 'ふりがな'}
          meaning={currentWord.meaning || 'Start the game to see word meanings'}
          level={currentWord.level || 'N/A'}
          romaji={currentWord.romaji || 'N/A'}
        />
      </div>

      <div className={styles.User_guess}>
        <div className={styles.Game_hud}>
          <div className={styles.Stat}>
            <h3>Streak: {streak}</h3>
          </div>
          <div className={styles.Stat}>
            <h3>{timer === Infinity ? '∞' : (timer || initialTimer)}s</h3>
          </div>
        </div>

        {feedback && (
          <div className={`${styles.Feedback} ${styles[feedbackType]}`}>
            {feedback}
          </div>
        )}

        {lose && (
          <div className={styles.Game_over}>
            <h2>Game Over!</h2>
            <p>Final Score: {streak}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.Input_form}>
          <input
            ref={inputRef}
            onChange={handleAnswer}
            value={answer}
            className={styles.User_input}
            type="text"
            placeholder={currentWord.reading ? `Start with "${getLastCharacter(currentWord.reading)}"${getLastCharacter(currentWord.reading) !== convertSmallToBigKana(getLastCharacter(currentWord.reading)) ? ` or "${convertSmallToBigKana(getLastCharacter(currentWord.reading))}"` : ''}` : 'Enter a word...'}
            disabled={!gameStarted || isPaused || lose || loading}
            autoComplete="off"
          />
          {convertedAnswer && convertedAnswer !== answer && (
            <div className={styles.Romaji_preview}>
              Converted: {convertedAnswer}
            </div>
          )}
        </form>

        <div className={styles.Game_controls}>
          {lose ? (
            <button 
              onClick={restartGame} 
              disabled={loading}
              className={styles.Primary_button}
            >
              Play Again
            </button>
          ) : !gameStarted ? (
            <button 
              onClick={startGame} 
              disabled={loading}
              className={styles.Primary_button}
            >
              Start Game
            </button>
          ) : (
            <>
              <button 
                onClick={startGame} 
                disabled={loading}
                className={styles.Primary_button}
              >
                New Game
              </button>
              <button 
                onClick={isPaused ? resumeGame : pauseGame} 
                disabled={loading}
                className={styles.Secondary_button}
              >
                {isPaused ? 'Resume Game' : 'Pause'}
              </button>
            </>
          )}
        </div>

      </div>

      <div className={styles.Settings}>
        <div className={styles.time}>
          <h2>Timer Settings:</h2>
          <div className={styles.time_buttons}>
            <button 
              onClick={timerChange} 
              id="5"
              className={initialTimer === 5 ? styles.Active : ''}
            >
              5s
            </button>
            <button 
              onClick={timerChange} 
              id="10"
              className={initialTimer === 10 ? styles.Active : ''}
            >
              10s
            </button>
            <button 
              onClick={timerChange} 
              id="15"
              className={initialTimer === 15 ? styles.Active : ''}
            >
              15s
            </button>
            <button 
              onClick={timerChange} 
              id="infinite"
              className={initialTimer === Infinity ? styles.Active : ''}
            >
              ∞
            </button>
          </div>
        </div>
        
        <div className={styles.Instructions}>
          <h3>How to Play:</h3>
          <ul>
            <li>Enter a Japanese word that starts with the last character of the current word</li>
            <li>You can type in romaji (it will be converted automatically)</li>
            <li>Words must be at least 2 characters long</li>
            <li>Cannot use words starting with ん</li>
            <li>Cannot repeat words</li>
            <li>Example: If current word ends with き, type "kare" (romaji) or "かれ" (hiragana)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
