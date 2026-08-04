'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { readDocumentProgress } from '@/components/mdx/TaskCheckbox';

type Candidate = { route: string };

export function ContinueLearningLink({ candidates }: { candidates: Candidate[] }) {
  const [route, setRoute] = React.useState(candidates[0]?.route || '/map');

  React.useEffect(() => {
    const next = candidates.find((candidate) => !readDocumentProgress(candidate.route).completed);
    setRoute(next?.route || candidates[0]?.route || '/map');
  }, [candidates]);

  return (
    <Link href={route} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-teal-700">
      <Play className="h-4 w-4 fill-white" />
      继续学习
    </Link>
  );
}
