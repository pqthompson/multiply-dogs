import React, { useState } from 'react';
import './App.css';

// Helper to generate all multiplication questions for a number
function getQuestions(number: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    a: number,
    b: i + 1,
    answer: number * (i + 1),
  }));
}

// Helper to generate two close distractors
function getDistractors(correct: number) {
  const set = new Set<number>();
  while (set.size < 2) {
    const offset = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    const sign = Math.random() < 0.5 ? -1 : 1;
    const distractor = correct + sign * offset;
    if (distractor > 0 && distractor !== correct) set.add(distractor);
  }
  return Array.from(set);
}

function getRandomAnimalSource() {
  // 0: fox, 1: dog, 2: duck
  const sources = [
    async () => {
      const res = await fetch('https://randomfox.ca/floof/');
      const data = await res.json();
      return { url: data.image, type: 'image', label: 'Fox' };
    },
    async () => {
      const res = await fetch('https://random.dog/woof.json');
      const data = await res.json();
      const url = data.url;
      if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.gif')) {
        return { url, type: url.endsWith('.gif') ? 'gif' : 'video', label: 'Dog' };
      }
      return { url, type: 'image', label: 'Dog' };
    },
    async () => {
      // Use random-d.uk/api/v2/randomimg with a cache-busting query param
      const randomString = Math.random().toString(36).substring(2, 15);
      const url = `https://random-d.uk/api/v2/randomimg?cachebust=${Date.now()}&random=${randomString}`;
      let type: 'image' | 'gif' | 'video' = 'image';
      if (url.endsWith('.gif')) type = 'gif';
      return { url, type, label: 'Duck' };
    },
  ];
  const idx = Math.floor(Math.random() * sources.length);
  return sources[idx]();
}

function prefetchAnimals(): Promise<{ url: string; type: 'image' | 'video' | 'gif'; label: string }[]> {
  // Prefetch 12 animals in parallel, ensure type is correct
  return Promise.all(
    Array.from({ length: 12 }, async () => {
      const animalObj = await getRandomAnimalSource();
      let type: 'image' | 'gif' | 'video' = 'image';
      if (animalObj.type === 'gif') type = 'gif';
      else if (animalObj.type === 'video') type = 'video';

      // Preload the image or video
      if (type === 'image' || type === 'gif') {
        const img = new Image();
        img.src = animalObj.url;
      } else if (type === 'video') {
        const video = document.createElement('video');
        video.src = animalObj.url;
        video.preload = 'auto';
      }

      return { url: animalObj.url, type, label: animalObj.label };
    })
  );
}

