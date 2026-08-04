import { getContentIndex } from '@/lib/content';
import { SearchClient } from '@/components/search/SearchClient';

export default async function SearchPage() {
  const entries = await getContentIndex();
  return <SearchClient entries={entries} />;
}
