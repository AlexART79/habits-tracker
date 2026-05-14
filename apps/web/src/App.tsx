import { AuthShell } from './components/AuthShell';
import { Card } from './components/Card';
import { Button } from './components/Button';

function App() {
  return (
    <AuthShell>
      <Card title="Welcome">
        <p className="text-gray-600 mb-4">Your habits, tracked daily.</p>
        <Button>Get Started</Button>
      </Card>
    </AuthShell>
  );
}

export default App;
