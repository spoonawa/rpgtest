import React, { useEffect, useState } from 'react';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';

const API_URL = 'https://recruiting.verylongdomaintotestwith.ca/api/spoonawa/character';
const ATTRIBUTE_CAP = 70;

const AttributeControls = () => {
  const [attributes, setAttributes] = useState(
    ATTRIBUTE_LIST.reduce((acc, attr) => {
      acc[attr] = 9;
      return acc;
    }, {})
  );

  const [skillPointsSpent, setSkillPointsSpent] = useState(
    SKILL_LIST.reduce((acc, skill) => {
      acc[skill.name] = 0;
      return acc;
    }, {})
  );

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(SKILL_LIST[0].name);
  const [dcValue, setDcValue] = useState(10);
  const [rollResult, setRollResult] = useState(null);
  const [rollOutcome, setRollOutcome] = useState(null);

  const getModifier = (value) => Math.floor((value - 10) / 2);
  const getTotalAvailableSkillPoints = () =>
    10 + 4 * getModifier(attributes.Intelligence);
  const getTotalPointsSpent = () =>
    Object.values(skillPointsSpent).reduce((sum, val) => sum + val, 0);
  const getTotalAttributePoints = () =>
    Object.values(attributes).reduce((sum, val) => sum + val, 0);

  const incrementAttr = (attr) => {
    if (getTotalAttributePoints() >= ATTRIBUTE_CAP) return;
    setAttributes((prev) => ({ ...prev, [attr]: prev[attr] + 1 }));
  };

  const decrementAttr = (attr) => {
    setAttributes((prev) => ({ ...prev, [attr]: Math.max(0, prev[attr] - 1) }));
  };

  const incrementSkill = (skillName) => {
    if (getTotalPointsSpent() >= getTotalAvailableSkillPoints()) return;
    setSkillPointsSpent((prev) => ({
      ...prev,
      [skillName]: prev[skillName] + 1,
    }));
  };

  const decrementSkill = (skillName) => {
    setSkillPointsSpent((prev) => ({
      ...prev,
      [skillName]: Math.max(0, prev[skillName] - 1),
    }));
  };

  const qualifiesForClass = (className) => {
    const requirements = CLASS_LIST[className];
    return ATTRIBUTE_LIST.every(
      (attr) => attributes[attr] >= requirements[attr]
    );
  };

  const toggleClass = (className) => {
    setSelectedClass((prev) => (prev === className ? null : className));
  };

  const handleSkillCheckRoll = () => {
    const skill = SKILL_LIST.find((s) => s.name === selectedSkill);
    const attrMod = getModifier(attributes[skill.attributeModifier]);
    const points = skillPointsSpent[selectedSkill];
    const totalSkill = attrMod + points;

    const dieRoll = Math.floor(Math.random() * 20) + 1;
    const total = dieRoll + totalSkill;

    setRollResult(dieRoll);
    setRollOutcome(total >= dcValue ? 'Success' : 'Failure');
  };

  const saveCharacter = async () => {
    const data = { attributes, skillPointsSpent };
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save character');
      alert('Character saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving character');
    }
  };

  const loadCharacter = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to load character');
      const data = await res.json();
      if (data.attributes) setAttributes(data.attributes);
      if (data.skillPointsSpent) setSkillPointsSpent(data.skillPointsSpent);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCharacter();
  }, []);

  const remainingAttributePoints = ATTRIBUTE_CAP - getTotalAttributePoints();
  const remainingSkillPoints = getTotalAvailableSkillPoints() - getTotalPointsSpent();

  return (
    <div>
      <h2>Attribute Controls</h2>
      <p>
        Attribute points remaining: {remainingAttributePoints} / {ATTRIBUTE_CAP}
      </p>
      <ul>
        {ATTRIBUTE_LIST.map((attr) => (
          <li key={attr}>
            <strong>{attr}</strong>: {attributes[attr]}{' '}
            (<em>
              Modifier: {getModifier(attributes[attr]) >= 0 ? '+' : ''}
              {getModifier(attributes[attr])}
            </em>){' '}
            <button onClick={() => decrementAttr(attr)}>-</button>
            <button
              onClick={() => incrementAttr(attr)}
              disabled={remainingAttributePoints <= 0}
            >
              +
            </button>
          </li>
        ))}
      </ul>

      <h2>Available Classes</h2>
      <ul>
        {Object.entries(CLASS_LIST).map(([className, requirements]) => {
          const qualifies = qualifiesForClass(className);
          const isSelected = selectedClass === className;

          return (
            <li
              key={className}
              style={{
                fontWeight: qualifies ? 'bold' : 'normal',
                color: qualifies ? 'green' : 'gray',
                cursor: 'pointer',
                marginBottom: '0.5rem',
              }}
              onClick={() => toggleClass(className)}
            >
              {className} {qualifies && '✓'}
              {isSelected && (
                <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  {ATTRIBUTE_LIST.map((attr) => (
                    <li key={attr}>
                      {attr}: {requirements[attr]}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <h2>Skills</h2>
      <p>
        Skill points remaining: {remainingSkillPoints} / {getTotalAvailableSkillPoints()}
      </p>
      <ul>
        {SKILL_LIST.map((skill) => {
          const attrMod = getModifier(attributes[skill.attributeModifier]);
          const points = skillPointsSpent[skill.name];
          const total = points + attrMod;

          return (
            <li key={skill.name}>
              <strong>{skill.name}</strong> — Points: {points}{' '}
              <button onClick={() => decrementSkill(skill.name)}>-</button>
              <button
                onClick={() => incrementSkill(skill.name)}
                disabled={remainingSkillPoints <= 0}
              >
                +
              </button>{' '}
              Modifier ({skill.attributeModifier.slice(0, 3)}):{' '}
              {attrMod >= 0 ? '+' : ''}
              {attrMod} — <strong>Total: {total}</strong>
            </li>
          );
        })}
      </ul>

      <h2>Skill Check</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Skill:
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            {SKILL_LIST.map((skill) => (
              <option key={skill.name} value={skill.name}>
                {skill.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          DC (Difficulty Class):
          <input
            type="number"
            min="0"
            value={dcValue}
            onChange={(e) => setDcValue(parseInt(e.target.value) || 0)}
            style={{ marginLeft: '0.5rem', width: '60px' }}
          />
        </label>
      </div>

      <button onClick={handleSkillCheckRoll}>Roll</button>

      {rollResult !== null && (
        <div style={{ marginTop: '1rem' }}>
          <p>Rolled: {rollResult}</p>
          <p>
            Total (roll + skill):{' '}
            {rollResult +
              getModifier(
                attributes[
                  SKILL_LIST.find((s) => s.name === selectedSkill)
                    .attributeModifier
                ]
              ) +
              skillPointsSpent[selectedSkill]}
          </p>
          <p>
            {rollOutcome === 'Success' ? (
              <strong style={{ color: 'green' }}>Success!</strong>
            ) : (
              <strong style={{ color: 'red' }}>Failure</strong>
            )}
          </p>
        </div>
      )}

      <br />
      <button onClick={saveCharacter}>Save Character</button>
    </div>
  );
};

export default AttributeControls;
