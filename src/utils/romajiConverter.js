// Romaji to Hiragana conversion utility
const romajiToHiragana = {
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を',
  'n': 'ん', 'nn': 'ん',
  // Extended combinations
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
  // Additional common combinations
  'dji': 'ぢ', 'dzu': 'づ',
  'shi': 'し', 'chi': 'ち', 'tsu': 'つ',
  'fu': 'ふ', 'hu': 'ふ', // Both fu and hu map to ふ
};

const smallToBigKana = {
  'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
  'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ',
  'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
  'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ',
  'っ': 'つ', 'ッ': 'ツ',
  'ゎ': 'わ', 'ヮ': 'ワ'
};

export const convertSmallToBigKana = (char) => {
  return smallToBigKana[char] || char;
};

export const areShiritoriCharactersEquivalent = (char1, char2) => {
  if (char1 === char2) return true;
  if (convertSmallToBigKana(char1) === char2) return true;
  if (convertSmallToBigKana(char2) === char1) return true;
  return false;
};

export const convertRomajiToHiragana = (input) => {
  if (!input) return '';
  
  let result = '';
  let i = 0;
  const text = input.toLowerCase();
  
  while (i < text.length) {
    let matched = false;
    
    // Check for doubled consonants (small tsu handling)
    if (i + 1 < text.length) {
      const currentChar = text.charAt(i);
      const nextChar = text.charAt(i + 1);
      
      // List of consonants that can be doubled
      const consonants = ['k', 't', 's', 'p', 'b', 'g', 'd', 'z', 'r', 'm', 'n', 'h', 'w', 'y'];
      
      // Check if we have a doubled consonant (except for special cases)
      if (currentChar === nextChar && consonants.includes(currentChar)) {
        // Special cases that shouldn't be treated as doubled consonants
        if (currentChar === 'n') {
          // 'nn' should become 'ん', not 'っn'
          // Let the regular conversion handle this
        } else {
          // Add small tsu (っ) and move to the next character
          result += 'っ';
          i += 1;
          matched = true;
          continue;
        }
      }
    }
    
    // Try 4-character combinations first
    if (i + 3 < text.length && !matched) {
      const fourChar = text.slice(i, i + 4);
      if (romajiToHiragana[fourChar]) {
        result += romajiToHiragana[fourChar];
        i += 4;
        matched = true;
        continue;
      }
    }
    
    // Try 3-character combinations
    if (i + 2 < text.length && !matched) {
      const threeChar = text.slice(i, i + 3);
      if (romajiToHiragana[threeChar]) {
        result += romajiToHiragana[threeChar];
        i += 3;
        matched = true;
        continue;
      }
    }
    
    // Try 2-character combinations
    if (i + 1 < text.length && !matched) {
      const twoChar = text.slice(i, i + 2);
      if (romajiToHiragana[twoChar]) {
        result += romajiToHiragana[twoChar];
        i += 2;
        matched = true;
        continue;
      }
    }
    
    // Try single character
    if (!matched) {
      const oneChar = text.charAt(i);
      if (romajiToHiragana[oneChar]) {
        result += romajiToHiragana[oneChar];
        i += 1;
        matched = true;
      } else {
        // If no conversion found, keep the original character
        result += oneChar;
        i += 1;
      }
    }
  }
  
  return result;
};

export const isValidShiritoriCharacter = (char) => {
  // Characters that cannot start a word in Shiritori
  const invalidStartChars = ['ん', 'ン'];
  return !invalidStartChars.includes(char);
};

export const getLastCharacter = (word) => {
  if (!word) return '';
  
  // Handle katakana to hiragana conversion for comparison
  const katakanaToHiragana = {
    'ア': 'あ', 'イ': 'い', 'ウ': 'う', 'エ': 'え', 'オ': 'お',
    'カ': 'か', 'キ': 'き', 'ク': 'く', 'ケ': 'け', 'コ': 'こ',
    'ガ': 'が', 'ギ': 'ぎ', 'グ': 'ぐ', 'ゲ': 'げ', 'ゴ': 'ご',
    'サ': 'さ', 'シ': 'し', 'ス': 'す', 'セ': 'せ', 'ソ': 'そ',
    'ザ': 'ざ', 'ジ': 'じ', 'ズ': 'ず', 'ゼ': 'ぜ', 'ゾ': 'ぞ',
    'タ': 'た', 'チ': 'ち', 'ツ': 'つ', 'テ': 'て', 'ト': 'と',
    'ダ': 'だ', 'ヂ': 'ぢ', 'ヅ': 'づ', 'デ': 'で', 'ド': 'ど',
    'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の',
    'ハ': 'は', 'ヒ': 'ひ', 'フ': 'ふ', 'ヘ': 'へ', 'ホ': 'ほ',
    'バ': 'ば', 'ビ': 'び', 'ブ': 'ぶ', 'ベ': 'べ', 'ボ': 'ぼ',
    'パ': 'ぱ', 'ピ': 'ぴ', 'プ': 'ぷ', 'ペ': 'ぺ', 'ポ': 'ぽ',
    'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も',
    'ヤ': 'や', 'ユ': 'ゆ', 'ヨ': 'よ',
    'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ',
    'ワ': 'わ', 'ヰ': 'ゐ', 'ヱ': 'ゑ', 'ヲ': 'を',
    'ン': 'ん'
  };
  
  const lastChar = word.slice(-1);
  return katakanaToHiragana[lastChar] || lastChar;
}; 