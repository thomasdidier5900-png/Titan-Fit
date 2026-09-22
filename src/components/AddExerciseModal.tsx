import React, { useState } from 'react';
import { X, Plus, Dumbbell } from 'lucide-react';
import { ExerciseTemplate } from '../types/fitness';
import { parseDefaultWeight } from '../data/defaultProgram';

interface AddExerciseModalProps {
  isOpen: boolean;
  defaultDay?: string;
  defaultSession?: string;
  onClose: () => void;
  onAddExercise: (exercise: ExerciseTemplate) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  defaultDay = 'Jour 1',
  defaultSession = 'PULL 1',
  onClose,
  onAddExercise,
}) => {
  const [daySession, setDaySession] = useState(`${defaultDay}|${defaultSession}`);
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [track, setTrack] = useState('Piste Externe (Étirement)');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState('10 - 12');
  const [load, setLoad] = useState('Haltères 10 - 12 kg');
  const [rir, setRir] = useState('1 - 2');
  const [restSeconds, setRestSeconds] = useState(90);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Veuillez renseigner le nom de l\'exercice.');
      return;
    }

    const [day, session] = daySession.split('|');

    const newExercise: ExerciseTemplate = {
      id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      day,
      session,
      name: name.trim(),
      muscleGroup: muscleGroup.trim() || 'Général',
      track: track.trim() || '-',
      sets: Number(sets) || 4,
      reps: reps.trim() || '10 - 12',
      load: load.trim() || 'Poids du corps',
      defaultWeight: parseDefaultWeight(load),
      rir: rir.trim() || '1 - 2',
      restSeconds: Number(restSeconds) || 90,
      rawRest: `${Math.floor(restSeconds / 60)}'${(restSeconds % 60).toString().padStart(2, '0')}"`,
    };

    onAddExercise(newExercise);
    setErrorMsg('');
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151515] border border-zinc-800 rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#BCE029]/15 border border-[#BCE029]/40 flex items-center justify-center text-[#BCE029]">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-white">Ajouter un Exercice</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-900/50 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-zinc-400 block mb-1 font-semibold">Séance & Jour</label>
            <select
              value={daySession}
              onChange={e => setDaySession(e.target.value)}
              className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
            >
              <option value="Jour 1|PULL 1">Jour 1 - PULL 1</option>
              <option value="Jour 2|PUSH 1">Jour 2 - PUSH 1</option>
              <option value="Jour 3|CORE 1">Jour 3 - CORE 1</option>
              <option value="Jour 4|PULL 2">Jour 4 - PULL 2</option>
              <option value="Jour 5|PUSH 2">Jour 5 - PUSH 2</option>
              <option value="Jour 6|CORE 2">Jour 6 - CORE 2</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 font-semibold">Nom de l'exercice *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Développé incliné aux haltères"
              className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-400 block mb-1">Groupe musculaire</label>
              <input
                type="text"
                value={muscleGroup}
                onChange={e => setMuscleGroup(e.target.value)}
                placeholder="Ex: Pectoraux"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Piste sollicitée</label>
              <input
                type="text"
                value={track}
                onChange={e => setTrack(e.target.value)}
                placeholder="Ex: Piste Externe"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-zinc-400 block mb-1">Séries</label>
              <input
                type="number"
                min={1}
                max={12}
                value={sets}
                onChange={e => setSets(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white text-center font-mono-numbers focus:outline-none focus:border-[#BCE029]"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Répétitions</label>
              <input
                type="text"
                value={reps}
                onChange={e => setReps(e.target.value)}
                placeholder="10 - 12"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white text-center focus:outline-none focus:border-[#BCE029]"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Repos (sec)</label>
              <input
                type="number"
                step={5}
                value={restSeconds}
                onChange={e => setRestSeconds(parseInt(e.target.value, 10) || 60)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white text-center font-mono-numbers focus:outline-none focus:border-[#FF6D00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-400 block mb-1">Charge / Matériel</label>
              <input
                type="text"
                value={load}
                onChange={e => setLoad(e.target.value)}
                placeholder="Haltères 10 - 12 kg"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">RIR cible</label>
              <input
                type="text"
                value={rir}
                onChange={e => setRir(e.target.value)}
                placeholder="1 - 2"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white text-center focus:outline-none focus:border-[#BCE029]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#BCE029] hover:bg-[#A8CE1E] text-black font-extrabold text-xs shadow-md shadow-[#BCE029]/20 transition active:scale-95"
            >
              Ajouter au programme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
