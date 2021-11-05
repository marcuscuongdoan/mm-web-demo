import './App.scss';
import IdleCharacter from './components/IdleCharacter';
import CharacterSelect from './components/CharacterSelect';
import World from "./components/World";

function App() {
  return (
    <div className="App">
      <CharacterSelect />
      <IdleCharacter />
      <World />
    </div>
  );
}

export default App;
