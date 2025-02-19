import SessionPage from '../../../src/presentation/components/SessionPage';

export default function SessionPageRoute({ params }: { params: { id: string } }) {
  return <SessionPage params={params} />;
} 