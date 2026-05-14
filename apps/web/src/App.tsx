import { Layout } from './components/Layout';
import { Card } from './components/Card';
import { Button } from './components/Button';

function App() {
  return (
    <Layout>
      <Card title="Welcome">
        <p className="text-gray-600 mb-4">Your habits, tracked daily.</p>
        <Button>Get Started</Button>
      </Card>
    </Layout>
  );
}

export default App;
