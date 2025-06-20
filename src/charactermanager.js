import React, { useState, useEffect } from 'react';
import attributecontrols from './attributecontrols';
import { ATTRIBUTE_LIST, SKILL_LIST } from './consts';


const API_URL = 'https://recruiting.verylongdomaintotestwith.ca/api/spoonawa/character';

const createNewCharacter = () => ({
  name: `Character ${Date.now()}`,
  attributes: ATTRIBUTE_LIST.reduce((acc, attr) => {
    acc[attr] = 9;
    return acc;
  }, {}),
  skillPointsSpent: SKILL_LIST.reduce((acc, skill) => {
    acc[skill.name] = 0;
    return acc;
  }, {}),
});

const CharacterManager = () => {
  const [characters, setCharacters] = useState([createNewCharacter()]);

  const updateCharacter = (index, newCharacterData) => {
    setCharacters((prev) =>
      prev.map((char, i) => (i === index ? { ...char, ...newCharacterData } : char))
    );
  };

  const removeCharacter = (index) => {
    setCharacters((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [createNewCharacter()];
    });
  };

  const saveCharacters = async () => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characters),
      });
      alert('Characters saved!');
    } catch (error) {
      alert('Save failed.');
    }
  };

  const loadCharacters = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCharacters(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const addCharacter = () => {
    setCharacters((prev) => [...prev, createNewCharacter()]);
  };

  return (
    <div>
      <h1>Character Manager</h1>
      <button onClick={addCharacter}>+ Add Character</button>
      <button onClick={saveCharacters} style={{ marginLeft: '1rem' }}>
        Save All Characters
      </button>

      {characters.map((char, index) => (
        <div key={index} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}>
          <h2>{char.name || `Character ${index + 1}`}</h2>
          <button
            onClick={() => removeCharacter(index)}
            style={{ marginBottom: '1rem', color: 'red' }}
          >
            Remove Character
          </button>

          <CharacterEditor
            character={char}
            updateCharacter={(newData) => updateCharacter(index, newData)}
          />
        </div>
      ))}
    </div>
  );
};

export default CharacterManager;