function Home({ onSelect }: { onSelect: (n: number) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleSelect(n: number) {
    setLoading(true);
    await onSelect(n);
    setLoading(false);
  }

  return (
    <div>
      <h1>Multiply Dogs</h1>
      <h2>Select a number to practice</h2>
      {loading && <p>Loading animals...</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', opacity: loading ? 0.5 : 1 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handleSelect(i + 1)}
            disabled={loading}
            style={{
              fontSize: '2rem',
              padding: '1.2em 2.5em',
              minWidth: 100,
              width: '100%',
              background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              marginBottom: 8,
              transition: 'transform 0.1s, background 0.2s',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModeSelection({ onSelect }: { onSelect: (mode: 'sequential' | 'random') => void }) {
  return (
    <div>
      <h2>Select Quiz Mode</h2>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button
          onClick={() => onSelect('sequential')}
          style={{
            fontSize: '1.5rem',
            padding: '1em 2em',
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          Sequential
        </button>
        <button
          onClick={() => onSelect('random')}
          style={{
            fontSize: '1.5rem',
            padding: '1em 2em',
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          Random
        </button>
      </div>
    </div>
  );
}

function GameModeSelection({ onSelect }: { onSelect: (gameMode: 'multipleChoice' | 'keyboard') => void }) {
  return (
    <div>
      <h2>Select Game Mode</h2>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button
          onClick={() => onSelect('multipleChoice')}
          style={{
            fontSize: '1.5rem',
            padding: '1em 2em',
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          Multiple Choice
        </button>
        <button
          onClick={() => onSelect('keyboard')}
          style={{
            fontSize: '1.5rem',
            padding: '1em 2em',
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          Keyboard
        </button>
      </div>
    </div>
  );
}

function Quiz({ number, animals, mode, onFinish }: { number: number; animals: { url: string; type: 'image' | 'video' | 'gif'; label: string }[]; mode: 'sequential' | 'random'; onFinish: () => void }) {
  const [questions] = useState(() => {
    const baseQuestions = getQuestions(number);
    return mode === 'random' ? baseQuestions.sort(() => Math.random() - 0.5) : baseQuestions;
  });
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState<'none' | 'wrong' | 'right'>('none');
  const [choices, setChoices] = useState<number[]>([]);
  const [animal, setAnimal] = useState<{ url: string; type: 'image' | 'video' | 'gif'; label: string } | null>(null);

  const q = questions[current];

  React.useEffect(() => {
    setShowResult('none');
    setAnimal(null);
    const distractors = getDistractors(q.answer);
    const all = [q.answer, ...distractors].sort(() => Math.random() - 0.5);
    setChoices(all);

    // Directly use the preloaded animal
    setAnimal(animals[current]);
  }, [current, q.answer, animals]);

  function handleChoice(choice: number) {
    if (showResult === 'right') return;
    if (choice === q.answer) {
      setShowResult('right');
    } else {
      setShowResult('wrong');
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      onFinish();
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '3rem', margin: '32px 0' }}>
        {q.a} × {q.b} ={' '}
        {showResult === 'none' ? '?' : showResult === 'wrong' ? <span style={{ color: 'red' }}>X</span> : q.answer}
      </h2>
      <div
        style={{
          display: showResult === 'right' ? 'none' : 'flex',
          flexDirection: 'column',
          gap: 24,
          alignItems: 'center',
          margin: '32px 0',
          width: '100%',
          maxWidth: 400,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => handleChoice(c)}
            disabled={showResult === 'right'}
            style={{
              fontSize: '2rem',
              padding: '1.2em 2.5em',
              width: '100%',
              background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              opacity: showResult === 'right' ? 0.5 : 1,
              marginBottom: 8,
              transition: 'transform 0.1s, background 0.2s',
            }}
          >
            {c}
          </button>
        ))}
      </div>
      {showResult === 'right' && animal && (
        <div style={{ margin: '20px 0' }}>
          {animal.type === 'image' || animal.type === 'gif' ? (
            <img src={animal.url} alt={animal.label} style={{ maxWidth: 300, borderRadius: 8 }} />
          ) : (
            <video src={animal.url} autoPlay loop muted playsInline style={{ maxWidth: 300, borderRadius: 8 }} />
          )}
          <div style={{ fontSize: '1.5rem', marginTop: 8 }}>{animal.label}</div>
        </div>
      )}
      {showResult === 'right' && animal && (
        <button
          onClick={handleNext}
          style={{
            marginTop: 16,
            fontSize: '2rem',
            padding: '1em 2.5em',
            minWidth: 180,
            width: '100%',
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            transition: 'transform 0.1s, background 0.2s',
          }}
        >
          {current < questions.length - 1 ? 'Next' : 'Finish'}
        </button>
      )}
    </div>
  );
}

function QuizWithTyping({ number, animals, mode, onFinish }: { number: number; animals: { url: string; type: 'image' | 'video' | 'gif'; label: string }[]; mode: 'sequential' | 'random'; onFinish: () => void }) {
  const [questions] = useState(() => {
    const baseQuestions = getQuestions(number);
    return mode === 'random' ? baseQuestions.sort(() => Math.random() - 0.5) : baseQuestions;
  });
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState<'none' | 'wrong' | 'right'>('none');
  const [inputValue, setInputValue] = useState('');
  const [animal, setAnimal] = useState<{ url: string; type: 'image' | 'video' | 'gif'; label: string } | null>(null);

  const q = questions[current];

  React.useEffect(() => {
    setShowResult('none');
    setAnimal(null);
    setInputValue('');
    setAnimal(animals[current]);
  }, [current, animals]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleSubmit() {
    if (showResult === 'right') return;
    const answer = parseInt(inputValue, 10);
    if (answer === q.answer) {
      setShowResult('right');
    } else {
      setShowResult('wrong');
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      onFinish();
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '3rem', margin: '32px 0' }}>
        {q.a} × {q.b} ={' '}
        {showResult === 'none' ? '?' : showResult === 'wrong' ? <span style={{ color: 'red' }}>X</span> : q.answer}
      </h2>
      <div style={{ margin: '32px 0', textAlign: 'center' }}>
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{
            fontSize: '2rem',
            padding: '0.5em 1em',
            borderRadius: 8,
            border: '2px solid #43cea2',
            textAlign: 'center',
            width: '100%',
            maxWidth: 200,
          }}
          inputMode="numeric"
        />
        <button
          onClick={handleSubmit}
          style={{
            marginLeft: 16,
            fontSize: '2rem',
            padding: '0.5em 1em',
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </div>
      {showResult === 'right' && animal && (
        <div style={{ margin: '20px 0' }}>
          {animal.type === 'image' || animal.type === 'gif' ? (
            <img src={animal.url} alt={animal.label} style={{ maxWidth: 300, borderRadius: 8 }} />
          ) : (
            <video src={animal.url} autoPlay loop muted playsInline style={{ maxWidth: 300, borderRadius: 8 }} />
          )}
          <div style={{ fontSize: '1.5rem', marginTop: 8 }}>{animal.label}</div>
        </div>
      )}
      {showResult === 'right' && animal && (
        <button
          onClick={handleNext}
          style={{
            marginTop: 16,
            fontSize: '2rem',
            padding: '1em 2.5em',
            minWidth: 180,
            width: '100%',
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            transition: 'transform 0.1s, background 0.2s',
          }}
        >
          {current < questions.length - 1 ? 'Next' : 'Finish'}
        </button>
      )}
    </div>
  );
}

function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [animals, setAnimals] = useState<{ url: string; type: 'image' | 'video' | 'gif'; label: string }[] | null>(null);
  const [mode, setMode] = useState<'sequential' | 'random' | null>(null);
  const [gameMode, setGameMode] = useState<'multipleChoice' | 'keyboard' | null>(null);
  const [key, setKey] = useState(0); // for resetting quiz

  function handleSelect(n: number, animals: { url: string; type: 'image' | 'video' | 'gif'; label: string }[]) {
    setSelected(n);
    setAnimals(animals);
  }

  return (
    <div>
      {selected === null || !animals ? (
        <Home
          onSelect={async (n: number) => {
            const animals = await prefetchAnimals();
            handleSelect(n, animals);
          }}
        />
      ) : mode === null ? (
        <ModeSelection onSelect={(selectedMode) => setMode(selectedMode)} />
      ) : gameMode === null ? (
        <GameModeSelection onSelect={(selectedGameMode) => setGameMode(selectedGameMode)} />
      ) : gameMode === 'multipleChoice' ? (
        <Quiz
          key={key}
          number={selected}
          animals={animals}
          mode={mode}
          onFinish={() => {
            setSelected(null);
            setAnimals(null);
            setMode(null);
            setGameMode(null);
            setKey((k) => k + 1);
          }}
        />
      ) : (
        <QuizWithTyping
          key={key}
          number={selected}
          animals={animals}
          mode={mode}
          onFinish={() => {
            setSelected(null);
            setAnimals(null);
            setMode(null);
            setGameMode(null);
            setKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}

export default App;
