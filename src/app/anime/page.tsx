import { MediaPage } from "@/components/MediaPage";

export default function AnimePage() {
  return (
    <MediaPage
      mediaType="ANIME"
      apiPath="/api/anime"
      title="ANIME"
      subtitle="Ta collection d'anime — découvre les saisons en cours"
    />
  );
}
