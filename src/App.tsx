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

function extractBreed(url: string): string {
  // Example: https://images.dog.ceo/breeds/wolfhound-irish/n02090721_1918.jpg
  const match = url.match(/breeds\/([^/]+)/);
  if (!match) return '';
  // Convert slug to readable format
  return match[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function Home({ onSelect }: { onSelect: (n: number) => void }) {
  return (
    <div>
      <h1>Multiply Dogs</h1>
      <h2>Select a number to practice</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <button key={i + 1} onClick={() => onSelect(i + 1)} style={{ fontSize: '2rem', padding: '1.2em 2.5em', minWidth: 100 }}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}

function Quiz({ number, onFinish }: { number: number; onFinish: () => void }) {
  const [questions] = useState(() => getQuestions(number));
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState<'none' | 'wrong' | 'right'>('none');
  const [choices, setChoices] = useState<number[]>([]);
  const [dogImages, setDogImages] = useState<string[] | null>(null);

  const q = questions[current];

  // Prefetch 12 dog images on mount
  React.useEffect(() => {
    setDogImages(null);
    fetch('https://dog.ceo/api/breeds/image/random/12')
      .then((r) => r.json())
      .then((data) => {
        setDogImages(data.message);
      });
  }, [number]);

  // Generate choices for each question
  React.useEffect(() => {
    setShowResult('none');
    const distractors = getDistractors(q.answer);
    const all = [q.answer, ...distractors].sort(() => Math.random() - 0.5);
    setChoices(all);
  }, [current, q.answer]);

  function handleChoice(choice: number) {
    if (showResult === 'right') return;
    if (choice === q.answer) {
      setShowResult('right');
      // Remove setDogImages(null); so the dog image stays visible
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

  // Pick the dog image for this question (by index)
  const dogUrl = dogImages ? dogImages[current % dogImages.length] : null;
  const breed = dogUrl ? extractBreed(dogUrl) : '';

  return (
    <div>
      <h2 style={{ fontSize: '3rem', margin: '32px 0' }}>
        {q.a} × {q.b} ={' '}
        {showResult === 'none' ? '?' : showResult === 'wrong' ? <span style={{ color: 'red' }}>X</span> : q.answer}
      </h2>
      <div style={{ display: showResult === 'right' ? 'none' : 'flex', gap: 32, justifyContent: 'center', margin: '32px 0' }}>
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => handleChoice(c)}
            disabled={showResult === 'right'}
            style={{ fontSize: '2rem', padding: '1.2em 2.5em', minWidth: 100 }}
          >
            {c}
          </button>
        ))}
      </div>
      {showResult === 'right' && (
        <div style={{ margin: '20px 0' }}>
          {!dogImages && <p>Loading dog...</p>}
          {dogUrl && (
            <>
              <img src={dogUrl} alt="Dog" style={{ maxWidth: 300, borderRadius: 8 }} />
              <div style={{ fontSize: '1.5rem', marginTop: 8 }}>{breed}</div>
            </>
          )}
        </div>
      )}
      {showResult === 'right' && dogUrl && (
        <button onClick={handleNext} style={{ marginTop: 16, fontSize: '2rem', padding: '1em 2.5em', minWidth: 180 }}>
          {current < questions.length - 1 ? 'Next' : 'Finish'}
        </button>
      )}
    </div>
  );
}

function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [key, setKey] = useState(0); // for resetting quiz

  return (
    <div>
      {selected === null ? (
        <Home onSelect={(n) => { setSelected(n); setKey((k) => k + 1); }} />
      ) : (
        <Quiz
          key={key}
          number={selected}
          onFinish={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default App;
