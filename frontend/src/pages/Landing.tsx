import { Link } from 'react-router-dom';
import { Button } from '../components/ui/components';
import { Leaf } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="flex justify-center mb-4">
          <div className="bg-primary p-4 rounded-full text-white">
            <Leaf size={48} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-text">Smart Procurement Centre</h1>
        <p className="text-muted text-lg">
          A centralized digital platform solving long waiting times at procurement centres with real-time queue management.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <Link to="/farmer/login">
            <Button className="w-full h-14 text-lg">Farmer Portal</Button>
          </Link>
          <Link to="/operator/login">
            <Button variant="outline" className="w-full h-14 text-lg border-primary text-primary">Operator Portal</Button>
          </Link>
          <Link to="/admin/login">
            <Button variant="ghost" className="w-full h-14 text-lg">Admin Portal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
